import React from "react";
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


function StudentDetails() {

    const navigate = useNavigate();


  const students = [
    {
      id: 1,
      name: "John Doe",
      course: "B.Tech Computer Science",
      hostelRoom: "H-102",
      phone: "+91 9876543210",
      image: "https://plus.unsplash.com/premium_photo-1749669869018-8a33825100f0?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      id: 2,
      name: "Priya Sharma",
      course: "BBA",
      hostelRoom: "H-205",
      phone: "+91 9123456780",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "Amit Verma",
      course: "MBA",
      hostelRoom: "H-310",
      phone: "+91 9988776655",
      image: "https://via.placeholder.com/150",
    },
  ];

  return (
    <div className="dashboard-wrapper d-flex">
      {/* Upper nav*/}
      <div className="main-content flex-grow-1">
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="px-4 shadow-sm">
          <Navbar.Brand>Welcome Admin</Navbar.Brand>
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
            <h5>Total Students: {students.length}</h5>
          </div>




          {/* Student Cards Grid */}
          <Row>
            {students.map((student) => (
              <Col key={student.id} md={4} sm={6} className="mb-4">
                <Card className="shadow-sm h-100" 
                    onClick={() => navigate(`/student_profile/${student.id}`)}
                      style={{ cursor: "pointer" }} // Show hand cursor
                >
                  <Card.Body>
                    <div className="d-flex align-items-center">
                      {/* Image on left */}
                      <img
                        src={student.image}
                        alt={student.name}
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
                        <Card.Title>{student.name}</Card.Title>
                        <p className="mb-1">
                          <strong>Course:</strong> {student.course}
                        </p>
                        <p className="mb-1">
                          <strong>Hostel Room:</strong> {student.hostelRoom}
                        </p>
                        <p className="mb-2">
                          <strong>Phone:</strong> {student.phone}
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
        onClick={() => alert("Add Student Clicked")}
      >
        <FaPlus size={20} />
      </button>
        </Container>
      </div>
    </div>
  );
}

export default StudentDetails;
