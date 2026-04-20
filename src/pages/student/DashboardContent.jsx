import React from 'react';
import { User } from 'lucide-react';

const DashboardContent = () => (
  <>
    <div className="welcome-section">
      <h1 className="welcome-title">Welcome, June Vic M. Abello!</h1>
      <p className="welcome-subtitle">What would you like to do today?</p>
    </div>

    <div className="action-cards">
      <div className="action-card">
        <h3>Book New Appointment</h3>
        <p>Find a slot and schedule consultation</p>
      </div>
      <div className="action-card">
        <h3>My Appointment</h3>
        <p>View All scheduled consultations</p>
      </div>
    </div>

    <div className="metric-cards">
      <div className="metric-card">
        <h4>Approved</h4>
        <p>View confirmed appointments</p>
        <div className="metric-value">1</div>
      </div>
      <div className="metric-card">
        <h4>Pending</h4>
        <p>Awaiting faculty confirmation</p>
        <div className="metric-value">2</div>
      </div>
      <div className="metric-card">
        <h4>Completed</h4>
        <p>Finished consultation</p>
        <div className="metric-value">3</div>
      </div>
      <div className="metric-card">
        <h4>Cancelled</h4>
        <p>View cancelled record</p>
        <div className="metric-value">2</div>
      </div>
    </div>

    <div className="appointments-container">
      <div className="appointments-header">
        <h3>Recent &amp; Ongoing Appointments</h3>
        <a href="#" className="view-all">View All &rarr;</a>
      </div>
      
      <div className="appointment-card">
        <div className="appointment-info">
          <div className="app-avatar">
             <User size={30} className="app-avatar-icon" />
          </div>
          <div className="app-details">
            <h4>Mr. Arnie Armada</h4>
            <p>2026-04-06 &bull; 7:00am-7:30am</p>
          </div>
        </div>
        <div className="status-badge">Approved</div>
      </div>
    </div>
  </>
);

export default DashboardContent;
