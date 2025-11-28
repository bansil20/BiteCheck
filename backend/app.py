import os
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from PIL import Image
from datetime import datetime, date

from models import db, Student, Timetable, Attendance, food, Feedback, User
from flask_migrate import Migrate
from sqlalchemy import cast, Date

app = Flask(__name__)
CORS(app, supports_credentials=True)

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
EYE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
TRAINER_PATH = "trainer.yml"

# -------------------- HELPERS --------------------


print("Python Time:", datetime.now())


def cosine_similarity(a, b):
    a = np.array(a);
    b = np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def decode_base64_image(b64):
    try:
        if "," in b64:
            b64 = b64.split(",")[1]
        img_bytes = base64.b64decode(b64)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        return img
    except:
        return None


def build_food_image_url(filename):
    if not filename:
        return ""
    return f"http://localhost:5000/static/food_images/{filename}"


import random


def generate_secret_code():
    return f"{random.randint(0, 999999):06d}"  # ensures 6 digits with leading zeros


@app.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered"}), 400

    # Create new user
    new_user = User(username=username, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    # ✅ Include username and userid in response
    return jsonify({
        "success": True,
        "message": "Registration successful!",
        "username": new_user.username,
        "userid": new_user.userid
    }), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email, password=password).first()

    if user:
        return jsonify({
            "success": True,
            "message": f"Welcome {user.username}!",
            "username": user.username,
            "userid": user.userid
        })
    else:
        return jsonify({"success": False, "message": "Invalid email or password"})


@app.route("/current_user", methods=["GET"])
def current_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"username": None}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({"username": None}), 404

    return jsonify({"username": user.username})


@app.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})


