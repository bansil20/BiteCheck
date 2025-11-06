import os
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from models import db, Student
from flask_migrate import Migrate

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

    # Recognize face
    for (x, y, w, h) in faces:
        face_img = gray[y:y + h, x:x + w]
        label, confidence = recognizer.predict(face_img)

        # Lower confidence value = more accurate
        if confidence < 70:
            student = Student.query.get(label)
            if student:
                print(f"✅ Recognized: {student.studname} (Confidence: {confidence:.2f})")
                return jsonify({"recognized": True, "name": student.studname})
            else:
                return jsonify({"recognized": False, "message": "❌ Unknown student"}), 404

    return jsonify({"recognized": False, "message": "❌ Face not recognized"}), 400


if __name__ == "__main__":
    # Load existing model or create new one
    if os.path.exists(TRAINER_PATH):
        print("✅ Existing model found and ready.")
    else:
        print("⚠️ No trained model yet. It will be created on first registration.")
    app.run(debug=True)
