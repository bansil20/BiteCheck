import { useState, useRef } from "react";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function AddStudentProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    enrollment: "",
    email: "",
    phone: "",
    course: "",
    hostelRoom: "",
    address: "",
    guardian: "",
    guardianPhone: "",
    image: null, // store image file
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image selection from camera
  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Student Data:", formData);

    // 👉 Later: Upload formData including image file to backend
    alert("Student added successfully!");
    navigate("/student_details");
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="mb-4 text-center fw-bold text-primary">
                Add New Student
              </h3>

              <Form onSubmit={handleSubmit}>
                {/* Student Name */}
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter student name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Enrollment No */}
                <Form.Group className="mb-3">
                  <Form.Label>Enrollment Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="enrollment"
                    placeholder="Enter enrollment number"
                    value={formData.enrollment}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Phone */}
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                {/* Course */}
                <Form.Group className="mb-3">
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Course --</option>
                    <option value="B.Tech Computer Science">
                      B.Tech Computer Science
                    </option>
                    <option value="BBA">BBA</option>
                    <option value="MBA">MBA</option>
                    <option value="MCA">MCA</option>
                  </Form.Select>
                </Form.Group>

                {/* Hostel Room */}
                <Form.Group className="mb-3">
                  <Form.Label>Hostel Room</Form.Label>
                  <Form.Control
                    type="text"
                    name="hostelRoom"
                    placeholder="Enter hostel room"
                    value={formData.hostelRoom}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Address */}
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Guardian */}
                <Form.Group className="mb-3">
                  <Form.Label>Guardian Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardian"
                    placeholder="Enter guardian name"
                    value={formData.guardian}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Guardian Phone */}
                <Form.Group className="mb-3">
                  <Form.Label>Guardian Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="guardianPhone"
                    placeholder="Enter guardian phone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Capture Image */}
                <Form.Group className="mb-4">
                  <Form.Label>Capture Student Photo</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Button
                      variant="outline-primary"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Open Camera
                    </Button>
                    {formData.image && (
                      <span className="text-success fw-bold">
                        📷 Image Captured
                      </span>
                    )}
                  </div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleImageCapture}
                  />
                </Form.Group>

                {/* Buttons */}
                <div className="d-flex justify-content-between">
                  <Button
                    variant="secondary"
                    onClick={() => navigate("/student_details")}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit">
                    Save Student
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AddStudentProfile;
