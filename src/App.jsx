import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentRequest from './pages/student/StudentRequest';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyManage from './pages/faculty/FacultyManage';
import ProtectedRoute from './components/ProtectedRoute';

const appStyles = `
/* ── Auth page tokens ── */
:root {
  --primary:           #1a2d5a;
  --primary-hover:     #152348;
  --bg-color:          #d4d8e0;
  --card-bg:           #ffffff;
  --card-border:       rgba(0, 0, 0, 0.08);
  --text-main:         #1a1a1a;
  --text-muted:        #6b7280;
  --shadow:            0 4px 24px rgba(0, 0, 0, 0.10);
  --input-bg:          #ffffff;
  --input-border:      #d1d5db;
  --input-text:        #1e293b;
  --input-focus-bg:    #ffffff;
  --input-icon:        #9ca3af;
  --input-placeholder: #9ca3af;
  --toggle-bg:         #e8eaf0;
  --toggle-border:     #d1d5db;
  --toggle-slider:     #1a2d5a;
  --toggle-text:       #6b7280;
  --toggle-active-text: #ffffff;
  --overlay-color:     rgba(212, 216, 224, 0.85);
  --border-radius:     12px;
  --transition:        all 0.2s ease-in-out;
  --heading-color:     #1a2d5a;
  --error-bg:          #fee2e2;
  --error-text:        #ef4444;
  --secondary-btn-bg:  #f3f4f6;
  --secondary-btn-text: #1a2d5a;
  --secondary-btn-hover: #e5e7eb;
  --password-hover:    #1a2d5a;
}

.dark {
  --bg-color:          #1a1f2e;
  --card-bg:           rgba(30, 38, 60, 0.97);
  --card-border:       rgba(255, 255, 255, 0.08);
  --text-main:         #e4e4e7;
  --text-muted:        #9ca3af;
  --shadow:            0 4px 15px rgba(0, 0, 0, 0.3);
  --input-bg:          rgba(20, 27, 48, 0.8);
  --input-border:      rgba(99, 102, 241, 0.25);
  --input-text:        #ffffff;
  --input-focus-bg:    rgba(20, 27, 48, 0.95);
  --input-icon:        #818cf8;
  --input-placeholder: #6b7280;
  --toggle-bg:         #151b30;
  --toggle-border:     #374151;
  --toggle-slider:     #4f6db8;
  --toggle-text:       #9ca3af;
  --toggle-active-text: #ffffff;
  --overlay-color:     rgba(12, 14, 26, 0.85);
  --heading-color:     #e0e7ff;
  --error-bg:          rgba(239, 68, 68, 0.15);
  --error-text:        #f87171;
  --secondary-btn-bg:  #1e1b4b;
  --secondary-btn-text: #a5b4fc;
  --secondary-btn-hover: #2e2a6e;
  --password-hover:    #e4e4e7;
}

*, *::before, *::after { box-sizing: border-box; }

html, body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }

body {
  background: var(--bg-color);
  min-height: 100vh;
  color: var(--text-main);
  overflow-x: hidden;
  margin: 0;
  transition: background 0.25s ease, color 0.25s ease;
}

/* ── Background Layer ── */
.auth-bg-wrapper {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: var(--bg-color);
}

.dark .auth-bg-wrapper {
  background: var(--bg-color);
}

/* ── Full-screen auth shell ── */
.auth-page-shell {
  position: fixed;
  inset: 0;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  padding: 1rem;
}

/* ── Auth outer frame (the rounded rectangle) ── */
.auth-outer-card {
  background: var(--card-bg);
  border-radius: 18px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.13);
  width: 100%;
  max-width: 520px;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  animation: authFadeIn 0.3s ease;
}

/* ── Auth container (legacy, kept for compat) ── */
.app-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  margin: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: authFadeIn 0.3s ease;
}

@keyframes authFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .app-container, .auth-outer-card { animation: none; }
}

/* ── Auth card (inner login form box) ── */
.premium-card {
  background: #f5f7fb;
  padding: 2rem 2rem 1.5rem 2rem;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  width: 100%;
  transition: var(--transition);
}

.dark .premium-card {
  background: rgba(20, 27, 48, 0.6);
  border: 1px solid rgba(255,255,255,0.07);
}

/* ── Brand header ── */
.gcas-title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 900;
  font-size: 2.6rem;
  color: #1a2d5a;
  letter-spacing: -1px;
  margin-bottom: 0;
  line-height: 1;
}

.dark .gcas-title { color: #7b9ed9; }

.subtitle {
  color: var(--text-muted);
  font-size: 0.82rem;
  font-weight: 400;
  letter-spacing: 0.3px;
  margin-bottom: 0;
  font-family: 'Source Sans 3', sans-serif;
}

/* ── Auth page label (top-left corner tag) ── */
.auth-page-label {
  position: absolute;
  top: 1.1rem;
  left: 1.4rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.6;
}

/* ── Dark mode toggle ── */
.auth-theme-toggle {
  position: absolute;
  top: 1.1rem;
  right: 1.4rem;
  background: rgba(0,0,0,0.05);
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: var(--transition);
  z-index: 10;
}

.dark .auth-theme-toggle {
  background: rgba(255,255,255,0.07);
}

.auth-theme-toggle:hover {
  color: var(--primary);
  background: rgba(26, 45, 90, 0.1);
}

.fade-in { animation: authFadeIn 0.3s ease forwards; }

/* ── Login button ── */
.auth-login-btn {
  width: 100%;
  padding: 0.9rem;
  background: #1a2d5a;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.02em;
  transition: background 0.18s;
  margin-top: 0.3rem;
}
.auth-login-btn:hover:not(:disabled) { background: #152348; }
.auth-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;

function App() {
  return (
    <>
      <style>{appStyles}</style>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/student" element={<LoginPage />} />
        <Route path="/login/faculty" element={<LoginPage />} />
        
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
