import React from "react";
import { Container, Row, Col, Navbar, Nav, Card } from "react-bootstrap";
import { FaTachometerAlt, FaCalendarAlt, FaClipboardList, FaUser, FaCameraRetro, FaCalendarCheck, FaUserFriends, FaBan } from "react-icons/fa";
import "./Dashboard.css";
import { FaCamera } from "react-icons/fa6";

import { FaUserGraduate, FaDownload, FaRegClock, FaStar } from 'react-icons/fa';
import { MdFace, MdFeedback } from 'react-icons/md';
import PATHS from "../utlis/constants/Path";


function Dashboard() {
  
  return (
    <div className="dashboard-wrapper d-flex">
     
      

      {/* Upper nav*/}
      <div className="main-content flex-grow-1">
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="px-4 shadow-sm">
          <Navbar.Brand className="pb-3 mb-3 mt-3 border-bottom text-start ps-3"><h4 className="fw-bold mb-0"> Welcome Admin</h4></Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#"><FaUser />cz</Nav.Link>
          </Nav>
           
        </Navbar>
       

        {/* Main body */}
        <Container fluid className="p-4">
          <Col>
            <p>Recent Data</p>
              <Row>
                {/* Card 1 */}
                <Col md={4}>
                  <Card className="shadow-sm" style={{ height: "160px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Total Appointments</h6>
                          <h3>658 <span className="badge bg-success">+95%</span></h3>
                          <small className="text-success">+21% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCalendarCheck />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card 2 */}
                <Col md={4}>
                  <Card className="shadow-sm"  style={{ height: "160px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Online Consultations</h6>
                          <h3>125 <span className="badge bg-danger">-15%</span></h3>
                          <small className="text-danger">-21% in last 7 days</small>
                        </div>
                        <div className="text-danger fs-1">
                          <FaUserFriends />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Card 3 */}
                <Col md={4}>
                  <Card className="shadow-sm"  style={{ height: "160px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Cancelled Appointments</h6>
                          <h3>35 <span className="badge bg-success">+45%</span></h3>
                          <small className="text-success">+31% in last 7 days</small>
                        </div>
                        <div className="text-success fs-1">
                          <FaBan />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

                {/* today  meal and graph */}
              <Row>
                {/* Card 4 */}
                <Col md={4} style={{paddingTop: 30}}>
                  <Card className="shadow-sm" style={{ height: "350px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Upcoming Meal</h6>
                          <h3>500 <span className="badge bg-success">+12%</span></h3>
                          <small className="text-success">+17% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCamera />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Card 5 */}
                <Col  style={{paddingTop: 30}}>
                <Card className="shadow-sm" style={{ height: "350px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Upcoming Meal</h6>
                          <h3>500 <span className="badge bg-success">+12%</span></h3>
                          <small className="text-success">+17% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCamera />
                        </div>
                      </div>
                    </Card.Body>
                </Card>    
                </Col>
              </Row>
              <Row>
                 <Col md={3} style={{paddingTop: 30}}>
                  <Card className="shadow-sm" style={{ height: "200px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Upcoming Meal</h6>
                          <h3>500 <span className="badge bg-success">+12%</span></h3>
                          <small className="text-success">+17% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCamera />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3} style={{paddingTop: 30}}>
                  <Card className="shadow-sm" style={{ height: "200px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Upcoming Meal</h6>
                          <h3>500 <span className="badge bg-success">+12%</span></h3>
                          <small className="text-success">+17% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCamera />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>


                <Col md={3} style={{paddingTop: 30}}>
                  <Card className="shadow-sm" style={{ height: "200px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Upcoming Meal</h6>
                          <h3>500 <span className="badge bg-success">+12%</span></h3>
                          <small className="text-success">+17% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCamera />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>


              

                <Col md={3} style={{paddingTop: 30}}>
                  <Card className="shadow-sm" style={{ height: "200px" }}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6>Upcoming Meal</h6>
                          <h3>500 <span className="badge bg-success">+12%</span></h3>
                          <small className="text-success">+17% in last 7 days</small>
                        </div>
                        <div className="text-primary fs-1">
                          <FaCamera />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* <div className="space-y-6"> */}
                  {/* First row */}
                  {/* <div className="grid grid-cols-4 gap-6"> */}
                    {/* <Card title="Total Patient" value="658" change="+31%" changeColor="text-green-500" /> */}
                    {/* <Card title="Video Consultation" value="256" change="-21%" changeColor="text-red-500" /> */}
                    {/* <Card title="Rescheduled" value="141" change="+64%" changeColor="text-green-500" /> */}
                    {/* <Card title="Pre Visit Bookings" value="524" change="+38%" changeColor="text-green-500" /> */}
                  {/* </div> */}
{/*  */}
                  {/* Second row */}
                  {/* <div className="grid grid-cols-4 gap-6"> */}
                    {/* <Card title="New Patients" value="320" change="+12%" changeColor="text-green-500" /> */}
                    {/* <Card title="Follow-up Consultations" value="145" change="-8%" changeColor="text-red-500" /> */}
                    {/* <Card title="Cancellations" value="28" change="+3%" changeColor="text-green-500" /> */}
                    {/* <Card title="Lab Tests" value="94" change="+15%" changeColor="text-green-500" /> */}
                  {/* </div> */}
                {/* </div> */}
              </Row>
          </Col>
          
        </Container>
      </div>
    </div>
  );
}

export default Dashboard;
