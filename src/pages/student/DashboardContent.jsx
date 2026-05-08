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
        <button 
          className="action-card" 
          onClick={() => onTabChange('Faculty')}
          aria-label="Book a new appointment by finding a faculty member"
        >
          <div className="action-icon">
            <CalendarPlus size={24} aria-hidden="true" />
          </div>
          <div className="action-content">
            <h3>Book New Appointment</h3>
            <p>Find a slot and schedule consultation</p>
          </div>
        </button>
        <button 
          className="action-card" 
          onClick={() => onTabChange('Appointments')}
          aria-label="View all your appointments"
        >
          <div className="action-icon">
            <ClipboardList size={24} aria-hidden="true" />
          </div>
          <div className="action-content">
            <h3>My Appointments</h3>
            <p>View all scheduled consultations</p>
          </div>
        </button>
      </div>

      {loading ? <MetricCardSkeleton count={4} /> : (
        <div className="metric-cards" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <button 
            className="metric-card" 
            onClick={() => onTabChange('Appointments', 'Approved')}
            aria-label={`View ${counts.Approved} approved appointments`}
          >
            <h4>Approved</h4>
            <div className="metric-value">{counts.Approved}</div>
            <p>Confirmed appointments</p>
          </button>
          <button 
            className="metric-card" 
            onClick={() => onTabChange('Appointments', 'Pending')}
            aria-label={`View ${counts.Pending} pending appointments`}
          >
            <h4>Pending</h4>
            <div className="metric-value">{counts.Pending}</div>
            <p>Awaiting confirmation</p>
          </button>
          <button 
            className="metric-card" 
            onClick={() => onTabChange('Appointments', 'History')}
            aria-label={`View ${counts.History} past appointments`}
          >
            <h4>History</h4>
            <div className="metric-value">{counts.History}</div>
            <p>Past records</p>
          </button>
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
          <div 
            className="empty-state-card"
            style={{ 
              textAlign: 'center', 
              padding: '2.5rem 1.5rem', 
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <img 
              src={`/brain/0eff5f06-37ce-4438-be91-04d9615e8274/empty_requests_illustration_1778260871821.png`} 
              alt="No appointments" 
              style={{ width: '150px', height: '150px', opacity: 0.8 }} 
            />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '1rem' }}>No Appointments Yet</p>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Your consultation schedule is clear. Ready to book one?</p>
              <button 
                className="view-all" 
                style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.85rem' }}
                onClick={() => onTabChange('Faculty')}
              >
                Find Faculty &rarr;
              </button>
            </div>
          </div>
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
