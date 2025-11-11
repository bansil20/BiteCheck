import os
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

from models import db, Student, Timetable, Attendance, food, Feedback
from flask_migrate import Migrate
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# ================= DATABASE CONFIG =================
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost:3306/bitecheck"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
migrate = Migrate(app, db)

# ================= INITIALIZE DB =================
with app.app_context():
    db.create_all()

# ================= FACE DATA CONFIG =================
DATASET_PATH = "faces_dataset"
if not os.path.exists(DATASET_PATH):
    os.makedirs(DATASET_PATH)

HAAR_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
TRAINER_PATH = "trainer.yml"


# -------------------- HELPERS --------------------
def decode_image(img_data):
    """Convert base64 from React to OpenCV image"""
    img_data = img_data.split(",")[1]  # remove data:image/jpeg;base64,
    nparr = np.frombuffer(base64.b64decode(img_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


def train_or_update_recognizer(new_student_id):
    """
    Update the recognizer incrementally when a new student is added.
    Re-trains including all folders but avoids losing previous learned data.
    """
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    face_samples = []
    ids = []

    # Load all student folders
    for folder in os.listdir(DATASET_PATH):
        student_id = int(folder.split("_")[0])
        folder_path = os.path.join(DATASET_PATH, folder)

        for image_name in os.listdir(folder_path):
            img_path = os.path.join(folder_path, image_name)
            img = Image.open(img_path).convert("L")  # grayscale
            img_np = np.array(img, "uint8")

            faces = HAAR_CASCADE.detectMultiScale(img_np)
            for (x, y, w, h) in faces:
                face_samples.append(img_np[y:y + h, x:x + w])
                ids.append(student_id)

    if len(face_samples) == 0:
        print("❌ No faces found in dataset. Train aborted.")
        return

    # Train model again including all known faces
    recognizer.train(face_samples, np.array(ids))
    recognizer.write(TRAINER_PATH)
    print(f"✅ Model trained/updated successfully. Total students: {len(set(ids))}")


# -------------------- ROUTES --------------------
@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.get_json()
    img_data = data.get("studface")
    print("Received data: ", data)

    if not img_data:
        return jsonify({"message": "❌ No face image provided"}), 400

    # Save student info to DB
    new_student = Student(
        studname=data.get("studname"),
        studpnr=int(data.get("studpnr", 0)),
        studphone=int(data.get("studphone", 0)),
        studcourse=data.get("studcourse"),
        studemail=data.get("studemail"),
        studbloodgrp=data.get("studbloodgrp"),
        studremark=data.get("studremark"),
        studhostelroom=data.get("studhostelroom"),
        studface={"base64": img_data}
    )
    db.session.add(new_student)
    db.session.commit()

    # Decode face image
    image = decode_image(img_data)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = HAAR_CASCADE.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return jsonify({"message": "❌ No face detected"}), 400

    # Create dataset folder for this student
    student_folder = os.path.join(DATASET_PATH, f"{new_student.studid}_{new_student.studname}")
    os.makedirs(student_folder, exist_ok=True)

    # Save cropped face
    for i, (x, y, w, h) in enumerate(faces):
        face_img = gray[y:y + h, x:x + w]
        cv2.imwrite(os.path.join(student_folder, f"face_{i}.jpg"), face_img)

    # Train or update recognizer
    train_or_update_recognizer(new_student.studid)

    return jsonify({"message": "✅ Student registered with face successfully"})


@app.route("/get_student", methods=["GET"])
def get_students():
    students = Student.query.all()

    if not students:
        return jsonify({"message": "❌ No students registered yet"}), 404

    return jsonify([{"id": student.studid,
                     "name": student.studname,
                     "pnr": student.studpnr,
                     "phone": student.studphone,
                     "course": student.studcourse,
                     "email": student.studemail,
                     "bloodgrp": student.studbloodgrp,
                     "remark": student.studremark,
                     "hostelroom": student.studhostelroom,
                     "face": student.studface
                     } for student in students])


@app.route("/recognize_face", methods=["POST"])
def recognize_face():
    data = request.get_json()
    img_data = data.get("image")
    if not img_data:
        return jsonify({"recognized": False, "message": "❌ No image provided"}), 400

    # Decode base64 image
    image = decode_image(img_data)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = HAAR_CASCADE.detectMultiScale(gray, 1.3, 5)

    if len(faces) == 0:
        return jsonify({"recognized": False, "message": "❌ No face detected"}), 400

    # Check if model exists
    if not os.path.exists(TRAINER_PATH):
        return jsonify({"recognized": False, "message": "❌ Model not trained yet"}), 400

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(TRAINER_PATH)

    # Function to detect current meal/day
    def get_current_meal_and_day():
        now = datetime.now()
        current_time = now.time()
        current_day = now.strftime("%A")

        if datetime.strptime("06:00", "%H:%M").time() <= current_time < datetime.strptime("10:30", "%H:%M").time():
            meal = "Breakfast"
        elif datetime.strptime("11:00", "%H:%M").time() <= current_time < datetime.strptime("15:30", "%H:%M").time():
            meal = "Lunch"
        elif datetime.strptime("18:30", "%H:%M").time() <= current_time < datetime.strptime("23:59", "%H:%M").time():
            meal = "Dinner"
        else:
            meal = None

        return current_day, meal

    # Recognize face
    for (x, y, w, h) in faces:
        face_img = gray[y:y + h, x:x + w]
        label, confidence = recognizer.predict(face_img)

        if confidence < 70:
            student = db.session.get(Student, label)
            if student:
                current_day, current_meal = get_current_meal_and_day()

                if not current_meal:
                    return jsonify({"recognized": True, "name": student.studname,
                                    "message": "✅ Face recognized but not meal time"}), 200

                # Find the matching food from Timetable
                timetable_entry = Timetable.query.filter_by(day=current_day, mealtype=current_meal).first()

                if not timetable_entry:
                    return jsonify({"recognized": True, "name": student.studname,
                                    "message": f"✅ Recognized but no {current_meal} found in timetable"}), 200

                # Create attendance entry
                new_attendance = Attendance(
                    studid=student.studid,
                    status="Present",
                    food_id=timetable_entry.foodid
                )
                db.session.add(new_attendance)
                db.session.commit()

                print(f"✅ Attendance marked for {student.studname} ({current_day}, {current_meal})")

                return jsonify({
                    "recognized": True,
                    "name": student.studname,
                    "day": current_day,
                    "meal": current_meal,
                    "food": timetable_entry.food.foodname,
                    "message": "✅ Attendance marked successfully"
                }), 200
            else:
                return jsonify({"recognized": False, "message": "❌ Unknown student"}), 404

    return jsonify({"recognized": False, "message": "❌ Face not recognized"}), 400


@app.route("/get_timetable", methods=["GET"])
def get_timetable():
    Timetables = Timetable.query.all()

    data = []
    for item in Timetables:
        data.append({
            "ttid": item.ttid,
            "day": item.day,
            "mealtype": item.mealtype,
            "food": item.food.foodname if item.food else "N/A"
        })
    return jsonify(data)


@app.route("/get_foods", methods=["GET"])
def get_foods():
    foods = food.query.all()
    result = []
    for f in foods:
        result.append({
            "foodid": f.foodid,
            "foodname": f.foodname,
            "fooddescription": f.fooddescription or "Delicious food",
            "foodimage": f"/{f.foodimage}" if f.foodimage else "",
        })
    return jsonify(result)



@app.route("/get_attendance/<int:studid>", methods=["GET"])
def get_attendance_in_stdprofile(studid):
    attendance_records = Attendance.query.filter_by(studid=studid).order_by(Attendance.timestamp.desc()).all()

    result = []
    for att in attendance_records:
        food_item = food.query.get(att.food_id)
        # get timetable info for that food to know meal & day
        timetable_entry = Timetable.query.filter_by(foodid=att.food_id).first()

        result.append({
            "timestamp": att.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "day": timetable_entry.day if timetable_entry else "N/A",
            "meal": timetable_entry.mealtype if timetable_entry else "N/A",
            "food": food_item.foodname if food_item else "N/A",
            "status": att.status,
        })

    return jsonify(result)



@app.route("/get_current_food", methods=["GET"])
def get_current_food():
    now = datetime.now()
    current_time = now.time()
    current_day = now.strftime("%A")

    if datetime.strptime("06:00", "%H:%M").time() <= current_time < datetime.strptime("10:30", "%H:%M").time():
        meal = "Breakfast"
    elif datetime.strptime("11:00", "%H:%M").time() <= current_time < datetime.strptime("15:30", "%H:%M").time():
        meal = "Lunch"
    elif datetime.strptime("18:30", "%H:%M").time() <= current_time < datetime.strptime("23:59", "%H:%M").time():
        meal = "Dinner"
    else:
        return jsonify({"message": "No meal right now"}), 404

    timetable_entry = Timetable.query.filter_by(day=current_day, mealtype=meal).first()
    if not timetable_entry:
        return jsonify({"message": f"No {meal} scheduled for today"}), 404

    food_item = timetable_entry.food
    if not food_item:
        return jsonify({"message": "Food details not found"}), 404

    return jsonify({
        "foodid": food_item.foodid,
        "foodname": food_item.foodname,
        "fooddescription": food_item.fooddescription or "Delicious food",
        "foodimage": f"/{food_item.foodimage}" if food_item.foodimage else ""
    })


from flask import send_from_directory
import os

@app.route("/food_images/<path:filename>")
def serve_food_image(filename):
    return send_from_directory(os.path.join(app.root_path, "static/food_images"), filename)




EMOJI_TO_RATING = {
    "😡": 1,
    "😒": 2,
    "😑": 3,
    "😊": 4,
    "😍": 5
}

@app.route("/submit_feedback", methods=["POST"])
def submit_feedback():
    data = request.get_json()
    foodid = data.get("foodid")
    emoji = data.get("emoji")
    comment = data.get("comment")
    would_eat_again = data.get("would_eat_again")
    studentname = data.get("studentname", "")

    # Validate required fields
    if not all([foodid, emoji, comment, would_eat_again is not None]):
        return jsonify({"message": "Missing required fields"}), 400

    # Convert emoji to rating
    rating = EMOJI_TO_RATING.get(emoji, 3)

    # Create Feedback object
    new_feedback = Feedback(
        foodid=foodid,
        studentname=studentname,
        rating=rating,
        comment=comment,
        eat_again="Yes" if would_eat_again else "No"
    )
    db.session.add(new_feedback)
    db.session.commit()  # ✅ This writes it to the DB

    return jsonify({"message": "Feedback submitted successfully"}), 200




@app.route("/get_feedback/<int:foodid>", methods=["GET"])
def get_feedback(foodid):
    # Fetch feedbacks for this food
    feedbacks = Feedback.query.filter_by(foodid=foodid).order_by(Feedback.created_at.asc()).all()

    if not feedbacks:
        return jsonify([])

    grouped = {}
    for fb in feedbacks:
        date_str = fb.created_at.strftime("%Y-%m-%d")
        if date_str not in grouped:
            grouped[date_str] = {"total": 0, "count": 0}
        grouped[date_str]["total"] += fb.rating
        grouped[date_str]["count"] += 1

    result = []
    for date_str, data in grouped.items():
        avg = round(data["total"] / data["count"], 1)
        result.append({
            "date": date_str,
            "avg_rating": avg,
            "count": data["count"]
        })

    # Sort descending (latest first)
    result.sort(key=lambda x: x["date"], reverse=True)
    return jsonify(result)



@app.route("/get_feedback_by_date/<int:foodid>/<string:date>", methods=["GET"])
def get_feedback_by_date(foodid, date):
    start_date = datetime.strptime(date, "%Y-%m-%d")
    end_date = start_date + timedelta(days=1)

    feedbacks = Feedback.query.filter(
        Feedback.foodid == foodid,
        Feedback.created_at >= start_date,
        Feedback.created_at < end_date
    ).all()

    result = []
    for fb in feedbacks:
        result.append({
            "id": fb.fbid,
            "rating": fb.rating,
            "comment": fb.comment,
            "eat_again": True if fb.eat_again.lower() == "yes" else False,
            "studentname": fb.studentname,  # if available
        })

    return jsonify(result)



from flask import send_file
import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

@app.route('/download_attendance_pdf/<int:student_id>')
def download_attendance_pdf(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    attendance_records = get_attendance_data(student_id)
    if not attendance_records:
        return jsonify({"error": "No attendance records found"}), 404

    pdf_buffer = io.BytesIO()
    p = canvas.Canvas(pdf_buffer, pagesize=A4)
    p.setFont("Helvetica", 12)
    p.drawString(50, 800, f"Attendance Report for {student.studname} ({student.studpnr})")

    y = 770
    for record in attendance_records:
        line = f"{record['timestamp']} | {record['day']} - {record['mealtype']} | {record['food']} | {record['status']}"
        p.drawString(50, y, line)
        y -= 20
        if y < 50:
            p.showPage()
            y = 800
    p.save()
    pdf_buffer.seek(0)
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"{student.studname}_attendance.pdf",
        mimetype="application/pdf"
    )

@app.route("/get_student/<int:student_id>", methods=["GET"])
def get_student_by_id(student_id):
    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "❌ Student not found"}), 404

    return jsonify({
        "id": student.studid,
        "name": student.studname,
        "pnr": student.studpnr,
        "phone": student.studphone,
        "course": student.studcourse,
        "email": student.studemail,
        "bloodgrp": student.studbloodgrp,
        "remark": student.studremark,
        "hostelroom": student.studhostelroom,
        "face": student.studface
    })


