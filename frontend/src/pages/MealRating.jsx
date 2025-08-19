import { useState } from "react";
import { Card, Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function MealRating() {
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary static data
  const foods = [
    {
      id: 1,
      name: "Paneer Butter Masala",
      description: "Rich and creamy curry with soft paneer cubes.",
      image: "https://plus.unsplash.com/premium_photo-1749669869018-8a33825100f0?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      rating: 4.5,
    },
    {
      id: 2,
      name: "Veg Biryani",
      description: "Fragrant rice with mixed vegetables and spices.",
      image: "https://via.placeholder.com/300x200",
      rating: 4.0,
    },
    {
      id: 3,
      name: "Masala Dosa",
      description: "Crispy dosa stuffed with spiced potato filling.",
      image: "https://via.placeholder.com/300x200",
      rating: 4.8,
    },
  ];

  // Filter based on search
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


    const navigate = useNavigate();
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
          <h3>Meal Rating</h3>
          <div className="container mt-4">
            {/* Search Bar */}
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
              {foods.map((food) => (
                <Col key={food.id} md={4} sm={6} className="mb-4">
                  <Card
            className="shadow-sm h-100"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/meal_average/${food.id}`)} // Navigate on click
          >
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        {/* Image on left */}
                        <img
                          src={food.image}
                          alt={food.name}
                          style={{
                            height: "120px",
                            width: "120px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            marginRight: "15px",
                          }}
                        />

                        {/* Details on right */}
                        <div>
                          <Card.Title className="fw-bold">
                            {food.name}
                          </Card.Title>
                          <p className="mb-1">{food.description}</p>
                          <p className="fw-bold">⭐ {food.rating} / 5</p>
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
