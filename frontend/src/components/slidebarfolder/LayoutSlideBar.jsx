// Layout.jsx
import React from "react";
import Sidebar from "./SlideBar"; // your left nav bar

export default function LayoutSlideBar({ children }) {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar stays on left */}
      <Sidebar />

      {/* Main page content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}
