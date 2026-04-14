import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage/LandingPage';
import StudentLogin from './pages/Login/Student/StudentLogin';
import FacultyLogin from './pages/Login/Faculty/FacultyLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentRequest from './pages/student/StudentRequest';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyManage from './pages/faculty/FacultyManage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/request" element={<StudentRequest />} />
        <Route path="/faculty" element={<FacultyDashboard />} />
        <Route path="/faculty/manage" element={<FacultyManage />} />
      </Routes>
    </div>
  );
}

export default App;
