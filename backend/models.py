from datetime import datetime, timezone
from sqlalchemy import Enum
import sqlalchemy
from flask_sqlalchemy import SQLAlchemy
import pytz
from datetime import datetime

IST = pytz.timezone("Asia/Kolkata")
db = SQLAlchemy()

class User(db.Model):
    userid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)


class Student(db.Model):
    studid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    studname = db.Column(db.String(50), nullable=False)
    studpnr = db.Column(db.Integer, unique=True, nullable=False)
    studphone = db.Column(db.Integer, nullable=False)
    studcourse = db.Column(db.String(50), nullable=False)
    studemail = db.Column(db.String(50), nullable=False)
    studremark = db.Column(db.String(50), nullable=False)
    studhostelroom = db.Column(db.String(50), nullable=False)
    studbloodgrp = db.Column(db.String(10), nullable=False)
    studsecretcode = db.Column(db.String(6), unique=True)
    studface = db.Column(sqlalchemy.JSON, nullable=True)

    attendances = db.relationship('Attendance', backref='student', lazy=True)


class Attendance(db.Model):
    attid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    studid = db.Column(db.Integer, db.ForeignKey('student.studid'), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(IST))
    status = db.Column(db.String(10), nullable=False)  # values: "Present" / "Absent"
    food_id = db.Column(db.Integer, db.ForeignKey('food.foodid'), nullable=False)


class food(db.Model):
    foodid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    foodname = db.Column(db.String(50), nullable=False)
    fooddescription = db.Column(db.String(100), nullable=True)
    foodimage = db.Column(db.String(100), nullable=True)

    timetable_items = db.relationship('Timetable', backref='food', lazy=True)
    feedbacks = db.relationship('Feedback', backref='food', lazy=True)
    attendances = db.relationship('Attendance', backref='food', lazy=True)


class Feedback(db.Model):
    fbid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    foodid = db.Column(db.Integer, db.ForeignKey('food.foodid'), nullable=False)
    studentname = db.Column(db.String(50), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    eat_again = db.Column(Enum('Yes', 'No'),nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Timetable(db.Model):
    ttid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    foodid = db.Column(db.Integer, db.ForeignKey('food.foodid'), nullable=False)
    day = db.Column(Enum('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', name='week_days'),nullable=False)
    mealtype = db.Column(Enum('Breakfast', 'Lunch', 'Dinner', name='meal_type'), nullable=False)

