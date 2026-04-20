import React, { useState } from 'react';
import { User } from 'lucide-react';
import DashboardContent from './DashboardContent';
import FacultyContent from './FacultyContent';

const dashStyles = `
.dashboard-fixed-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #fdfdfd;
  z-index: 50;
  overflow-y: auto;
  font-family: 'Outfit', 'Inter', sans-serif;
  color: #1a1a1a;
  text-align: left;
}

.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
  position: relative;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  width: 35px;
  height: auto;
}

.brand-text {
  font-weight: 600;
  color: #6b7280;
  font-size: 1rem;
}

.nav-tabs {
  display: flex;
  gap: 0.8rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-tab {
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-tab.active {
  background: #a3a3a3;
  color: #1f2937;
  border-color: #a3a3a3;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  font-weight: 500;
  color: #4b5563;
  font-size: 1rem;
  margin: 0;
}

.user-role {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
}

.main-content {
  max-width: 1050px;
  margin: 0 auto;
  padding: 3rem 1rem;
}

.welcome-section {
  margin-bottom: 2.5rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.3rem;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  color: #9ca3af;
  font-size: 0.85rem;
}

.action-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-card {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: #ea580c;
}

.action-card h3 {
  font-size: 1.2rem;
  color: #4b5563;
  margin: 0 0 0.3rem 0;
  font-weight: 500;
}

.action-card p {
  color: #9ca3af;
  font-size: 0.75rem;
  margin: 0;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  padding: 1rem 1.2rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.metric-card:hover {
  border-color: #ea580c;
}

.metric-card h4 {
  font-size: 1rem;
  color: #4b5563;
  margin: 0 0 0.2rem 0;
  font-weight: 500;
}

.metric-card p {
  color: #9ca3af;
  font-size: 0.65rem;
  margin: 0;
}

.metric-value {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.2rem;
  font-weight: 500;
  color: #fcd34d;
}

.appointments-container {
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  padding: 1.5rem;
}

.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.appointments-header h3 {
  font-size: 0.95rem;
  color: #6b7280;
  font-weight: 600;
  margin: 0;
}

.view-all {
  color: #ea580c;
  font-weight: 600;
  font-size: 0.8rem;
  text-decoration: none;
}

.appointment-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
}

.appointment-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-avatar {
  width: 55px;
  height: 55px;
  background: #f472b6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #f472b6;
}

.app-avatar-icon {
  color: #fff;
}

.app-details h4 {
  margin: 0 0 0.1rem 0;
  font-size: 1.05rem;
  color: #1f2937;
  font-weight: 600;
}

.app-details p {
  margin: 0;
  font-size: 0.7rem;
  color: #6b7280;
}

.status-badge {
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #22c55e;
  color: #22c55e;
  background: transparent;
}

@media (max-width: 900px) {
  .nav-tabs {
    position: static;
    transform: none;
    margin-top: 1rem;
    overflow-x: auto;
    width: 100%;
    padding-bottom: 0.5rem;
  }
  .top-navbar {
    flex-direction: column;
    align-items: flex-start;
  }
  .user-section {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
}
`;

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <>
      <style>{dashStyles}</style>
      <div className="dashboard-fixed-wrapper">
        <nav className="top-navbar">
          <div className="logo-section">
            <img src="/src/pages/logo.png" alt="G-CAS Logo" className="logo-image" />
            <span className="brand-text">Gordon College Appointment System</span>
          </div>
          
          <div className="nav-tabs">
            <div 
              className={`nav-tab ${activeTab === 'Dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('Dashboard')}
            >
              Dashboard
            </div>
            <div 
              className={`nav-tab ${activeTab === 'Faculty' ? 'active' : ''}`}
              onClick={() => setActiveTab('Faculty')}
            >
              Faculty
            </div>
            <div className="nav-tab">Appointments</div>
            <div className="nav-tab">About</div>
          </div>

          <div className="user-section">
            <div className="user-info">
              <h4 className="user-name">June Vic M. Abello</h4>
              <p className="user-role">Student</p>
            </div>
            <div className="user-avatar">
              <User size={24} />
            </div>
          </div>
        </nav>

        <main className="main-content">
          {activeTab === 'Dashboard' && <DashboardContent />}
          {activeTab === 'Faculty' && <FacultyContent />}
        </main>
      </div>
    </>
  );
};

export default StudentDashboard;
