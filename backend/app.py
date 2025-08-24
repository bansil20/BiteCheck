from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, Student, Attendance, food, Feedback, Timetable
from flask_migrate import Migrate
import base64, cv2, numpy as np
from deepface import DeepFace
from datetime import datetime
import json
from flask import Flask
from flask_cors import CORS
from models import db, Student, Attendance, food, Feedback, Timetable
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)

# ================= DATABASE CONFIG =================
# SQLite (for testing):
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///students.db"

# MySQL (for production):
app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost:3306/bitecheck"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
migrate = Migrate(app, db)
import models

# ================= UTIL: EMBEDDING =================
def get_embedding(img):
    try:
        embedding = DeepFace.represent(
            img,
            model_name="Facenet",
            enforce_detection=False
        )
        if not embedding or len(embedding) == 0:
            return None
        return np.array(embedding[0]["embedding"])
    except Exception as e:
        print("Embedding error:", e)
        return None


# ================= STUDENT REGISTRATION =================
@app.route("/add_student", methods=["POST"])
def add_student():
    data = request.json
    try:
        # Extract fields from request
        name = data.get("studname")
        pnr = int(data.get("studpnr", 0))
        phone = int(data.get("studphone", 0))
        course = data.get("studcourse")
        email = data.get("studemail")
        remark = data.get("studremark", "")
        hostelroom = data.get("studhostelroom", "")
        studface_data = data.get("studface")  # base64 image from React form

        embedding = None
        if studface_data:
            # Decode base64 image
            img_bytes = base64.b64decode(studface_data.split(",")[1])
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Generate embedding using DeepFace
            embedding = get_embedding(img)
            if embedding is None:
                return jsonify({"message": "No face detected ❌"}), 400

        # Create new student record
        new_student = Student(
            studname=name,
            studpnr=pnr,
            studphone=phone,
            studcourse=course,
            studemail=email,
            studremark=remark,
            studhostelroom=hostelroom,
            studface=json.dumps(embedding.tolist()) if embedding is not None else None
        )

        db.session.add(new_student)
        db.session.commit()

        return jsonify({
            "message": f"Student {name} added successfully ✅",
            "studid": new_student.studid
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ================= FACE REGISTRATION =================

# ================= ATTENDANCE =================
@app.route("/attendance", methods=["POST"])
def attendance():
    try:
        data = request.json
        image_data = data["image"]

        # Decode base64 image
        img_bytes = base64.b64decode(image_data.split(",")[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # New embedding from captured image
        new_embedding = get_embedding(img)
        if new_embedding is None:
            return jsonify({"message": "No face detected ❌"}), 400

        students = Student.query.filter(Student.studface.isnot(None)).all()
        for student in students:
            try:
                stored_embedding = np.array(json.loads(student.studface))
                dist = np.linalg.norm(new_embedding - stored_embedding)

                if dist < 10:  # 👉 Threshold
                    # Mark attendance
                    new_attendance = Attendance(
                        studid=student.studid,
                        timestamp=datetime.utcnow(),
                        status="Present",
                        food_id=1  # optional
                    )
                    db.session.add(new_attendance)
                    db.session.commit()
                    return jsonify({"message": f"{student.studname} is Present ✅"})
            except Exception as e:
                print("Comparison error:", e)

        return jsonify({"message": "Unknown Face ❌"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ================= INITIALIZE DB =================
with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(debug=True)
