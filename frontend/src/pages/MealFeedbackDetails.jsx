import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {Card, Container, Row, Col, Navbar, Nav, Button} from "react-bootstrap";
import {FaDownload, FaStar, FaUser} from "react-icons/fa";
import axios from "axios";

function MealFeedbackDetails() {
  const { foodid, date } = useParams();
  const { state } = useLocation();
  const mealFromState = state?.food || null;

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/get_feedback_by_date/${foodid}/${date}`)
      .then((res) => {
        setFeedbacks(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [foodid, date]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          color={i <= Math.round(rating) ? "#FFD700" : "#ddd"}
          className="me-1"
        />
      );
    }
    return stars;
  };

  const mealName = mealFromState?.foodname || `Meal #${foodid}`;
  const mealHeroImage =
    `http://127.0.0.1:5000${mealFromState?.foodimage}` ||
    "https://via.placeholder.com/600x240";

   const handleDownloadFeedbackPDF = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/download_feedback_pdf/${date}/${mealName}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Feedback_${mealName}_${date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Error downloading PDF:", error);
      alert("Failed to download feedback PDF. Check backend logs.");
    }
  };


  return (
    <div className="dashboard-wrapper d-flex flex-column min-vh-100">
      <Navbar bg="white" expand="lg" className="px-4 shadow-sm sticky-top">
        <Navbar.Brand className="fw-bold">🍽️ Smart Food</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link href="#">
            <FaUser className="me-1" /> Admin
          </Nav.Link>
        </Nav>
      </Navbar>

      <div
        style={{
          backgroundImage: `url(${mealHeroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 20px",
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            borderRadius: "12px",
            padding: "30px",
            maxWidth: "700px",
            margin: "auto",
          }}
        >
          <h2 className="fw-bold">{mealName}</h2>
          <h5>{date}</h5>
        </div>
      </div>

      <Container className="my-5">
        <h4 className="mb-4 fw-semibold">Student Feedbacks</h4>
          {/* ✅ Download PDF Button */}
          <Button
            variant="primary"
            className="d-flex align-items-center"
            onClick={handleDownloadFeedbackPDF}
          >
            <FaDownload className="me-2" /> Download Feedback PDF
          </Button>
        <Row>
  {loading ? (
    <p>Loading...</p>
  ) : feedbacks.length === 0 ? (
    <p>No feedback for this date.</p>
  ) : (
    feedbacks.map((f, i) => (
      <Col md={6} key={i} className="mb-4">
        <Card className="shadow-lg border-0 h-100">
          <Card.Body>
            {/* Top Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold mb-0">{f.studentname}</h6>
                <small className="text-muted">{f.created_at}</small>
              </div>
              <div className="d-flex align-items-center">
                {renderStars(f.rating)}
                <span className="ms-2 fw-semibold">{f.rating}/5</span>
              </div>
            </div>

            {/* Feedback Comment */}
            <Card.Text className="mt-2 text-dark">
              📝 {f.comment || <span className="text-muted">No comment provided.</span>}
            </Card.Text>

            {/* Eat Again Status */}
            <div className="mt-3">
              {f.eat_again ? (
                <span className="text-success fw-semibold">✅ Would eat again</span>
              ) : (
                <span className="text-danger fw-semibold">❌ Would not eat again</span>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    ))
  )}
</Row>

      </Container>
    </div>
  );
}

export default MealFeedbackDetails;