def decode_image(img_data):
    """Convert base64 from React to OpenCV image"""
    img_data = img_data.split(",")[1]  # remove data:image/jpeg;base64,
    nparr = np.frombuffer(base64.b64decode(img_data), np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img


import math


def preprocess_face_gray(image):
    """
    1. Convert to gray
    2. Detect biggest face
    3. Detect eyes inside face
    4. Rotate face so eyes are horizontal (alignment)
    5. Resize + equalize histogram

    Returns: aligned 200x200 grayscale face or None
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = HAAR_CASCADE.detectMultiScale(gray, 1.3, 5)
    if len(faces) == 0:
        return None

    # Take biggest face (area)
    x, y, w, h = sorted(faces, key=lambda b: b[2] * b[3], reverse=True)[0]

    face_gray = gray[y:y + h, x:x + w]

    # ---------- Eye detection inside face ----------
    eyes = EYE_CASCADE.detectMultiScale(face_gray, 1.1, 5)

    # We only try alignment if we find at least 2 eyes
    if len(eyes) >= 2:
        # pick 2 best eyes (largest width)
        eyes = sorted(eyes, key=lambda e: e[2] * e[3], reverse=True)[:2]

        # sort left-right
        if eyes[0][0] > eyes[1][0]:
            eye_right = eyes[0]
            eye_left = eyes[1]
        else:
            eye_left = eyes[0]
            eye_right = eyes[1]

        # eye centers
        lx, ly, lw, lh = eye_left
        rx, ry, rw, rh = eye_right

        left_center = (lx + lw / 2, ly + lh / 2)
        right_center = (rx + rw / 2, ry + rh / 2)

        # angle between eyes
        dy = right_center[1] - left_center[1]
        dx = right_center[0] - left_center[0]
        angle = math.degrees(math.atan2(dy, dx))

        # Rotate face so eyes are horizontal
        center = (w / 2, h / 2)
        rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)
        aligned_face = cv2.warpAffine(face_gray, rot_mat, (w, h))

        # crop again (same box) after rotation
        face_crop = aligned_face
    else:
        # Fallback: no eye alignment, just use raw face crop
        face_crop = face_gray

    # Normalize size + contrast
    face_resized = cv2.resize(face_crop, (200, 200))
    face_equalized = cv2.equalizeHist(face_resized)

    return face_equalized


def train_or_update_recognizer(_unused=None):
    """
    Train LBPH on ALL faces in faces_dataset.
    Each folder is: <studid>_<studname>/face_*.jpg
    """
    recognizer = cv2.face.LBPHFaceRecognizer_create()

    face_samples = []
    ids = []

    for folder in os.listdir(DATASET_PATH):
        try:
            student_id = int(folder.split("_")[0])
        except ValueError:
            continue

        folder_path = os.path.join(DATASET_PATH, folder)
        if not os.path.isdir(folder_path):
            continue

        for image_name in os.listdir(folder_path):
            img_path = os.path.join(folder_path, image_name)
            img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue

            faces = HAAR_CASCADE.detectMultiScale(img, 1.3, 5)
            for (x, y, w, h) in faces:
                face = img[y:y + h, x:x + w]
                face = cv2.resize(face, (200, 200))
                face = cv2.equalizeHist(face)
                face_samples.append(face)
                ids.append(student_id)

    if len(face_samples) == 0:
        print("❌ No faces found in dataset. Train aborted.")
        return

    recognizer.train(face_samples, np.array(ids))
    recognizer.write(TRAINER_PATH)
    print(f"✅ LBPH model trained. Total students: {len(set(ids))}")


# -------------------- ROUTES --------------------
@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.get_json()

    # Accept either a list of images or a single image
    faces_b64_list = data.get("studface_list")
    single_face_b64 = data.get("studface")

    if faces_b64_list and isinstance(faces_b64_list, list):
        images_b64 = faces_b64_list
    elif single_face_b64:
        images_b64 = [single_face_b64]
    else:
        return jsonify({"message": "❌ No face image provided"}), 400

    # 1) Save student info in DB (no embedding now)
    new_student = Student(
        studname=data.get("studname"),
        studpnr=int(data.get("studpnr", 0)),
        studphone=int(data.get("studphone", 0)),
        studcourse=data.get("studcourse"),
        studemail=data.get("studemail"),
        studbloodgrp=data.get("studbloodgrp"),
        studremark=data.get("studremark"),
        studhostelroom=data.get("studhostelroom"),
        studface={"base64": images_b64[0]},  # store first image as reference
        studsecretcode=generate_secret_code()
    )
    db.session.add(new_student)
    db.session.commit()

    # 2) Create folder for this student
    student_folder = os.path.join(DATASET_PATH, f"{new_student.studid}_{new_student.studname}")
    os.makedirs(student_folder, exist_ok=True)

    saved_count = 0

    # 3) Process each image, detect + crop face, and save
    for idx, img_b64 in enumerate(images_b64):
        img = decode_image(img_b64)
        if img is None:
            continue

        face_img = preprocess_face_gray(img)
        if face_img is None:
            continue

        cv2.imwrite(os.path.join(student_folder, f"face_{idx}.jpg"), face_img)
        saved_count += 1

    if saved_count == 0:
        return jsonify({"message": "❌ No valid faces detected in provided images"}), 400

    # 4) Train LBPH using all faces in dataset
    train_or_update_recognizer(new_student.studid)

    return jsonify({
        "message": f"✅ Student registered with LBPH ({saved_count} faces saved)",
        "secretCode": new_student.studsecretcode
    }), 200


@app.route("/get_student", methods=["GET"])
def get_students():
    students = Student.query.filter_by().all()

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
                     "studsecretcode": student.studsecretcode,
                     "face": student.studface
                     } for student in students])


@app.route("/recognize_face", methods=["POST"])
def recognize_face():
    data = request.get_json()

    # 1️⃣ SECRET CODE ATTENDANCE
    secret_code = data.get("code")
    if secret_code:
        student = Student.query.filter_by(studsecretcode=secret_code).first()

        if not student:
            return jsonify({"recognized": False, "message": "❌ Invalid Secret Code"}), 404

        return mark_attendance(student, via="code")

    # 2️⃣ FACE ATTENDANCE (LBPH)
    img_b64 = data.get("image")
    if not img_b64:
        return jsonify({"recognized": False, "message": "❌ No image provided"}), 400

    img = decode_base64_image(img_b64)
    if img is None:
        return jsonify({"recognized": False, "message": "❌ Invalid image"}), 400

    face_img = preprocess_face_gray(img)
    if face_img is None:
        return jsonify({"recognized": False, "message": "❌ No face detected"}), 400

    # Check model
    if not os.path.exists(TRAINER_PATH):
        return jsonify({"recognized": False, "message": "❌ LBPH model not trained yet"}), 400

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(TRAINER_PATH)

    label, confidence = recognizer.predict(face_img)

    # 🔧 Threshold tuning:
    # lower confidence = better. Try < 90 first, adjust based on logs.
    print(f"LBPH predicted label={label}, confidence={confidence}")

    THRESHOLD = 90.0

    if confidence < THRESHOLD:
        student = db.session.get(Student, label)
        if not student:
            return jsonify({"recognized": False, "message": "❌ Unknown student"}), 404

        return mark_attendance(student, via="face")

    return jsonify({
        "recognized": False,
        "message": "❌ Face not recognized"
    }), 400


def mark_attendance(student, via="face"):
    from datetime import datetime, date

    now = datetime.now()
    today = date.today()
    current_day = now.strftime("%A")
    current_time = now.time()

    # Detect meal slot
    if datetime.strptime("06:00", "%H:%M").time() <= current_time < datetime.strptime("10:30", "%H:%M").time():
        meal = "Breakfast"
    elif datetime.strptime("11:00", "%H:%M").time() <= current_time < datetime.strptime("17:30", "%H:%M").time():
        meal = "Lunch"
    elif datetime.strptime("18:30", "%H:%M").time() <= current_time < datetime.strptime("23:59", "%H:%M").time():
        meal = "Dinner"
    else:
        return jsonify({
            "recognized": True,
            "name": student.studname,
            "message": "⚠️ Not meal time"
        }), 200

    # Find food for that meal
    timetable_entry = Timetable.query.filter_by(day=current_day, mealtype=meal).first()
    if not timetable_entry:
        return jsonify({
            "recognized": True,
            "name": student.studname,
            "message": f"⚠️ No {meal} found in timetable"
        }), 200

    # Check if already marked
    existing = Attendance.query.filter(
        Attendance.studid == student.studid,
        Attendance.food_id == timetable_entry.foodid,
        func.date(Attendance.timestamp) == today
    ).first()

    if existing:
        return jsonify({
            "recognized": True,
            "name": student.studname,
            "meal": meal,
            "message": f"⚠️ {student.studname} Attendance already marked for this meal"
        }), 200

    # Mark new attendance
    new_attendance = Attendance(
        studid=student.studid,
        food_id=timetable_entry.foodid,
        status="Present"
    )
    db.session.add(new_attendance)
    db.session.commit()

    return jsonify({
        "recognized": True,
        "name": student.studname,
        "meal": meal,
        "food": timetable_entry.food.foodname,
        "message": f"✅ {student.studname} Attendance marked successfully ({via})"
    }), 200


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
    foods = (
        db.session.query(food, Timetable.mealtype)
        .join(Timetable, food.foodid == Timetable.foodid)
        .all()
    )

    result = []
    for f, mealtype in foods:
        result.append({
            "foodid": f.foodid,
            "foodname": f.foodname,
            "fooddescription": f.fooddescription,
            "foodimage": build_food_image_url(f.foodimage),
            "mealtype": mealtype
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


from datetime import datetime, timedelta


@app.route('/get_current_food', methods=['GET'])
def get_current_food():
    now = datetime.now()
    current_time = now.time()
    current_day = now.strftime("%A")

    meal_schedule = [
        ("Breakfast", "06:00", "10:30"),
        ("Lunch", "11:00", "17:30"),
        ("Dinner", "18:30", "23:59")
    ]

    current_meal = None
    upcoming_meal = None

    for meal, start, end in meal_schedule:
        start_t = datetime.strptime(start, "%H:%M").time()
        end_t = datetime.strptime(end, "%H:%M").time()

        if start_t <= current_time < end_t:
            current_meal = meal
            break
        elif current_time < start_t and not upcoming_meal:
            upcoming_meal = (meal, start)

    # If current meal available
    if current_meal:
        entry = Timetable.query.filter_by(day=current_day, mealtype=current_meal).first()
        if entry and entry.food:
            food = entry.food
            return jsonify({
                "status": "current",
                "meal": current_meal,
                "foodid": food.foodid,
                "foodname": food.foodname,
                "fooddescription": food.fooddescription or "Delicious food",
                "foodimage": build_food_image_url(food.foodimage)
            })

    # Otherwise, show upcoming
    if upcoming_meal:
        meal, start = upcoming_meal
        entry = Timetable.query.filter_by(day=current_day, mealtype=meal).first()
        if entry and entry.food:
            food = entry.food
            meal_start_datetime = f"{now.strftime('%Y-%m-%d')} {start}"
            return jsonify({
                "status": "upcoming",
                "meal": meal,
                "mealStartTime": meal_start_datetime,
                "foodid": food.foodid,
                "foodname": food.foodname,
                "fooddescription": food.fooddescription or "Delicious food",
                "foodimage": build_food_image_url(food.foodimage)

            })

    return jsonify({"message": "No meal or upcoming food found."}), 404


@app.route("/meal_attendance_stats", methods=["GET"])
def meal_attendance_stats():
    from datetime import date
    today = date.today()

    # 1. Get current meal info
    response = get_current_food()
    current_food = response.json

    # Order of meals
    meal_order = ["Breakfast", "Lunch", "Dinner"]

    # 2. Determine correct meal + food_id
    if current_food.get("status") == "current":
        meal = current_food["meal"]
        foodid = current_food["foodid"]

    else:
        # Determine last meal if upcoming
        upcoming = current_food.get("meal")
        try:
            idx = meal_order.index(upcoming)
            meal = meal_order[idx - 1] if idx > 0 else "Dinner"
        except:
            meal = "Dinner"

        # Get food_id for last meal
        entry = Timetable.query.filter_by(
            day=today.strftime("%A"),
            mealtype=meal
        ).first()

        if not entry:
            return jsonify({"error": "No timetable entry found"}), 404

        foodid = entry.foodid  # timetable uses foodid

    # 3. Count PRESENT students for this meal
    present_count = Attendance.query.filter(
        Attendance.food_id == foodid,  # FIXED HERE
        func.date(Attendance.timestamp) == today,
        Attendance.status == "Present"
    ).count()

    # 4. Total students
    total_students = Student.query.count()

    # 5. Absentees
    absent_count = total_students - present_count

    return jsonify({
        "meal": meal,
        "foodid": foodid,
        "present": present_count,
        "absent": absent_count,
        "total": total_students
    })


@app.route("/meal_today_counts", methods=["GET"])
def meal_today_counts():
    today = date.today()

    meal_types = ["Breakfast", "Lunch", "Dinner"]
    counts = {}

    total_students = Student.query.count()

    for meal in meal_types:
        entry = Timetable.query.filter_by(
            day=today.strftime("%A"),
            mealtype=meal
        ).first()

        if not entry:
            counts[meal] = {"present": 0, "total": total_students}
            continue

        foodid = entry.foodid

        present_count = Attendance.query.filter(
            Attendance.food_id == foodid,
            func.date(Attendance.timestamp) == today,
            Attendance.status == "Present"
        ).count()

        counts[meal] = {
            "present": present_count,
            "total": total_students
        }

    return jsonify(counts)


@app.route("/last7_meal_attendance/<mealtype>", methods=["GET"])
def last7_meal_attendance(mealtype):
    today = date.today()
    result = []

    mealtype = mealtype.capitalize()  # "breakfast" → "Breakfast"

    for i in range(7):
        day_date = today - timedelta(days=i)
        day_name = day_date.strftime("%A")

        # Get entry for selected meal
        entry = Timetable.query.filter_by(
            day=day_name,
            mealtype=mealtype
        ).first()

        if not entry:
            result.append({"date": str(day_date), "present": 0})
            continue

        foodid = entry.foodid

        present_count = Attendance.query.filter(
            Attendance.food_id == foodid,
            func.date(Attendance.timestamp) == day_date,
            Attendance.status == "Present"
        ).count()

        result.append({
            "date": str(day_date),
            "present": present_count
        })

    result.reverse()
    return jsonify(result)


from sqlalchemy import cast, Date

from sqlalchemy import cast, Date


@app.route("/best_food_last7", methods=["GET"])
def best_food_last7():
    today = datetime.now().date()
    seven_days_ago = today - timedelta(days=7)

    results = db.session.query(
        Feedback.foodid,
        func.avg(Feedback.rating).label("avg_rating"),
        func.count(Feedback.rating).label("total_reviews")
    ).filter(
        cast(Feedback.created_at, Date) >= seven_days_ago
    ).group_by(
        Feedback.foodid
    ).all()

    if not results:
        return jsonify({
            "message": "No feedback in last 7 days",
            "food": None
        })

    best_row = None
    best_score = -1

    for row in results:
        avg_rating = float(row.avg_rating)
        review_count = int(row.total_reviews)

        score = avg_rating + (0.35 * np.log1p(review_count))

        if score > best_score:
            best_score = score
            best_row = row

    food_obj = food.query.filter_by(foodid=best_row.foodid).first()

    if not food_obj:
        return jsonify({"message": "food not found", "food": None})

    return jsonify({
        "message": "success",
        "foodid": food_obj.foodid,
        "name": food_obj.foodname,
        "image": build_food_image_url(food_obj.foodimage),
        "avg_rating": round(float(best_row.avg_rating), 2),
        "reviews": int(best_row.total_reviews)
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
        "studsecretcode": student.studsecretcode,
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


def get_last_served_date_for_food(foodid):
    """
    Determine last date this food was served using Attendance records.
    Falls back to latest feedback date if attendance not available.
    """
    last_att = (
        db.session.query(Attendance)
        .filter(Attendance.food_id == foodid)
        .order_by(Attendance.timestamp.desc())
        .first()
    )
    if last_att:
        return last_att.timestamp.date()

    # fallback: use latest feedback date for that food
    last_fb = (
        db.session.query(Feedback)
        .filter(Feedback.foodid == foodid)
        .order_by(Feedback.created_at.desc())
        .first()
    )
    if last_fb:
        return last_fb.created_at.date()

    return None


def get_feedback_comments_for_food_by_date(foodid, date_obj):
    """
    Return list of comment texts (strings) for given foodid and date (python date).
    """
    start = datetime.combine(date_obj, datetime.min.time())
    end = start + timedelta(days=1)
    fbs = Feedback.query.filter(
        Feedback.foodid == foodid,
        Feedback.created_at >= start,
        Feedback.created_at < end
    ).all()
    return [fb.comment for fb in fbs if fb.comment and fb.comment.strip()]


from sqlalchemy import func
# from feedback_ml import analyze_feedback_comments

from feedback_ml import (
    predict_labels_for_comments,
    aggregate_labels_from_labellists,
    models_exist, combine_with_sentiment
)


@app.route("/get_food_suggestion/<int:foodid>", methods=["GET"])
def get_food_suggestion(foodid):
    from feedback_ml import auto_train_if_needed
    auto_train_if_needed()

    # Step 1 — fetch all feedback for this food
    feedbacks = Feedback.query.filter_by(foodid=foodid).all()
    if not feedbacks:
        return jsonify({
            "foodid": foodid,
            "issues": {},
            "suggestion_paragraph": "No feedback available for this food.",
            "num_feedbacks_analyzed": 0
        })

    # Step 2 — latest date only (ignore time)
    latest_date = db.session.query(
        func.date(Feedback.created_at)
    ).filter(Feedback.foodid == foodid).order_by(
        func.date(Feedback.created_at).desc()
    ).first()[0]

    # Step 3 — fetch all comments from that date
    same_date_feedbacks = Feedback.query.filter(
        Feedback.foodid == foodid,
        func.date(Feedback.created_at) == latest_date
    ).all()

    if not same_date_feedbacks:
        return jsonify({
            "foodid": foodid,
            "issues": {},
            "last_served_date": str(latest_date),
            "suggestion_paragraph": "No feedback found for last serving date.",
            "num_feedbacks_analyzed": 0
        })

    # Extract comment text
    comments = [fb.comment for fb in same_date_feedbacks]

    # Step 4 — if ML model does not exist
    if not models_exist():
        return jsonify({
            "foodid": foodid,
            "last_served_date": str(latest_date),
            "num_feedbacks_analyzed": len(comments),
            "issues": {},
            "top_issues": [],
            "suggestion_paragraph": "ML model not trained yet. Run train_feedback_model.py."
        })

    # Step 5 — Predict labels using ML model
    labels_per_comment, _ = predict_labels_for_comments(comments)

    # Step 6 — Aggregate all predicted labels
    issue_counts, sorted_list = aggregate_labels_from_labellists(labels_per_comment)

    # Step 7 — Generate natural language suggestion
    suggestion_text = combine_with_sentiment(issue_counts, comments)

    # Step 8 — Final response
    return jsonify({
        "foodid": foodid,
        "last_served_date": str(latest_date),
        "num_feedbacks_analyzed": len(comments),
        "issues": issue_counts,
        # "foodimage": build_food_image_url(food.foodimage),
        "top_issues": [issue for issue, count in sorted_list],
        "suggestion_paragraph": suggestion_text
    })


def analyze_feedback_comments(comments):
    """Uses ML model to detect issues from comments."""
    import pickle

    model_path = "ml_models/model.pkl"
    vectorizer_path = "ml_models/vectorizer.pkl"
    mlb_path = "ml_models/mlb.pkl"

    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(vectorizer_path, "rb") as f:
        vectorizer = pickle.load(f)
    with open(mlb_path, "rb") as f:
        mlb = pickle.load(f)

    X = vectorizer.transform(comments)
    y_pred = model.predict(X)

    # Aggregate issues from all comments
    labels = mlb.classes_
    issue_counts = {}

    for row in y_pred:
        for i, val in enumerate(row):
            if val == 1:
                issue = labels[i]
                issue_counts[issue] = issue_counts.get(issue, 0) + 1

    if not issue_counts:
        return {}, "No specific issues found in recent feedback."

    # Sort issues by count
    sorted_issues = dict(sorted(issue_counts.items(), key=lambda x: x[1], reverse=True))

    # Prepare natural language suggestion
    top = list(sorted_issues.keys())[:3]
    sentence = (
        f"Based on last serving feedback, students mostly complained about: "
        f"{', '.join(top)}. Consider improving these aspects in the next preparation."
    )

    return sorted_issues, sentence


@app.route("/total_students", methods=["GET"])
def total_students():
    try:
        count = Student.query.count()
        return jsonify({"total_students": count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    if os.path.exists(TRAINER_PATH):
        print("✅ LBPH model loaded from trainer.yml")
    else:
        print("⚠️ No LBPH model yet. It will be created after first student registration.")
    app.run(debug=False)
