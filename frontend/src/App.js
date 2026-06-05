import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import { UserProvider } from "./contexts/UserContext";

// import Home from "./pages/Home";
import StudentDashboard from './StudentDashboard'
import TeacherSetup from './TeacherSetup'
import TeacherDashboard from './TeacherDashboard'
export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Allow both "/" and "/login" to render the Login screen */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/teacher-setup" element={<TeacherSetup />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
