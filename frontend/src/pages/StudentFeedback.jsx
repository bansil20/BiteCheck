import { useState, useEffect } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import axios from "axios";

const EMOJI_TO_RATING = {
  "😡": 1,
  "😒": 2,
  "😑": 3,
  "😊": 4,
  "😍": 5
};

function StudentFeedback() {
  const [food, setFood] = useState(null);
  const [emojiFeedback, setEmojiFeedback] = useState("");
  const [comment, setComment] = useState("");
  const [wouldEatAgain, setWouldEatAgain] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch current food on mount
  useEffect(() => {
    axios.get("http://127.0.0.1:5000/get_current_food")
      .then(res => {
        setFood(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching current food:", err);
        alert("❌ Could not fetch current food. Check backend or meal timing.");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async () => {
    if (!emojiFeedback || wouldEatAgain === null || !studentName) {
      alert("⚠️ Please fill all fields before submitting.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:5000/submit_feedback", {
        foodid: food.foodid,
        studentname: studentName,
        emoji: emojiFeedback,
        comment,
        would_eat_again: wouldEatAgain
      });

      alert("✅ Feedback submitted successfully!");

      // Reset form
      setEmojiFeedback("");
      setComment("");
      setWouldEatAgain(null);
      setStudentName("");

    } catch (err) {
      console.error(err);
      alert("❌ Error submitting feedback. Check backend.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading current food...</div>;
  if (!food) return <div className="text-center mt-5">No food scheduled right now.</div>;

  return (
    <div className="dashboard-wrapper d-flex">
      <div className="main-content flex-grow-1">
        {/* Top Navbar */}
        <Navbar bg="light" expand="lg" className="px-4 shadow-sm">
          <Navbar.Brand className="pb-3 mb-3 mt-3 border-bottom text-start ps-3">
            <h4 className="fw-bold mb-0">Welcome Admin</h4>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#"><FaUser /> cz</Nav.Link>
          </Nav>
        </Navbar>

        <Container fluid className="p-4">
          <h3>Todays Food Feedback</h3>

          <div className="container mt-4">
            {/* Food Image */}
            <div className="text-center mb-3">
              <img
                  src={`http://127.0.0.1:5000${food.foodimage}`}
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
                alt={food.foodname}
                className="img-fluid rounded shadow"
              />
            </div>

            {/* Food Name + Description */}
            <div className="text-center mb-4">
              <h3 className="fw-bold">{food.foodname}</h3>
              <p className="text-muted">{food.fooddescription}</p>
            </div>

            {/* Emoji Feedback */}
            <div className="text-center mb-4">
              <h5 className="fw-bold">How did you like it?</h5>
              {Object.keys(EMOJI_TO_RATING).map((emoji) => (
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

            {/* Comment Box + Student Name */}
            <div className="mb-4">
              <label className="form-label fw-bold">Your Comment:</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Write your review here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <label className="form-label fw-bold mt-3">Student Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>

            {/* Would You Eat Again */}
            <div className="mb-4 text-center">
              <h5 className="fw-bold">Would you eat again?</h5>
              <button
                className={`btn me-2 ${wouldEatAgain === true ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setWouldEatAgain(true)}
              >
                👍🏻 Yes
              </button>
              <button
                className={`btn ${wouldEatAgain === false ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setWouldEatAgain(false)}
              >
                👎🏻 No
              </button>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button className="btn btn-primary" onClick={handleSubmit}>
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
