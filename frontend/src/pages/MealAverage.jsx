import { Card, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { FaStar, FaUser } from "react-icons/fa";
import { useLocation, useParams } from "react-router-dom";



const MEAL_HISTORY = {
  1: [
    { id: "1a", date: "2025-08-01", rating: 4.5, image: "https://via.placeholder.com/120x100" },
    { id: "1b", date: "2025-08-08", rating: 4.2, image: "https://via.placeholder.com/120x100" },
    { id: "1c", date: "2025-08-15", rating: 4.7, image: "https://via.placeholder.com/120x100" },
  ],
  2: [
    { id: "2a", date: "2025-08-03", rating: 3.8, image: "https://via.placeholder.com/120x100" },
    { id: "2b", date: "2025-08-10", rating: 4.1, image: "https://via.placeholder.com/120x100" },
  ],
  3: [
    { id: "3a", date: "2025-08-02", rating: 4.9, image: "https://via.placeholder.com/120x100" },
    { id: "3b", date: "2025-08-09", rating: 4.7, image: "https://via.placeholder.com/120x100" },
    { id: "3c", date: "2025-08-13", rating: 4.8, image: "https://via.placeholder.com/120x100" },
  ],
};

function MealAverage() {
  const { id } = useParams();
  const { state } = useLocation();

  const mealFromState = state?.food || null;
  const history = MEAL_HISTORY[id] || [];

  const avg =
    history.length > 0
      ? (history.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / history.length).toFixed(1)
      : null;

  const mealName = mealFromState?.name || `Meal #${id}`;
  const mealHeroImage =
    mealFromState?.image || history[0]?.image || "https://via.placeholder.com/600x240";

  const sortedHistory = [...history].sort((a, b) => (a.date < b.date ? 1 : -1));

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar key={i} color={i <= Math.round(rating) ? "#FFD700" : "#ddd"} className="me-1" />
      );
    }
    return stars;
  };

  return (
    <div className="dashboard-wrapper d-flex flex-column min-vh-100">
      {/* Top Navbar */}
      <Navbar bg="white" expand="lg" className="px-4 shadow-sm sticky-top">
        <Navbar.Brand className="fw-bold">🍽️ Smart Food</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link href="#">
            <FaUser className="me-1" /> Admin
          </Nav.Link>
        </Nav>
      </Navbar>

      {/* Hero section with background */}
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
          {avg ? (
            <div className="d-flex align-items-center mt-2">
              {renderStars(avg)}
              <span className="ms-3 fs-5">Avg: {avg} / 5</span>
            </div>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      </div>

      {/* Main content */}
      <Container className="my-5">
        <h4 className="mb-4 fw-semibold">📌 Past Meal Feedback</h4>
        <Row>
          {sortedHistory.length === 0 ? (
            <Col>
              <Card className="shadow-sm border-0 text-center p-4">
                <Card.Body>No past feedback found for this meal.</Card.Body>
              </Card>
            </Col>
          ) : (
            sortedHistory.map((entry) => (
              <Col md={6} lg={4} key={entry.id} className="mb-4">
                <Card
                  className="shadow border-0 h-100"
                  style={{
                    borderRadius: "16px",
                    transition: "transform 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Card.Img
                    variant="top"
                    src={entry.image || mealHeroImage}
                    style={{
                      height: "180px",
                      objectFit: "cover",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                    }}
                  />
                  <Card.Body>
                    <Card.Title className="fw-bold">{mealName}</Card.Title>
                    <div className="d-flex align-items-center mt-2">
                      {renderStars(entry.rating)}
                      <span className="ms-2 fw-semibold">{entry.rating}/5</span>
                    </div>
                    <Card.Text className="text-muted mt-2">
                      🍴 Served on: {entry.date}
                    </Card.Text>
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
export default MealAverage;
