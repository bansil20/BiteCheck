import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

function FaceDetection() {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Start continuous scanning every 2 seconds
    const id = setInterval(() => {
      captureAndRecognize();
    }, 2000);

    return () => clearInterval(id); // cleanup on unmount
  }, []);

  const captureAndRecognize = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const res = await axios.post("http://127.0.0.1:5000/recognize_face", {
        image: imageSrc,
      });

      if (res.data.recognized) {
        setMessage(`${res.data.name} - Present ✅`);
      } else {
        setMessage("Not recognized ❌");
      }
    } catch (err) {
      console.error(err);
        if (err.response && err.response.data) {
            setMessage(err.response.data.message || "❌ Error recognizing face");
        } else {
            setMessage("❌ Error recognizing face");
  }
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>📸 Face Recognition</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        style={{
          width: "60%",
          borderRadius: "10px",
          marginBottom: "15px",
        }}
      />
      <h3>{message}</h3>
    </div>
  );
}

export default FaceDetection;
