import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import PATHS from "./utlis/constants/Path";
import StudentDetails from "./pages/StudentDetails";
import LayoutSlideBar from "./components/slidebarfolder/LayoutSlideBar";
import StudentProfile from "./pages/StudentProfile";
import StudentFeedback from "./pages/StudentFeedback";
import MealRating from "./pages/MealRating";
import MealAverage from "./pages/MealAverage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path={PATHS.REGISTER} element={<Register />} />
        {/* <Route path={PATHS.DASHBOARD} element={<Dashboard />} /> */}
        <Route path={PATHS.DASHBOARD} element={<LayoutSlideBar><Dashboard /></LayoutSlideBar>}/>
        <Route path={PATHS.STUDENTDETAILS} element={<LayoutSlideBar><StudentDetails/></LayoutSlideBar>} />
        <Route path={PATHS.STUDENTPROFILE} element={<LayoutSlideBar><StudentProfile /></LayoutSlideBar>} />
        <Route path={PATHS.STUDENTFEEDBACK} element={<LayoutSlideBar><StudentFeedback /></LayoutSlideBar>} />
        <Route path={PATHS.MEALRATING} element={<LayoutSlideBar><MealRating/></LayoutSlideBar>} />
        <Route path={PATHS.MEALAVERAGE} element={<LayoutSlideBar><MealAverage /></LayoutSlideBar>} />
      </Routes>
    </Router>
  );
}

export default App;
