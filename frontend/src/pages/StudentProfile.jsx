import { Container, Nav, Navbar } from "react-bootstrap";
import { FaUser } from "react-icons/fa";

function StudentProfile(){
    return(
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
                    <h3>Students Profile</h3>

                        <div className="container mt-4">
      
      {/* Row 1 - Image + Name */}
      <div className="row align-items-center mb-4">
        <div className="col-auto" style={{border : 1}}>
          <img
            src="https://plus.unsplash.com/premium_photo-1749669869018-8a33825100f0?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Student"
            style={{height: "120px",
                          width: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginRight: "15px"}}
          />
        </div>
        <div className="col">
          <h3 className="fw-bold mb-0">John Smith</h3>
        </div>
      </div>

      {/* Row 2 - Remarks + Details */}
      <div className="row">
        {/* Left Side */}
        <div className="col-md-8 mb-3">
          <div className="card">
            <div className="card-header fw-bold">Remarks</div>
            <div className="card-body">
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut
                perspiciatis unde omnis iste natus error sit voluptatem.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="col-md-4 mb-3">
          <div className="card">
            <div className="card-header fw-bold">Details</div>
            <div className="card-body">
              <p><strong>Student ID:</strong> 12345</p>
              <p><strong>Phone:</strong> +91 98765 43210</p>
              <p><strong>Email:</strong> john@example.com</p>
              <p><strong>Hostel Room:</strong> A-202</p>
              <p><strong>Blood Group:</strong> O+</p>
            </div>
          </div>
        </div>
      </div>

    </div>

                </Container>
            </div>
        </div>        
        
    )
}

export default StudentProfile;