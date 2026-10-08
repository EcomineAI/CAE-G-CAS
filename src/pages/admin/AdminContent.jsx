import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, GraduationCap, CalendarClock, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAllProfiles, getAllRequests, updateUserRole } from '../../supabase/api';

const adminStyles = `
.admin-container {
  animation: fadeIn 0.4s ease;
  max-width: 1100px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.5rem 1.8rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.admin-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}

.admin-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0.2rem 0 0 0;
}

.admin-refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.admin-refresh-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.admin-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.admin-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 700px) {
  .admin-metrics { grid-template-columns: repeat(2, 1fr); }
}

.admin-metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow);
}

.admin-metric-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--accent-light);
  color: var(--accent-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-metric-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}

.admin-metric-label {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.admin-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.4rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.admin-section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--border-color);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.admin-table th {
  text-align: left;
  padding: 0.5rem 0.8rem;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-color);
}

.admin-table td {
  padding: 0.7rem 0.8rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background: var(--bg-primary);
}

.admin-role-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.admin-role-badge.faculty {
  background: rgba(99, 102, 241, 0.12);
  color: #3730a3;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.admin-role-badge.student {
  background: rgba(34, 197, 94, 0.12);
  color: #166534;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.admin-status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 5px;
}

.admin-req-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  border: 1px solid;
}

.admin-empty {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
  padding: 2rem 0;
}

/* Role toggle pill */
.role-toggle {
  display: inline-flex;
  align-items: center;
  background: #e5e7eb;
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
  position: relative;
}
.role-toggle-btn {
  font-size: 0.72rem; font-weight: 700;
  padding: 4px 12px;
  border: none; cursor: pointer;
  border-radius: 999px;
  background: transparent;
  color: #6b7280;
  transition: background 0.18s, color 0.18s;
  font-family: 'Outfit', sans-serif;
  white-space: nowrap;
}
.role-toggle-btn.active-student {
  background: #dcfce7; color: #166534;
}
.role-toggle-btn.active-faculty {
  background: #e0e7ff; color: #3730a3;
}
.role-toggle-btn:disabled { cursor: not-allowed; opacity: 0.5; }

.role-saving {
  font-size: 0.7rem; color: var(--text-muted);
  font-style: italic; margin-left: 4px;
}
`;

const REQ_STYLES = {
  Pending:   { bg: 'rgba(234,179,8,0.12)',  color: '#b45309', border: 'rgba(234,179,8,0.4)' },
  Approved:  { bg: 'rgba(34,197,94,0.12)',  color: '#15803d', border: 'rgba(34,197,94,0.4)' },
  Declined:  { bg: 'rgba(239,68,68,0.12)',  color: '#b91c1c', border: 'rgba(239,68,68,0.4)' },
  Completed: { bg: 'rgba(99,102,241,0.12)', color: '#4338ca', border: 'rgba(99,102,241,0.3)' },
  Cancelled: { bg: 'rgba(107,114,128,0.12)',color: '#374151', border: 'rgba(107,114,128,0.3)' },
};

const STATUS_DOT_COLOR = {
  Available:   '#22c55e',
  Busy:        '#ff1744',
  Unavailable: '#ef4444',
};

const AdminContent = () => {
  const [profiles, setProfiles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([getAllProfiles(), getAllRequests()]);
    setProfiles(p);
    setRequests(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRoleToggle = async (profile, newRole) => {
    if (profile.role === newRole || savingId) return;
    setSavingId(profile.id);
    const ok = await updateUserRole(profile.id, newRole);
    if (ok) {
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: newRole } : p));
    }
    setSavingId(null);
  };

  const faculty  = profiles.filter(p => p.role === 'faculty');
  const students = profiles.filter(p => p.role === 'student');
  const pending   = requests.filter(r => r.status === 'Pending').length;
  const approved  = requests.filter(r => r.status === 'Approved').length;
  const declined  = requests.filter(r => r.status === 'Declined').length;

  const metrics = [
    { label: 'Faculty',           value: faculty.length,   icon: Users,        color: '#6366f1' },
    { label: 'Students',          value: students.length,  icon: GraduationCap,color: '#22c55e' },
    { label: 'Total Requests',    value: requests.length,  icon: CalendarClock, color: '#f97316' },
    { label: 'Pending',           value: pending,          icon: Clock,        color: '#eab308' },
    { label: 'Approved',          value: approved,         icon: CheckCircle,  color: '#22c55e' },
    { label: 'Declined',          value: declined,         icon: XCircle,      color: '#ef4444' },
  ];

  return (
    <div className="admin-container">
      <style>{adminStyles}</style>

      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>System overview — users &amp; consultation requests</p>
        </div>
        <button className="admin-refresh-btn" onClick={load} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Metrics */}
      <div className="admin-metrics">
        {metrics.map(m => (
          <div className="admin-metric-card" key={m.label}>
            <div className="admin-metric-icon" style={{ background: `${m.color}18`, color: m.color }}>
              <m.icon size={20} />
            </div>
            <div>
              <div className="admin-metric-value">{loading ? '…' : m.value}</div>
              <div className="admin-metric-label">{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users table with role toggle */}
      <div className="admin-section">
        <p className="admin-section-title">User Roles ({profiles.length})</p>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : profiles.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => {
                  const dotColor = STATUS_DOT_COLOR[p.status] || '#9ca3af';
                  const isSaving = savingId === p.id;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.full_name || '—'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.department || '—'}</td>
                      <td>
                        <span className="admin-status-dot" style={{ background: dotColor }} />
                        {p.status || '—'}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="role-toggle">
                            <button
                              className={`role-toggle-btn${p.role === 'student' ? ' active-student' : ''}`}
                              onClick={() => handleRoleToggle(p, 'student')}
                              disabled={isSaving}
                            >
                              Student
                            </button>
                            <button
                              className={`role-toggle-btn${p.role === 'faculty' ? ' active-faculty' : ''}`}
                              onClick={() => handleRoleToggle(p, 'faculty')}
                              disabled={isSaving}
                            >
                              Faculty
                            </button>
                          </div>
                          {isSaving && <span className="role-saving">saving…</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Requests table */}
      <div className="admin-section">
        <p className="admin-section-title">Recent Requests (last 100)</p>
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="admin-empty">No requests found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Faculty</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const st = REQ_STYLES[r.status] || REQ_STYLES.Cancelled;
                  return (
                    <tr key={r.id}>
                      <td>{r.studentName}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.facultyName}</td>
                      <td>
                        <span className="admin-req-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {r.date ? new Date(r.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContent;
