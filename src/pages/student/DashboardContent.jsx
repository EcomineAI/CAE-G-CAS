import React, { useState, useEffect } from 'react';
import { User, CalendarPlus, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRequests } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { MetricCardSkeleton, DashboardAppointmentSkeleton, withMinDelay } from '../../supabase/ux';

const DashboardContent = ({ onTabChange, realName }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatWelcomeName = (name) => {
    if (!name) return 'User';
    if (name.includes(',')) {
      const parts = name.split(', ');
      const last = parts[0];
      const rest = parts[1] || '';
      return `${rest} ${last}`.trim();
    }
    return name;
  };

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const data = await withMinDelay(getStudentRequests(user.id), 300);
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();

    // Real-time: auto-update when faculty approves/declines
    const unsub = subscribeToRequests(user.id, 'student', setRequests, () => getStudentRequests(user.id));
    return () => unsub();
  }, [user]);

  const counts = {
    Approved: requests.filter(r => r.status === 'Approved').length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    History: requests.filter(r => ['Completed', 'Cancelled', 'Declined'].includes(r.status)).length,
  };

  const recentAppointments = requests.slice(0, 3);

  return (
    <>
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome, {formatWelcomeName(realName)}!</h1>
        <p className="welcome-subtitle">What would you like to do today?</p>
      </div>

      <div className="action-cards">
        <div className="action-card" onClick={() => onTabChange('Faculty')}>
          <div className="action-icon">
            <CalendarPlus size={24} />
          </div>
          <div className="action-content">
            <h3>Book New Appointment</h3>
            <p>Find a slot and schedule consultation</p>
          </div>
        </div>
        <div className="action-card" onClick={() => onTabChange('Appointments')}>
          <div className="action-icon">
            <ClipboardList size={24} />
          </div>
          <div className="action-content">
            <h3>My Appointment</h3>
            <p>View all scheduled consultations</p>
          </div>
        </div>
      </div>

      {loading ? <MetricCardSkeleton count={4} /> : (
        <div className="metric-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="metric-card" onClick={() => onTabChange('Appointments', 'Approved')}>
            <h4>Approved</h4>
            <div className="metric-value">{counts.Approved}</div>
            <p>Confirmed appointments</p>
          </div>
          <div className="metric-card" onClick={() => onTabChange('Appointments', 'Pending')}>
            <h4>Pending</h4>
            <div className="metric-value">{counts.Pending}</div>
            <p>Awaiting confirmation</p>
          </div>
          <div className="metric-card" onClick={() => onTabChange('Appointments', 'History')}>
            <h4>History</h4>
            <div className="metric-value">{counts.History}</div>
            <p>Past records</p>
          </div>
        </div>
      )}

      <div className="appointments-container">
        <div className="appointments-header">
          <h3>Recent &amp; Ongoing Appointments</h3>
          <button onClick={() => onTabChange('Appointments')} className="view-all" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            View All &rarr;
          </button>
        </div>
        
        {loading ? (
          <DashboardAppointmentSkeleton count={3} />
        ) : recentAppointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>No recent appointments found.</p>
        ) : recentAppointments.map((app) => (
          <div className="appointment-card" key={app.id}>
            <div className="appointment-info">
              <div className={`app-avatar ${app.status.toLowerCase()}`}>
                <img src={app.avatar} alt={app.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              </div>
              <div className="app-details">
                <h4>{app.name}</h4>
                <p>{app.date} &bull; {app.time}</p>
              </div>
            </div>
            <div className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DashboardContent;
