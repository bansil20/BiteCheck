import { useEffect, useState } from "react";
import { Card, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { FaUser, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MealRating() {
  const [searchTerm, setSearchTerm] = useState("");
  const [foodItem, setFoodItem] = useState([]);
  const [ratings, setRatings] = useState({}); // store avg rating per foodid

  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5000/get_foods`)
      .then((res) => {
        setFoodItem(res.data);
        // For each food, fetch its feedback to calculate avg
        res.data.forEach((food) => fetchAverageRating(food.foodid));
      })
      .catch((err) => {
        console.error("Error fetching foods:", err);
      });
  }, []);

  // ✅ Fetch average rating for each food
  const fetchAverageRating = async (foodid) => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/get_feedback/${foodid}`);
      const feedbacks = res.data;

      if (feedbacks.length === 0) {
        setRatings((prev) => ({ ...prev, [foodid]: 0 }));
        return;
      }

      // calculate overall average (consider avg_rating if grouped by date, else rating)
      const avg =
        feedbacks.reduce(
          (sum, f) => sum + (f.avg_rating ? Number(f.avg_rating) : Number(f.rating)),
          0
        ) / feedbacks.length;

      setRatings((prev) => ({ ...prev, [foodid]: avg }));
    } catch (err) {
      console.error(`Error fetching feedback for food ${foodid}:`, err);
    }
  };

  // ✅ Filter search
  const filteredFoods = foodItem.filter((food) =>
    food.foodname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ Render stars for average rating
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

  return (
    <div className="dashboard-wrapper d-flex">
      {/* Main Content */}
      <div className="main-content flex-grow-1">
        {/* Navbar */}
        <Navbar bg="light" expand="lg" className="px-4 shadow-sm">
          <Navbar.Brand className="pb-3 mb-3 mt-3 border-bottom text-start ps-3">
            <h4 className="fw-bold mb-0">Welcome Admin</h4>
          </Navbar.Brand>

          <Nav className="ms-auto">
            <Nav.Link href="#">
              <FaUser /> cz
            </Nav.Link>
          </Nav>
        </Navbar>

        {/* Page Body */}
        <Container fluid className="p-4">
          <h3>Meal Rating</h3>
          <div className="container mt-4">
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                className="form-control"
                placeholder="Search food..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: "300px" }}
              />
            </div>

            {/* Food Cards */}
            <Row>
              {filteredFoods.map((food, idx) => (
                <Col key={idx} md={4} sm={6} className="mb-4">
                  <Card
                    className="shadow-sm h-100"
                    style={{ cursor: "pointer", transition: "0.3s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                    onClick={() =>
                      navigate(`/meal_average/${food.foodid}`, { state: { food } })
                    }
                  >
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        {/* Image */}
                        <img
                          src={`http://127.0.0.1:5000${food.foodimage}`}
                          alt={food.foodname}
                          style={{
                            height: "120px",
                            width: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginRight: "15px",
                          }}
                        />

                        {/* Details */}
                        <div>
                          <Card.Title className="fw-bold">
                            {food.foodname}
                          </Card.Title>
                          <p className="mb-1">{food.fooddescription}</p>

                          {/* ✅ Show overall average */}
                          {ratings[food.foodid] > 0 ? (
                            <div className="d-flex align-items-center">
                              {renderStars(ratings[food.foodid])}
                              <span className="ms-2 fw-semibold">
                                {ratings[food.foodid].toFixed(1)} / 5
                              </span>
                            </div>
                          ) : (
                            <p className="text-muted mb-0">No ratings yet</p>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default MealRating;
