import {Container, Nav, Navbar} from "react-bootstrap";
import {FaUser} from "react-icons/fa";
import {useLocation} from "react-router-dom";
import React, {useEffect, useState} from "react";
import axios from "axios";
import {Table, Spinner} from "react-bootstrap";



function StudentProfile() {

    const {student} = useLocation().state; // student object passed
    console.log(student);

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://127.0.0.1:5000/get_attendance/${student.id}`)
            .then((res) => {
                setAttendance(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching attendance:", err);
                setLoading(false);
            });
    }, [student.id]);

    return (
        <div className="dashboard-wrapper d-flex">
            {/* Upper nav*/}
            <div className="main-content flex-grow-1">
                {/* Top Navbar */}
                <Navbar bg="light" expand="lg" className="px-4 shadow-sm">
                    <Navbar.Brand className="pb-3 mb-3 mt-3 border-bottom text-start ps-3"><h4
                        className="fw-bold mb-0"> Welcome Admin</h4></Navbar.Brand>

                    <Nav className="ms-auto">
                        <Nav.Link href="#">
                            <FaUser/>
                            cz
                        </Nav.Link>
                    </Nav>
                </Navbar>


                {/* Main body */}
                <Container fluid className="p-4">
                    <h3>Students Profile</h3>

                    <div className="container mt-4">

                        {/* Row 1 - Image + Name */}
                        <div className="row align-items-center mb-4">
                            <div className="col-auto" style={{border: 1}}>
                                <img
                                    src={student.face?.base64}
                                    alt="Student"
                                    style={{
                                        height: "120px",
                                        width: "100px",
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        marginRight: "15px"
                                    }}
                                />
                            </div>
                            <div className="col">
                                <h3 className="fw-bold mb-0">{student.name}</h3>
                            </div>
                        </div>

                        {/* Row 2 - Remarks + Details */}
                        <div className="row">
                            {/* Left Side */}
                            <div className="col-md-8 mb-3">
                                <div className="card">
                                    <div className="card-header fw-bold">Remarks</div>
                                    <div className="card-body">
                                        <p>
                                            {student.remark}
                                        </p>
                                    </div>
                                </div>
                                {/*attendance table*/}
<div className="card mt-4">
  <div className="card-header fw-bold">Attendance Records</div>
  <div className="card-body">
    {loading ? (
      <Spinner animation="border" />
    ) : attendance.length > 0 ? (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Day & Meal</th>
            <th>Food</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((att, idx) => (
            <tr key={idx}>
              <td>{att.timestamp}</td>
              <td>{`${att.day} - ${att.meal}`}</td>
              <td>{att.food}</td>
              <td>{att.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <p>No attendance records found.</p>
    )}
  </div>
</div>

                                {/*<div className="card mt-4">*/}
                                {/*    <div className="card-header fw-bold">Attendance Records</div>*/}
                                {/*    <div className="card-body">*/}
                                {/*        {loading ? (*/}
                                {/*            <Spinner animation="border"/>*/}
                                {/*        ) : attendance.length > 0 ? (*/}
                                {/*            <Table striped bordered hover responsive>*/}
                                {/*                <thead>*/}
                                {/*                <tr>*/}
                                {/*                    <th>Date & Time</th>*/}
                                {/*                    <th>Food</th>*/}
                                {/*                    <th>Status</th>*/}
                                {/*                </tr>*/}
                                {/*                </thead>*/}
                                {/*                <tbody>*/}
                                {/*                {attendance.map((att, idx) => (*/}
                                {/*                    <tr key={idx}>*/}
                                {/*                        <td>{att.timestamp}</td>*/}
                                {/*                        <td>{att.food}</td>*/}
                                {/*                        <td>{att.status}</td>*/}
                                {/*                    </tr>*/}
                                {/*                ))}*/}
                                {/*                </tbody>*/}
                                {/*            </Table>*/}
                                {/*        ) : (*/}
                                {/*            <p>No attendance records found.</p>*/}
                                {/*        )}*/}
                                {/*    </div>*/}
                                {/*</div>*/}

                            </div>

                            {/* Right Side */}
                            <div className="col-md-4 mb-3">
                                <div className="card">
                                    <div className="card-header fw-bold">Details</div>
                                    <div className="card-body">
                                        <p><strong>Student ID:</strong> {student.pnr}</p>
                                        <p><strong>Phone:</strong> +91 {student.phone}</p>
                                        <p><strong>Course:</strong> {student.course}</p>
                                        <p><strong>Email:</strong> {student.email}</p>
                                        <p><strong>Hostel Room:</strong> {student.hostelroom}</p>
                                        <p><strong>Blood Group:</strong> {student.bloodgrp}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </Container>
            </div>
        </div>

    )
}

export default StudentProfile;