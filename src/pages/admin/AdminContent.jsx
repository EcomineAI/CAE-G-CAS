import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, GraduationCap, CalendarClock, CheckCircle, XCircle, Clock, X } from 'lucide-react';
import { getAllProfiles, getAllRequestsAdmin } from '../../supabase/api';
import { getInitials } from '../../utils/dateUtils';

const REQ_STATUS_STYLE = {
  Pending:   { bg: '#fef3c7', color: '#7c5200',  border: '#d97706' },
  Approved:  { bg: '#dbeafe', color: '#1e3a8a',  border: '#3b82f6' },
  Declined:  { bg: '#fee2e2', color: '#b91c1c',  border: '#f87171' },
  Completed: { bg: '#dcfce7', color: '#14532d',  border: '#22c55e' },
  Cancelled: { bg: '#f3f4f6', color: '#374151',  border: '#9ca3af' },
};

const STATUS_DOT_COLOR = {
  Available:   '#22c55e',
  Busy:        '#ff1744',
  Unavailable: '#ef4444',
};

const AVATAR_COLORS = ['#5bc8c8','#2e4a87','#7c3aed','#0891b2','#0d9488','#6366f1'];
const nameToColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = String(t).split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';

const adminStyles = `
.admin-container { animation: fadeIn 0.4s ease; max-width: 1200px; }

.admin-header {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 1.5rem 1.8rem; margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}
.admin-header h2 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -0.5px; }
.admin-header p  { color: var(--text-muted); font-size: 0.9rem; margin: 0.2rem 0 0; }

.admin-refresh-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; background: var(--accent-orange); color: white;
  border: none; border-radius: 8px; font-weight: 700; font-size: 0.85rem;
  cursor: pointer; transition: all 0.2s;
}
.admin-refresh-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.admin-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Metrics */
.admin-metrics {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem;
}
@media (max-width: 700px) { .admin-metrics { grid-template-columns: repeat(2, 1fr); } }

.admin-metric-card {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 1.2rem 1.4rem;
  display: flex; align-items: center; gap: 1rem; box-shadow: var(--shadow);
}
.admin-metric-icon {
  width: 42px; height: 42px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.admin-metric-value { font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
.admin-metric-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

/* Section */
.admin-section {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 1.4rem; margin-bottom: 1.5rem; box-shadow: var(--shadow);
}
.admin-section-title {
  font-size: 1rem; font-weight: 700; color: var(--text-primary);
  margin: 0 0 1rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border-color);
}

/* Body layout */
.admin-body { display: flex; gap: 1rem; align-items: flex-start; }
.admin-left { flex: 1 1 0; min-width: 0; }

/* Table */
.admin-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.admin-table th {
  text-align: left; padding: 0.5rem 0.8rem;
  color: var(--text-muted); font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-color);
}
.admin-table td { padding: 0.7rem 0.8rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr.clickable { cursor: pointer; }
.admin-table tr.clickable:hover td { background: var(--bg-primary); }
.admin-table tr.row-selected td { background: rgba(99,102,241,0.07) !important; }

.admin-role-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.admin-role-badge.faculty { background: rgba(99,102,241,0.12); color: #3730a3; border: 1px solid rgba(99,102,241,0.3); }
.admin-role-badge.student { background: rgba(34,197,94,0.12);  color: #166534; border: 1px solid rgba(34,197,94,0.3); }

.admin-status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }

.admin-req-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 20px; padding: 0 6px;
  background: var(--bg-primary); border: 1px solid var(--border-color);
  border-radius: 10px; font-size: 0.68rem; font-weight: 700;
  color: var(--text-muted);
}

.admin-empty { text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2rem 0; }

/* ── Detail panel ── */
.admin-detail-panel {
  width: 320px; flex-shrink: 0;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; overflow: hidden;
  box-shadow: var(--shadow);
  animation: adminDetailIn 0.2s ease;
}
@keyframes adminDetailIn {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}

.admin-detail-head {
  padding: 1.1rem 1rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex; align-items: flex-start; gap: 0.7rem;
}
.admin-detail-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 800; color: #fff; flex-shrink: 0;
}
.admin-detail-info { flex: 1; min-width: 0; }
.admin-detail-name { font-size: 0.9rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.3rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-detail-meta { font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
.admin-detail-close {
  background: none; border: none; color: var(--text-muted); cursor: pointer;
  padding: 0.25rem; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: color 0.12s, background 0.12s;
}
.admin-detail-close:hover { background: var(--bg-primary); color: var(--text-primary); }

/* Stats row */
.admin-detail-stats {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem;
  padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color);
}
.admin-detail-stat {
  background: var(--bg-primary); border-radius: 8px; padding: 0.5rem 0.65rem;
}
.admin-detail-stat-val { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
.admin-detail-stat-lbl { font-size: 0.62rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

/* Request cards */
.admin-detail-history { padding: 0.85rem 1rem; max-height: 460px; overflow-y: auto; scrollbar-width: none; }
.admin-detail-history::-webkit-scrollbar { display: none; }
.admin-detail-hist-title {
  font-size: 0.63rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-muted); margin: 0 0 0.6rem;
}
.admin-req-card {
  background: var(--bg-primary); border: 1px solid var(--border-color);
  border-radius: 9px; padding: 0.65rem 0.75rem; margin-bottom: 0.4rem;
  display: flex; flex-direction: column; gap: 0.25rem;
}
.admin-req-card:last-child { margin-bottom: 0; }
.admin-req-card-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.admin-req-card-name { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-req-status { font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 9px; border: 1px solid; flex-shrink: 0; white-space: nowrap; }
.admin-req-card-meta { font-size: 0.68rem; color: var(--text-muted); }
.admin-req-card-subject { font-size: 0.68rem; color: var(--text-secondary); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-detail-empty { text-align: center; padding: 1.5rem 0; color: var(--text-muted); font-size: 0.8rem; }

@media (max-width: 900px) {
  .admin-body { flex-direction: column; }
  .admin-detail-panel { width: 100%; }
}
`;

