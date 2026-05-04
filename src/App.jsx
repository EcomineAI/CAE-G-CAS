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
import ProtectedRoute from './components/ProtectedRoute';

const appStyles = `
:root {
  --primary: #FF6B00;
  --primary-hover: #ff7b1a;
  --bg-color: #f7f9fc;
  --card-bg: #ffffff;
  --card-border: rgba(223, 169, 161, 0.4);
  --text-main: #000000;
  --text-muted: #5f6368;
  --shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  --input-bg: #f8f9fa;
  --border-radius: 12px;
  --transition: all 0.2s ease-in-out;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Outfit', 'Inter', system-ui, sans-serif;
}

body {
  background-color: var(--bg-color);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-main);
  overflow-x: hidden;
  position: relative;
}

body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/GCBG.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.25;
  z-index: -1;
}

.app-container {
  width: 100%;
  max-width: 500px;
  margin: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.premium-card {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: 15px;
  border: 1px solid var(--card-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  width: 100%;
  transition: var(--transition);
}

.gcas-title {
  font-weight: 900;
  font-size: 3rem;
  color: #1a1a1a;
  letter-spacing: -1px;
  margin-bottom: 0;
  line-height: 1;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 2rem;
  letter-spacing: 0.5px;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.5s ease forwards;
}
`;

function App() {
  return (
    <>
      <style>{appStyles}</style>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/faculty" element={<FacultyLogin />} />
        
        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/request" element={
          <ProtectedRoute allowedRole="student">
            <StudentRequest />
          </ProtectedRoute>
        } />

        {/* Faculty Routes */}
        <Route path="/faculty" element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/faculty/manage" element={
          <ProtectedRoute allowedRole="faculty">
            <FacultyManage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
