import React, { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultyRequests, getFacultySchedules, getProfile, updateFacultyStatus } from '../../supabase/api';
import { subscribeToRequests, subscribeToSchedules } from '../../supabase/realtime';
import { MetricCardSkeleton, RequestCardSkeleton, ScheduleCardSkeleton, toast, withMinDelay, debouncedSave, prefetch } from '../../supabase/ux';

const contentStyles = `
.faculty-dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.4s ease;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.welcome-box h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-secondary);
  letter-spacing: -0.5px;
}

.welcome-box p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin: 0.2rem 0 0 0;
}

.status-selector {
  position: relative;
}

.status-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  width: 150px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 0, 0, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

.status-dot.available { background: #22c55e; animation-name: pulse-green; }
.status-dot.busy { background: #eab308; animation-name: pulse-yellow; }
.status-dot.unavailable { background: #ef4444; animation-name: pulse-red; }

@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes pulse-yellow {
  0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(234, 179, 8, 0); }
  100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
}

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.status-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-secondary);
  flex: 1;
}

.status-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.4rem;
  width: 150px;
  box-shadow: var(--shadow);
  z-index: 100;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.status-option:hover {
  background: var(--bg-primary);
}

.metric-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.2rem;
  margin-top: 1rem;
}

.faculty-metric-card {
  flex: 0 0 180px; /* Fixed width to keep size consistent */
  text-align: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.faculty-metric-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: transparent;
  transition: background-color 0.2s;
}

.faculty-metric-card:hover {
  border-color: var(--accent-orange);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.faculty-metric-card:hover::before {
  background-color: var(--accent-orange);
}

.metric-title {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  font-weight: 500;
}

.metric-num {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-orange);
  margin: 0.2rem 0;
  line-height: 1;
}

.metric-sub {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0;
}

.section-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.view-all-link {
  color: #ea580c;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  cursor: pointer;
}

.pending-request-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0;
  background: transparent;
  border: none;
}

.student-avatar {
  width: 60px;
  height: 60px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.request-info {
  flex: 1;
  text-align: left;
}

.student-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.request-details-text {
  margin-bottom: 0.1rem;
  font-size: 0.8rem;
}

.detail-label {
  color: #ea580c;
  font-weight: 500;
}

.detail-value {
  color: var(--text-secondary);
}

.request-time-info {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.3rem;
}

.schedules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
}

.schedule-day-card {
  padding: 1.2rem;
  border: 1px solid var(--accent-orange);
  border-radius: 12px;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.day-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.time-row-bold {
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-primary);
}

.room-row {
  font-size: 0.75rem;
  color: #6b7280;
}

.slots-left {
  margin-top: 1rem;
  font-size: 0.7rem;
  color: #9ca3af;
}

@media (max-width: 900px) {
  .metric-row { gap: 1rem; }
  .schedules-grid { grid-template-columns: 1fr; }
  .request-details { grid-template-columns: 1fr; gap: 0.8rem; }
  .pending-request-card { flex-direction: column; align-items: flex-start; }
}
`;

// Debounced status saver — avoids spamming server on rapid toggles
const saveStatusDebounced = debouncedSave((userId, newStatus) => updateFacultyStatus(userId, newStatus), 500);