const AdminContent = () => {
  const [profiles, setProfiles]     = useState([]);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = async () => {
    setLoading(true);
    const [p, r] = await Promise.all([getAllProfiles(), getAllRequestsAdmin()]);
    setProfiles(p);
    setRequests(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const faculty  = profiles.filter(p => p.role === 'faculty');
  const students = profiles.filter(p => p.role === 'student');
  const pending   = requests.filter(r => r.status === 'Pending').length;
  const approved  = requests.filter(r => r.status === 'Approved').length;
  const declined  = requests.filter(r => r.status === 'Declined').length;
  const completed = requests.filter(r => r.status === 'Completed').length;

  // Build name map from profiles so request history can show names
  const profileNameMap = profiles.reduce((acc, p) => { acc[p.id] = p.full_name; return acc; }, {});

  const metrics = [
    { label: 'Faculty',        value: faculty.length,   icon: Users,         color: '#6366f1' },
    { label: 'Students',       value: students.length,  icon: GraduationCap, color: '#22c55e' },
    { label: 'Total Requests', value: requests.length,  icon: CalendarClock, color: '#f97316' },
    { label: 'Pending',        value: pending,          icon: Clock,         color: '#eab308' },
    { label: 'Approved',       value: approved,         icon: CheckCircle,   color: '#3b82f6' },
    { label: 'Declined',       value: declined,         icon: XCircle,       color: '#ef4444' },
  ];

  // Requests for the selected user
  const userRequests = selectedUser
    ? requests.filter(r =>
        selectedUser.role === 'faculty'
          ? r.facultyId === selectedUser.id
          : r.studentId === selectedUser.id
      )
    : [];

  const userStats = {
    total:     userRequests.length,
    pending:   userRequests.filter(r => r.status === 'Pending').length,
    approved:  userRequests.filter(r => r.status === 'Approved').length,
    declined:  userRequests.filter(r => r.status === 'Declined').length,
  };

  const getUserReqCount = (userId, role) =>
    role === 'faculty'
      ? requests.filter(r => r.facultyId === userId).length
      : requests.filter(r => r.studentId === userId).length;

  const handleRowClick = (p) => {
    setSelectedUser(prev => prev?.id === p.id ? null : p);
  };

  return (
    <div className="admin-container">
      <style>{adminStyles}</style>

      {/* Header */}
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

      {/* Users table + detail panel */}
      <div className="admin-section">
        <p className="admin-section-title">
          User Roles ({profiles.length})
          {selectedUser && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>— click a row to view history</span>}
          {!selectedUser && <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>— click a row to view history</span>}
        </p>

        <div className="admin-body">
          {/* Left: user table */}
          <div className="admin-left">
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
                      <th style={{ textAlign: 'center' }}>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(p => {
                      const dotColor = STATUS_DOT_COLOR[p.status] || '#9ca3af';
                      const isSelected = selectedUser?.id === p.id;
                      const reqCount = getUserReqCount(p.id, p.role);
                      return (
                        <tr
                          key={p.id}
                          className={`clickable${isSelected ? ' row-selected' : ''}`}
                          onClick={() => handleRowClick(p)}
                        >
                          <td style={{ fontWeight: 600 }}>{p.full_name || '—'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{p.department || '—'}</td>
                          <td>
                            <span className="admin-status-dot" style={{ background: dotColor }} />
                            {p.status || '—'}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            {p.created_at ? fmtDate(p.created_at) : '—'}
                          </td>
                          <td>
                            <span className={`admin-role-badge ${p.role || 'student'}`}>
                              {p.role === 'faculty' ? 'Faculty' : 'Student'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="admin-req-count">{reqCount}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: detail panel */}
          {selectedUser && (
            <div className="admin-detail-panel">
              {/* Header */}
              <div className="admin-detail-head">
                <div
                  className="admin-detail-avatar"
                  style={{ background: nameToColor(selectedUser.full_name || '') }}
                >
                  {getInitials(selectedUser.full_name)}
                </div>
                <div className="admin-detail-info">
                  <p className="admin-detail-name">{selectedUser.full_name || '—'}</p>
                  <div className="admin-detail-meta">
                    <span className={`admin-role-badge ${selectedUser.role || 'student'}`}>
                      {selectedUser.role === 'faculty' ? 'Faculty' : 'Student'}
                    </span>
                    {selectedUser.department && <span>{selectedUser.department}</span>}
                    {selectedUser.status && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT_COLOR[selectedUser.status] || '#9ca3af', display: 'inline-block' }} />
                        {selectedUser.status}
                      </span>
                    )}
                  </div>
                </div>
                <button className="admin-detail-close" onClick={() => setSelectedUser(null)}>
                  <X size={15} />
                </button>
              </div>

              {/* Stats */}
              <div className="admin-detail-stats">
                {[
                  { val: userStats.total,    lbl: 'Total',    color: 'var(--text-primary)' },
                  { val: userStats.pending,  lbl: 'Pending',  color: '#d97706' },
                  { val: userStats.approved, lbl: 'Approved', color: '#2563eb' },
                  { val: userStats.declined, lbl: 'Declined', color: '#dc2626' },
                ].map(s => (
                  <div className="admin-detail-stat" key={s.lbl}>
                    <div className="admin-detail-stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="admin-detail-stat-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>

              {/* Request history */}
              <div className="admin-detail-history">
                <p className="admin-detail-hist-title">
                  {selectedUser.role === 'faculty' ? 'Consultation Requests Received' : 'Consultation Requests Made'}
                </p>
                {userRequests.length === 0 ? (
                  <div className="admin-detail-empty">No requests found.</div>
                ) : (
                  userRequests.map(r => {
                    const st = REQ_STATUS_STYLE[r.status] || REQ_STATUS_STYLE.Cancelled;
                    const otherParty = selectedUser.role === 'faculty'
                      ? (profileNameMap[r.studentId] || r.studentName || '—')
                      : (profileNameMap[r.facultyId] || r.facultyName || '—');
                    const timeLabel = r.startTime ? fmt12(r.startTime) + (r.endTime ? ` – ${fmt12(r.endTime)}` : '') : null;
                    return (
                      <div key={r.id} className="admin-req-card">
                        <div className="admin-req-card-top">
                          <span className="admin-req-card-name">{otherParty}</span>
                          <span className="admin-req-status" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                            {r.status}
                          </span>
                        </div>
                        <div className="admin-req-card-meta">
                          {fmtDate(r.date)}{timeLabel ? ` · ${timeLabel}` : ''}
                        </div>
                        {r.subject && <div className="admin-req-card-subject">{r.subject}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
