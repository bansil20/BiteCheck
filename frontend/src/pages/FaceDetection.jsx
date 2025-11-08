import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import {Container, Nav, Navbar} from "react-bootstrap";
import {FaUser} from "react-icons/fa";

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
      <div className="dashboard-wrapper d-flex">
      {/* Upper nav*/}
      <div className="main-content flex-grow-1">
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="px-4 shadow-sm">
                    <Navbar.Brand className="pb-3 mb-3 mt-3 border-bottom text-start ps-3"><h4 className="fw-bold mb-0"> Welcome Admin</h4></Navbar.Brand>

          <Nav className="ms-auto">
            <Nav.Link href="#">
              <FaUser />
              cz
            </Nav.Link>
          </Nav>
        </Navbar>
        <Container fluid className="p-4">
          <h3>Attendence</h3>
          <div className="container mt-4">
         <div className="container mt-4" style={{ textAlign: "center" }}>
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
          </div>
        </Container>
      </div>
    </div>
    //
  );
}

export default FaceDetection;
