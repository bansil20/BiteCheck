import React, {useState, useRef} from "react";
import {Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import Webcam from "react-webcam";
import axios from "axios";
import {useNavigate} from "react-router-dom";

function AddStudentProfile() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        studname: "",
        studpnr: "",
        studphone: "",
        studcourse: "",
        studemail: "",
        studremark: "",
        studhostelroom: "",
        studface: null, // temporary storage of captured face
    });

    const [showCamera, setShowCamera] = useState(false);
    const [message, setMessage] = useState("");


    const webcamRef = useRef(null);
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };


    const handleCaptureFace = () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setFormData({...formData, studface: imageSrc});
            // store in state
            setMessage("✅ Face captured successfully");
            setShowCamera(false); // hide camera if desired
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault(); // prevent page reload

        try {
            const res = await axios.post("http://127.0.0.1:5000/add_student", formData);
            alert(res.data.message);
            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("❌ Error saving student");
        }
    };


    return (
        <Container className="mt-4">
            <Card className="p-4 shadow-lg">
                <h2 className="text-center mb-4">Add Student Profile</h2>

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="studname"
                                    value={formData.studname}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Enrollment Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="studpnr"
                                    value={formData.studpnr}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="studphone"
                                    value={formData.studphone}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="studemail"
                                    value={formData.studemail}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Course</Form.Label>
                                <Form.Select
                                    name="studcourse"
                                    value={formData.studcourse}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Course</option>
                                    <option value="B.Tech">B.Tech</option>
                                    <option value="MBA">MBA</option>
                                    <option value="MCA">MCA</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Hostel Room No.</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="studhostelroom"
                                    value={formData.studhostelroom}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Remark</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    name="studremark"
                                    value={formData.studremark}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {/* Camera Button */}
                            <div className="mt-3">
                                {/* Open Camera Button */}
                                <Button variant="primary" onClick={() => setShowCamera(true)}>
                                    Open Camera
                                </Button>
                            </div>

                            {/* Show Camera and Register Face Button */}
                            {showCamera && (
                                <div className="mt-3 text-center">
                                    <Webcam
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        width={300}
                                        height={200}
                                    />
                                    <Button
                                        variant="success"
                                        className="mt-2"
                                        onClick={handleCaptureFace} // <-- captures face locally
                                    >
                                        Register Face
                                    </Button>
                                </div>
                            )}

                            {message && <p className="mt-2 text-center">{message}</p>}
                        </Col>
                    </Row>

                    {/* Save Student Button */}
                    <div className="text-center mt-4">
                        <Button variant="success" type="submit">
                            Save Student
                        </Button>
                    </div>
                    <Button
                        variant="secondary"
                        className="ms-2"
                        onClick={() => navigate("/dashboard")}
                    >
                        Cancel
                    </Button>


                </Form>
            </Card>
        </Container>

    )
        ;
}

export default AddStudentProfile;
