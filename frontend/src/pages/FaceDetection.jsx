import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

function FaceDetection() {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState("");

  // Function to mark attendance
  const markAttendance = async () => {
    try {
      const imageSrc = webcamRef.current.getScreenshot();
      const res = await axios.post("http://127.0.0.1:5000/attendance", {
        image: imageSrc,
      });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("❌ Error marking attendance");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>📸 Face Attendance</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{ width: "60%", borderRadius: "10px", marginBottom: "15px" }}
      />
      <br />
      <button
        onClick={markAttendance}
        style={{ margin: "10px", padding: "10px 20px", fontSize: "16px" }}
      >
        Mark Attendance
      </button>
      <h3>{message}</h3>
    </div>
  );
}

export default FaceDetection;
