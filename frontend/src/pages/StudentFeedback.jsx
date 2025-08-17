import { useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FaUser } from "react-icons/fa";

function StudentFeedback() {
  const [emojiFeedback, setEmojiFeedback] = useState("");
  const [comment, setComment] = useState("");
  const [wouldEatAgain, setWouldEatAgain] = useState(null);

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
        <Container fluid className="p-4">
          <h3>Todays Food Feedback</h3>
          <div className="container mt-4">
            {/* Food Image */}
            <div className="text-center mb-3">
              <img
                src="https://plus.unsplash.com/premium_photo-1749669869018-8a33825100f0?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
                alt="Food"
                className="img-fluid rounded shadow"
              />
            </div>

            {/* Food Name + Description */}
            <div className="text-center mb-4">
              <h3 className="fw-bold">Paneer Butter Masala</h3>
              <p className="text-muted">
                Rich and creamy paneer curry cooked with butter, fresh cream,
                and a blend of Indian spices.
              </p>
            </div>

            {/* Emoji Feedback */}
            <div className="text-center mb-4">
              <h5 className="fw-bold">How did you like it?</h5>
              {["😍", "😋", "😐", "😡"].map((emoji) => (
                <span
                  key={emoji}
                  style={{
                    fontSize: "2rem",
                    margin: "0 10px",
                    cursor: "pointer",
                    opacity: emojiFeedback === emoji ? 1 : 0.5,
                  }}
                  onClick={() => setEmojiFeedback(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>

            {/* Comment Box */}
            <div className="mb-4">
              <label className="form-label fw-bold">Your Comment</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Would You Eat Again */}
            <div className="mb-4 text-center">
              <h5 className="fw-bold">Would you eat again?</h5>
              <button
                className={`btn me-2 ${
                  wouldEatAgain === true ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setWouldEatAgain(true)}
              >
                👍🏻 Yes
              </button>
              <button
                className={`btn ${
                  wouldEatAgain === false ? "btn-danger" : "btn-outline-danger"
                }`}
                onClick={() => setWouldEatAgain(false)}
              >
                👎🏻 No
              </button>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  alert(`
              Food Feedback Submitted ✅
              Emoji: ${emojiFeedback}
              Comment: ${comment}
              Would Eat Again: ${wouldEatAgain ? "Yes" : "No"}
            `);
                }}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

export default StudentFeedback;
