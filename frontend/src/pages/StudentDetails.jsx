import React, {useEffect, useState} from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Navbar,
  Nav,
} from "react-bootstrap";
import { FaPlus, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StudentProfile from "./StudentProfile";
import PATHS from "../utlis/constants/Path";


function StudentDetails() {

    const navigate = useNavigate();

    const [student, setStudent] = useState([])

    const fetchStudents = async () => {
            const res = await axios.get("http://127.0.0.1:5000/get_student");
            console.log(res.data);
            setStudent(res.data);
    }


    useEffect(() => {
        fetchStudents();
    },[]);



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


          {/* Main body */}
        <Container fluid className="p-4">
          <h3>Students</h3>
          {/* Top bar with search and total count */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Form.Control
              type="text"
              placeholder="Search Student"
              style={{ maxWidth: "300px" }}
            />
            <h5>Total Students: {student.length}</h5>
          </div>




          {/* Student Cards Grid */}
          <Row>

            {student.map((stud,idx) => (
              <Col key={idx} md={4} sm={6} className="mb-4">
                <Card className="shadow-sm h-100"
                      onClick={() => navigate(PATHS.STUDENTPROFILE, { state: { student: stud } })}
                      style={{ cursor: "pointer" }} // Show hand cursor
                >
                  <Card.Body>
                    <div className="d-flex align-items-center">
                       {/*Image on left*/}
                      <img
                        src={stud.face?.base64}
                        alt={stud.name}
                        style={{
                          height: "120px",
                          width: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginRight: "15px"
                        }}
                      />

                      {/* Details on right */}
                      <div>
                        <Card.Title>{stud.name}</Card.Title>
                        <p className="mb-1">
                          <strong>Course:</strong> {stud.course}
                        </p>
                        <p className="mb-1">
                          <strong>Hostel Room:</strong> {stud.hostelroom}
                        </p>
                        <p className="mb-2">
                          <strong>Phone:</strong> {stud.phone}
                        </p>

                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}

          </Row>


           {/* Floating Add Button */}
      <button
        className="btn btn-primary rounded-circle shadow-lg"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}
        onClick={() => navigate(`/add_student_profile`)}
      >
        <FaPlus size={20} />
      </button>
        </Container>
      </div>
    </div>
  );
}

export default StudentDetails;
