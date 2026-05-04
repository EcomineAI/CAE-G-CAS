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
/* ===== LIGHT MODE (default) ===== */
:root {
  --primary: #FF6B00;
  --primary-hover: #ff7b1a;
  --bg-color: #f7f9fc;
  --card-bg: rgba(255, 255, 255, 0.92);
  --card-border: rgba(223, 169, 161, 0.4);
  --text-main: #1a1a1a;
  --text-muted: #5f6368;
  --shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  --input-bg: #ffffff;
  --input-border: #e2e8f0;
  --input-text: #1e293b;
  --input-focus-bg: #ffffff;
  --input-icon: #94a3b8;
  --input-placeholder: #94a3b8;
  --toggle-bg: #f0f0f0;
  --toggle-border: #e0e0e0;
  --toggle-slider: #fff;
  --toggle-text: #5f6368;
  --overlay-color: rgba(255, 255, 255, 0.72);
  --border-radius: 12px;
  --transition: all 0.2s ease-in-out;
  --heading-color: #1a1a1a;
  --error-bg: #fee2e2;
  --error-text: #ef4444;
  --secondary-btn-bg: #f1f3f4;
  --secondary-btn-text: #1a1a1a;
  --secondary-btn-hover: #e8eaed;
  --password-hover: #000;
}

/* ===== DARK MODE ===== */
.dark {
  --bg-color: #0f1117;
  --card-bg: rgba(30, 32, 40, 0.92);
  --card-border: rgba(255, 255, 255, 0.08);
  --text-main: #e4e4e7;
  --text-muted: #9ca3af;
  --shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  --input-bg: rgba(30, 32, 40, 0.8);
  --input-border: rgba(255, 255, 255, 0.1);
  --input-text: #ffffff;
  --input-focus-bg: rgba(30, 32, 40, 0.95);
  --input-icon: #94a3b8;
  --input-placeholder: #64748b;
  --toggle-bg: #27293a;
  --toggle-border: #3f3f46;
  --toggle-slider: #3f3f46;
  --toggle-text: #9ca3af;
  --overlay-color: rgba(15, 17, 23, 0.78);
  --heading-color: #f4f4f5;
  --error-bg: rgba(239, 68, 68, 0.15);
  --error-text: #f87171;
  --secondary-btn-bg: #27293a;
  --secondary-btn-text: #e4e4e7;
  --secondary-btn-hover: #3f3f46;
  --password-hover: #e4e4e7;
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
}

/* ===== Background Image Layer ===== */
.auth-bg-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.auth-bg-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('/GCBG.jpg') center/cover no-repeat;
  filter: blur(2px);
  transform: scale(1.05);
}

.auth-bg-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--overlay-color);
  backdrop-filter: blur(1px);
}

.app-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  margin: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.5s ease;
}

.premium-card {
  background: var(--card-bg);
  padding: 2.5rem;
  border-radius: 15px;
  border: 1px solid var(--card-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  transition: var(--transition);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.gcas-title {
  font-weight: 900;
  font-size: 3rem;
  color: var(--heading-color);
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

/* ===== Dark Mode Toggle for Auth Pages ===== */
.auth-theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 10;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: var(--transition);
}

.auth-theme-toggle:hover {
  transform: scale(1.1);
  color: var(--primary);
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