def get_attendance_data(student_id):
    from models import Attendance, food, Timetable

    records = (
        db.session.query(
            Attendance.timestamp,
            Attendance.status,
            food.foodname.label("food"),
            Timetable.mealtype.label("mealtype"),
            Timetable.day.label("day")
        )
        .join(food, Attendance.food_id == food.foodid)
        .join(Timetable, Timetable.foodid == food.foodid)
        .filter(Attendance.studid == student_id)
        .order_by(Attendance.timestamp.desc())
        .all()
    )

    return [
        {
            "timestamp": r.timestamp.strftime("%Y-%m-%d %H:%M"),
            "status": r.status,
            "food": r.food,
            "mealtype": r.mealtype,
            "day": r.day,
        }
        for r in records
    ]



@app.route("/download_feedback_pdf/<date>/<foodname>", methods=["GET"])
def download_feedback_pdf(date, foodname):
    # Import models here if needed
    from io import BytesIO
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    # Step 1: Find food by name
    food_obj = food.query.filter_by(foodname=foodname).first()
    if not food_obj:
        return jsonify({"message": f"❌ Food '{foodname}' not found"}), 404

    # Step 2: Filter feedbacks related to this food (and optionally by date)
    feedbacks = Feedback.query.filter(Feedback.foodid == food_obj.foodid).all()

    if not feedbacks:
        return jsonify({"message": f"❌ No feedback found for {foodname} on {date}"}), 404

    # Step 3: Create PDF
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Title
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(180, height - 50, " Meal Feedback Report")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(50, height - 80, f"Date: {date}")
    pdf.drawString(50, height - 100, f"Food: {foodname}")

    pdf.line(50, height - 110, 550, height - 110)

    y = height - 140
    count = 1

    for fb in feedbacks:
        if y < 100:
            pdf.showPage()
            pdf.setFont("Helvetica", 12)
            y = height - 80

        pdf.drawString(50, y, f"{count}. Student: {fb.studentname or 'N/A'}")
        y -= 20
        pdf.drawString(70, y, f"Rating: {fb.rating} ")
        y -= 20
        pdf.drawString(70, y, f"Comment: {fb.comment}")
        y -= 20
        pdf.drawString(70, y, f"Eat Again: {fb.eat_again}")
        y -= 30
        count += 1

    pdf.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"Feedback_{foodname}_{date}.pdf",
        mimetype="application/pdf"
    )


if __name__ == "__main__":
    # Load existing model or create new one
    if os.path.exists(TRAINER_PATH):
        print("✅ Existing model found and ready.")
    else:
        print("⚠️ No trained model yet. It will be created on first registration.")
    app.run(debug=True)
