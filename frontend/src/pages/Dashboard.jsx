import React, {useEffect} from "react";
import {Row, Col, Card} from "react-bootstrap";
import {FaCalendarCheck, FaUserFriends, FaBan} from "react-icons/fa";
import "./Dashboard.css";
import {FaCamera} from "react-icons/fa6";

import PageHeader from "../components/PageHeader/PageHeader";


function Dashboard() {
    const [foodData, setFoodData] = React.useState({});


    const loadFoodDetails = async () => {

        // Fetch current food
        const foodRes = await fetch("http://localhost:5000/get_current_food");
        const currentFood = await foodRes.json();



        // If food found → fetch suggestion
        if (currentFood.foodid) {

            const sugRes = await fetch(
                `http://localhost:5000/get_food_suggestion/${currentFood.foodid}`
            );
            const suggestion = await sugRes.json();

            // Update state
            setFoodData({
                foodname: currentFood.foodname,
                foodimage: currentFood.foodimage,
                suggestion_paragraph: suggestion.suggestion_paragraph,
                currentFood : currentFood.status === "current" ? "Current Meal" : "Upcoming Meal"
            });
        }
    };


    useEffect(() => {
        loadFoodDetails();
    }, []);

    return (
        <div className="container mt-4">
            <PageHeader PageTitle="Welcome Admin"/>
            <br/>

            <h4 className="fw-normal">&nbsp;&nbsp;Recent Data</h4>
            <Row>
                {/* Card 1 */}
                <Col md={4}>
                    <Card className="shadow-sm" style={{height: "160px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Total Appointments</h6>
                                    <h3>658 <span className="badge bg-success">+95%</span></h3>
                                    <small className="text-success">+21% in last 7 days</small>
                                </div>
                                <div className="text-primary fs-1">
                                    <FaCalendarCheck/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Card 2 */}
                <Col md={4}>
                    <Card className="shadow-sm" style={{height: "160px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Online Consultations</h6>
                                    <h3>125 <span className="badge bg-danger">-15%</span></h3>
                                    <small className="text-danger">-21% in last 7 days</small>
                                </div>
                                <div className="text-danger fs-1">
                                    <FaUserFriends/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Card 3 */}
                <Col md={4}>
                    <Card className="shadow-sm" style={{height: "160px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Cancelled Appointments</h6>
                                    <h3>35 <span className="badge bg-success">+45%</span></h3>
                                    <small className="text-success">+31% in last 7 days</small>
                                </div>
                                <div className="text-success fs-1">
                                    <FaBan/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* today  meal and graph */}
            <Row>
                {/* Card 4 */}
                <Col md={4} className="pt-4">

                    <Card className="shadow-lg border-0 rounded-4">
                        <Card.Body className="p-4">

                            <div className="d-flex justify-content-between align-items-start">

                                {/* LEFT SIDE */}
                                <div className="me-3" style={{maxWidth: "70%"}}>

                                    {/* Small Title */}
                                    <span className="text-uppercase text-muted fw-semibold small">
                        {foodData.currentFood}
                    </span>

                                    {/* Meal Name */}
                                    <h3 className="fw-bold mt-1 mb-3 text-dark">
                                        {foodData.foodname || "Loading..."}
                                    </h3>

                                    {/* Suggestion Title */}
                                    <h6 className="fw-bold text-dark mb-2" style={{fontSize: "14px"}}>
                                        Suggestion
                                    </h6>

                                    {/* Suggestion Box */}
                                    <div
                                        className="p-3 rounded-3"
                                        style={{
                                            background: "#f8f9fa",
                                            borderLeft: "4px solid #ff7e5f",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                                        }}
                                    >
                                        <p className="mb-0 text-secondary" style={{fontSize: "14px"}}>
                                            {foodData.suggestion_paragraph || "Fetching suggestion..."}
                                        </p>
                                    </div>

                                </div>

                                {/* RIGHT SIDE IMAGE */}
                                <div
                                    className="rounded-4 overflow-hidden shadow"
                                    style={{
                                        width: "100px",
                                        height: "100px",
                                        border: "3px solid #ffffff"
                                    }}
                                >
                                    <img
                                        src={`${foodData.foodimage}`}
                                        alt={foodData.foodname}
                                        className="w-100 h-100"
                                        style={{objectFit: "cover"}}
                                    />
                                </div>

                            </div>

                        </Card.Body>
                    </Card>

                </Col>


                {/* Card 5 */}
                <Col style={{paddingTop: 30}}>
                    <Card className="shadow-sm" style={{height: "350px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Upcoming Meal</h6>
                                    <h3>500 <span className="badge bg-success">+12%</span></h3>
                                    <small className="text-success">+17% in last 7 days</small>
                                </div>
                                <div className="text-primary fs-1">
                                    <FaCamera/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={3} style={{paddingTop: 30}}>
                    <Card className="shadow-sm" style={{height: "200px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Upcoming Meal</h6>
                                    <h3>500 <span className="badge bg-success">+12%</span></h3>
                                    <small className="text-success">+17% in last 7 days</small>
                                </div>
                                <div className="text-primary fs-1">
                                    <FaCamera/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={3} style={{paddingTop: 30}}>
                    <Card className="shadow-sm" style={{height: "200px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Upcoming Meal</h6>
                                    <h3>500 <span className="badge bg-success">+12%</span></h3>
                                    <small className="text-success">+17% in last 7 days</small>
                                </div>
                                <div className="text-primary fs-1">
                                    <FaCamera/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>


                <Col md={3} style={{paddingTop: 30}}>
                    <Card className="shadow-sm" style={{height: "200px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Upcoming Meal</h6>
                                    <h3>500 <span className="badge bg-success">+12%</span></h3>
                                    <small className="text-success">+17% in last 7 days</small>
                                </div>
                                <div className="text-primary fs-1">
                                    <FaCamera/>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>


                <Col md={3} style={{paddingTop: 30}}>
                    <Card className="shadow-sm" style={{height: "200px"}}>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6>Upcoming Meal</h6>
                                    <h3>500 <span className="badge bg-success">+12%</span></h3>
                                    <small className="text-success">+17% in last 7 days</small>
                                </div>
                                <div className="text-primary fs-1">
                                    <FaCamera/>
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

        </div>
    );
}

export default Dashboard;