const FacultyDashboardContent = ({ onTabChange, onStatusChange }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [status, setStatus] = useState('Available');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Load profile for display name and persisted status
      const profile = await getProfile(user.id);
      if (profile) {
        setDisplayName(profile.full_name || user.displayName || 'Faculty');
        setStatus(profile.status || 'Available');
        if (onStatusChange) onStatusChange(profile.status || 'Available');
      } else {
        setDisplayName(user.displayName || 'Faculty');
      }

      const [reqs, scheds] = await withMinDelay(
        Promise.all([
          getFacultyRequests(user.id),
          getFacultySchedules(user.id)
        ]),
        300
      );
      setRequests(reqs);
      setSchedules(scheds);
      setLoading(false);

      // Prefetch for other tabs
      prefetch(`schedules-${user.id}`, () => Promise.resolve(scheds));
      prefetch(`requests-${user.id}`, () => Promise.resolve(reqs));
    };
    fetchData();

    // Real-time subscriptions
    const unsubReqs = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    const unsubScheds = subscribeToSchedules(user.id, setSchedules, () => getFacultySchedules(user.id));
    return () => { unsubReqs(); unsubScheds(); };
  }, [user]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setIsStatusOpen(false);
    if (onStatusChange) onStatusChange(newStatus);
    saveStatusDebounced(user.id, newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  const totalRequests = requests.filter(r => ['Pending', 'Approved'].includes(r.status)).length;
  const approvedRequests = requests.filter(r => r.status === 'Approved').length;
  const historyRequests = requests.filter(r => ['Completed', 'Cancelled', 'Declined'].includes(r.status)).length;
  const pendingRequestsList = requests.filter(r => r.status === 'Pending');
  const pendingRequests = pendingRequestsList.length;
  const activeSchedules = schedules.length;

  const statusOptions = [
    { label: 'Available', color: 'available' },
    { label: 'Busy', color: 'busy' },
    { label: 'Unavailable', color: 'unavailable' }
  ];

  return (
    <div className="faculty-dashboard-content">
      <style>{contentStyles}</style>

      <div className="header-row">
        <div className="welcome-box">
          <h2>Welcome, {displayName}!</h2>
          <p>What would you like to do today?</p>
        </div>

        <div className="status-selector">
          <div className="status-pill" onClick={() => setIsStatusOpen(!isStatusOpen)}>
            <div className={`status-dot ${status.toLowerCase()}`}></div>
            <span className="status-text">{status}</span>
            <ChevronDown size={18} />
          </div>
          
          {isStatusOpen && (
            <div className="status-dropdown">
              {statusOptions.map(opt => (
                <div 
                  key={opt.label} 
                  className="status-option"
                  onClick={() => handleStatusChange(opt.label)}
                >
                  <div className={`status-dot ${opt.color}`}></div>
                  <span className="status-text">{opt.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? <MetricCardSkeleton count={4} /> : (
        <div className="metric-row">
          <div className="faculty-metric-card" onClick={() => onTabChange('Requests', 'All')}>
            <p className="metric-title">Total Request</p>
            <div className="metric-num">{totalRequests}</div>
            <p className="metric-sub">All received</p>
          </div>
          
          <div className="faculty-metric-card" onClick={() => onTabChange('Requests', 'Approved')}>
            <p className="metric-title">Approved</p>
            <div className="metric-num">{approvedRequests}</div>
            <p className="metric-sub">Confirmed Appointments</p>
          </div>

          <div className="faculty-metric-card" onClick={() => onTabChange('Requests', 'Pending')}>
            <p className="metric-title">Pending</p>
            <div className="metric-num">{pendingRequests}</div>
            <p className="metric-sub">Awaiting actions</p>
          </div>

          <div className="faculty-metric-card" onClick={() => onTabChange('Requests', 'History')}>
            <p className="metric-title">History</p>
            <div className="metric-num">{historyRequests}</div>
            <p className="metric-sub">Past records</p>
          </div>

          <div className="faculty-metric-card" onClick={() => onTabChange('Schedule')}>
            <p className="metric-title">Schedule</p>
            <div className="metric-num">{activeSchedules}</div>
            <p className="metric-sub">Active slots</p>
          </div>
        </div>
      )}

      <div className="section-box">
        <div className="section-header">
          <h3>Pending Request</h3>
          <span className="view-all-link" onClick={() => onTabChange('Requests', 'All')}>View All <ArrowRight size={14} /></span>
        </div>

        {pendingRequestsList.length > 0 ? (
          pendingRequestsList.slice(0, 1).map(req => (
            <div className="pending-request-card" key={req.id}>
              <div className="student-avatar">
                <img src={req.avatar} alt="Student" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              </div>
              <div className="request-info">
                <div className="student-name">{req.name}</div>
                <div className="request-details-text">
                  <span className="detail-label">Subject: </span>
                  <span className="detail-value">{req.subject}</span>
                </div>
                <div className="request-details-text">
                  <span className="detail-label">Details: </span>
                  <span className="detail-value">{req.details || 'N/A'}</span>
                </div>
                <div className="request-time-info">
                  {req.day} • {req.time}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            No pending requests.
          </div>
        )}
      </div>

      <div className="section-box">
        <div className="section-header">
          <h3>My Consultation Schedules</h3>
          <span className="view-all-link" onClick={() => onTabChange('Schedule')}>Manage <ArrowRight size={14} /></span>
        </div>

        <div className="schedules-grid">
          {schedules.length > 0 ? schedules.slice(0, 2).map(sched => (
            <div className="schedule-day-card" key={sched.id}>
              <div className="day-title">{sched.day}</div>
              <div className="time-row-bold">{String(sched.start_time).slice(0, 5)} - {String(sched.end_time).slice(0, 5)}</div>
              <div className="room-row">Room {sched.room}</div>
              <div className="slots-left">{sched.max_slots - sched.filled || 0} slots left</div>
            </div>
          )) : (
            <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>No schedules found.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default FacultyDashboardContent;
