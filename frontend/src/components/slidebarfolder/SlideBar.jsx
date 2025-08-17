import { Nav } from "react-bootstrap"
import PATHS from "../../utlis/constants/Path"
import { MdFace, MdFeedback } from "react-icons/md"
import { FaDownload, FaRegClock, FaStar, FaTachometerAlt, FaUserGraduate } from "react-icons/fa"

function SlideBar(){

    return(
        <>
             {/* Sidebar */}
                <div className="sidebar bg-dark text-white p-3">
                    <h3 className="mb-4">Smart Food</h3>
                    <hr style={{backgroundColor: "white"}} />
                    <p>Main Menu</p>
                    <Nav className="flex-column">
                    
                    <Nav.Link href="#" className="text-white"><MdFace /> Face Attendance</Nav.Link>
                    <Nav.Link href={PATHS.DASHBOARD} className="text-white"><FaTachometerAlt /> Dashboard</Nav.Link>
                    <Nav.Link href={PATHS.STUDENTDETAILS} className="text-white"><FaUserGraduate /> Student Details</Nav.Link>
                    <Nav.Link href={PATHS.STUDENTFEEDBACK} className="text-white"><MdFeedback /> Meal Feedback</Nav.Link>
                    <Nav.Link href="#" className="text-white"><FaDownload /> Download Report</Nav.Link>
                    <Nav.Link href="#" className="text-white"><FaRegClock /> Meal Time Table</Nav.Link>
                    <Nav.Link href={PATHS.MEALRATING} className="text-white"><FaStar /> Meal Rating</Nav.Link>
                            

                    </Nav>
                </div>

        </>
    )
}

export default SlideBar