import React, { useState, useEffect } from 'react';
import { Inbox, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultyRequests, getFacultySchedules, getProfile, updateRequestStatus } from '../../supabase/api';
import { subscribeToRequests, subscribeToSchedules } from '../../supabase/realtime';
import { toast, withMinDelay, prefetch, optimistic } from '../../supabase/ux';

const S = `
.fdc-wrap { display: flex; flex-direction: column; gap: 1.2rem; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

/* Warning banner */
.fdc-banner {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.8rem;
  background: #fffbe6; border: 1.5px solid #ffe58f;
  border-radius: 12px; padding: 0.85rem 1.2rem;
  font-size: 0.87rem; color: #7c5e00; font-weight: 500;
}
.fdc-banner-btn {
  padding: 0.42rem 1rem; border-radius: 8px;
  border: 1.5px solid #d4b800; background: #fff;
  color: #7c5e00; font-weight: 700; font-size: 0.82rem;
  cursor: pointer; font-family: inherit; white-space: nowrap;
  transition: background 0.15s;
}
.fdc-banner-btn:hover { background: #fffbe6; }

/* Welcome card */
.fdc-welcome {
  background: #fff; border: 1px solid #e5e8f0; border-radius: 14px;
  padding: 1.4rem 1.6rem; box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.fdc-welcome h2 { margin: 0 0 0.2rem; font-size: 1.7rem; font-weight: 800; color: #1a2d5a; letter-spacing: -0.3px; }
.fdc-welcome p  { margin: 0; font-size: 0.88rem; color: #6b7280; }

/* Metric cards */
.fdc-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.fdc-metric {
  background: #fff; border: 1px solid #e5e8f0; border-radius: 14px;
  padding: 1.1rem 1.3rem; box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  cursor: pointer; transition: box-shadow 0.15s, transform 0.15s;
  display: flex; flex-direction: column; gap: 0.2rem; align-items: flex-start;
}
.fdc-metric:hover { box-shadow: 0 4px 16px rgba(26,45,90,0.12); transform: translateY(-1px); }
.fdc-metric-label { font-size: 0.78rem; color: #6b7280; font-weight: 500; text-align: left; }
.fdc-metric-num   { font-size: 2rem; font-weight: 800; color: #1a2d5a; line-height: 1; text-align: left; }
.fdc-metric-num.orange { color: #ffab00; }
.fdc-metric-num.blue   { color: #1a2d5a; }
.fdc-metric-num.dark   { color: #1a2d5a; }
.fdc-metric-sub   { font-size: 0.75rem; color: #9ca3af; font-weight: 500; text-align: left; }
.fdc-metric-date  { font-size: 1.25rem; font-weight: 800; color: #1a2d5a; line-height: 1.2; text-align: left; }
.fdc-metric-who   { font-size: 0.75rem; color: #6b7280; margin-top: 0.1rem; text-align: left; }

/* Section card */
.fdc-section {
  background: #fff; border: 1px solid #e5e8f0; border-radius: 14px;
  padding: 1.2rem 1.4rem; box-shadow: 0 1px 6px rgba(0,0,0,0.05);
}
.fdc-section-head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.fdc-section-head h3 { margin: 0; font-size: 1rem; font-weight: 700; color: #1a2d5a; }
.fdc-view-btn {
  padding: 0.35rem 0.9rem; border-radius: 8px;
  border: 1.5px solid #e5e8f0; background: #fff;
  color: #1a2d5a; font-weight: 600; font-size: 0.78rem;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.fdc-view-btn:hover { background: #f0f2f8; }

/* Request row */
.fdc-req-row {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 0.85rem 0; border-top: 1px solid #e5e8f0;
}
.fdc-avatar {
  width: 38px; height: 38px; border-radius: 50%; background: #e5e8f0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; overflow: hidden; color: #6b7280;
}
.fdc-avatar img { width: 100%; height: 100%; object-fit: cover; }
.fdc-req-info { flex: 1; min-width: 0; }
.fdc-req-name { font-size: 0.88rem; font-weight: 700; color: #1a2d5a; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.fdc-req-section { font-size: 0.75rem; color: #6b7280; font-weight: 500; }
.fdc-req-detail { font-size: 0.78rem; color: #374151; margin-top: 0.2rem; }
.fdc-req-note { font-size: 0.76rem; color: #6b7280; font-style: italic; margin-top: 0.15rem; }
.fdc-req-actions { display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0; }
.fdc-decline-btn {
  padding: 0.38rem 0.9rem; border-radius: 8px;
  border: 1.5px solid #e5e8f0; background: #fff;
  color: #374151; font-weight: 600; font-size: 0.78rem;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.fdc-decline-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }
.fdc-approve-btn {
  padding: 0.38rem 0.9rem; border-radius: 8px;
  border: none; background: #1a2d5a;
  color: #fff; font-weight: 700; font-size: 0.78rem;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.fdc-approve-btn:hover { background: #16255a; }

/* Upcoming row */
.fdc-upcoming-row {
  display: flex; align-items: flex-start; gap: 1rem;
  padding: 0.85rem 0; border-top: 1px solid #e5e8f0;
}
.fdc-upcoming-info { flex: 1; min-width: 0; }
.fdc-upcoming-name { font-size: 0.88rem; font-weight: 700; color: #1a2d5a; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.fdc-upcoming-detail { font-size: 0.78rem; color: #374151; margin-top: 0.2rem; }
.fdc-upcoming-note { font-size: 0.76rem; color: #6b7280; font-style: italic; margin-top: 0.15rem; }
.fdc-approved-badge {
  padding: 0.3rem 0.8rem; border-radius: 20px;
  background: #dcfce7; color: #166534;
  font-size: 0.75rem; font-weight: 700; white-space: nowrap;
}
.fdc-cancel-btn {
  padding: 0.38rem 0.9rem; border-radius: 8px;
  border: 1.5px solid #e5e8f0; background: #fff;
  color: #374151; font-weight: 600; font-size: 0.78rem;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.fdc-cancel-btn:hover { background: #fee2e2; border-color: #fca5a5; color: #dc2626; }

.fdc-empty {
  text-align: center; padding: 2rem 1rem; color: #9ca3af;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
}

@media (max-width: 700px) {
  .fdc-metrics { grid-template-columns: 1fr 1fr; }
  .fdc-req-row, .fdc-upcoming-row { flex-wrap: wrap; }
  .fdc-req-actions { width: 100%; justify-content: flex-end; }
}

/* Decline modal */
.fdc-modal-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  animation: fdc-fadeIn 0.18s ease;
}
@keyframes fdc-fadeIn { from { opacity:0 } to { opacity:1 } }
.fdc-modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 480px;
  padding: 1.8rem 1.8rem 1.4rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  animation: fdc-popIn 0.2s cubic-bezier(0.16,1,0.3,1);
  position: relative;
}
@keyframes fdc-popIn { from { transform:scale(0.96) translateY(8px); opacity:0 } to { transform:scale(1) translateY(0); opacity:1 } }
.fdc-modal-close {
  position: absolute; top: 1.1rem; right: 1.1rem;
  background: none; border: none; cursor: pointer;
  color: #9ca3af; font-size: 1.2rem; line-height: 1; padding: 0;
  transition: color 0.15s;
}
.fdc-modal-close:hover { color: #374151; }
.fdc-modal h3 { margin: 0 0 0.2rem; font-size: 1.15rem; font-weight: 800; color: #1a2d5a; }
.fdc-modal-sub { font-size: 0.82rem; color: #6b7280; margin: 0 0 1.3rem; }
.fdc-modal-label { font-size: 0.82rem; font-weight: 600; color: #374151; margin: 0 0 0.45rem; }
.fdc-modal-select {
  width: 100%; padding: 0.65rem 0.9rem;
  border: 1.5px solid #e5e8f0; border-radius: 10px;
  background: #f9fafb; color: #1a2d5a;
  font-family: inherit; font-size: 0.88rem;
  outline: none; cursor: pointer; margin-bottom: 1rem;
  transition: border-color 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231a2d5a' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 0.8rem center;
  padding-right: 2.2rem;
}
.fdc-modal-select:focus { border-color: #1a2d5a; }
.fdc-modal-textarea {
  width: 100%; min-height: 100px; padding: 0.7rem 0.9rem;
  border: 1.5px solid #e5e8f0; border-radius: 10px;
  background: #f9fafb; color: #1a2d5a;
  font-family: inherit; font-size: 0.88rem;
  outline: none; resize: vertical; box-sizing: border-box;
  transition: border-color 0.15s; margin-bottom: 1.4rem;
}
.fdc-modal-textarea:focus { border-color: #1a2d5a; }
.fdc-modal-footer {
  display: flex; gap: 0.75rem; justify-content: flex-end;
}
.fdc-modal-keep {
  padding: 0.65rem 1.4rem; border-radius: 10px;
  border: 1.5px solid #e5e8f0; background: #fff;
  color: #374151; font-weight: 600; font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: border-color 0.15s;
}
.fdc-modal-keep:hover { border-color: #1a2d5a; }
.fdc-modal-confirm {
  padding: 0.65rem 1.4rem; border-radius: 10px;
  border: none; background: #1a2d5a; color: #fff;
  font-weight: 700; font-size: 0.9rem;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.fdc-modal-confirm:hover { background: #152348; }
.fdc-modal-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const fmt = (dateStr) => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const FacultyDashboardContent = ({ onTabChange, onStatusChange }) => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [declineTarget, setDeclineTarget] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declineNote, setDeclineNote] = useState('');
  const [declining, setDeclining] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const profile = await getProfile(user.id);
      if (profile) {
        const name = profile.full_name || 'Faculty';
        setDisplayName(name);
        setFirstName(name.split(' ')[0]);
      }
      const [reqs, scheds] = await withMinDelay(
        Promise.all([getFacultyRequests(user.id), getFacultySchedules(user.id)]),
        300
      );
      setRequests(reqs);
      setSchedules(scheds);
      setLoading(false);
      prefetch(`schedules-${user.id}`, () => Promise.resolve(scheds));
      prefetch(`requests-${user.id}`, () => Promise.resolve(reqs));
    };
    fetchData();
    const unsubReqs   = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    const unsubScheds = subscribeToSchedules(user.id, setSchedules, () => getFacultySchedules(user.id));
    return () => { unsubReqs(); unsubScheds(); };
  }, [user]);

  const handleApprove = async (req) => {
    const notifCtx = {
      studentId: req.avatarSeed,
      facultyName: user?.displayName || user?.user_metadata?.full_name || 'Faculty',
    };
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === req.id ? { ...r, status: 'Approved' } : r),
      () => updateRequestStatus(req.id, 'Approved', null, null, null, notifCtx),
      { success: 'Request approved', error: 'Failed to approve' }
    );
  };

  const openDeclineModal = (req) => {
    setDeclineTarget(req);
    setDeclineReason('');
    setDeclineNote('');
  };

  const closeDeclineModal = () => {
    setDeclineTarget(null);
    setDeclineReason('');
    setDeclineNote('');
  };

  const handleDeclineConfirm = async () => {
    if (!declineTarget || !declineReason) return;
    setDeclining(true);
    const reason = declineNote ? `${declineReason}. ${declineNote}` : declineReason;
    const notifCtx = {
      studentId: declineTarget.avatarSeed,
      facultyName: user?.displayName || user?.user_metadata?.full_name || 'Faculty',
    };
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === declineTarget.id ? { ...r, status: 'Declined' } : r),
      () => updateRequestStatus(declineTarget.id, 'Declined', null, reason, null, notifCtx),
      { success: 'Request declined', error: 'Failed to decline' }
    );
    setDeclining(false);
    closeDeclineModal();
  };

  const handleCancelUpcoming = async (req) => {
    const notifCtx = {
      studentId: req.avatarSeed,
      facultyName: user?.displayName || user?.user_metadata?.full_name || 'Faculty',
    };
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === req.id ? { ...r, status: 'Cancelled' } : r),
      () => updateRequestStatus(req.id, 'Cancelled', 'Cancelled by faculty', null, null, notifCtx),
      { success: 'Appointment cancelled', error: 'Failed to cancel' }
    );
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const hasSchedulesToday = schedules.some(s => {
    if (s.schedule_type === 'one-time') return s.specific_date === todayStr;
    const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()];
    return s.day === dayName;
  });

  const pendingList   = requests.filter(r => r.status === 'Pending').slice(0, 3);
  const upcomingList  = requests.filter(r => r.status === 'Approved' && r.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

  const pendingCount  = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;

  const nextAppt = upcomingList[0];
  const nextDateLabel = nextAppt ? fmt(nextAppt.date) : null;

  return (
    <div className="fdc-wrap">
      <style>{S}</style>

      {/* Warning banner */}
      {status === 'Available' && !hasSchedulesToday && (
        <div className="fdc-banner">
          <span>Students see you as <strong>Available</strong>, but you have no consultation hours today.</span>
          <button className="fdc-banner-btn" onClick={() => onTabChange('Schedule')}>Change Status</button>
        </div>
      )}

      {/* Welcome */}
      <div className="fdc-welcome">
        <h2>Welcome, {firstName || displayName}!</h2>
      </div>

      {/* Metric cards */}
      <div className="fdc-metrics">
        <button className="fdc-metric" onClick={() => onTabChange('Requests', 'Pending')}>
          <span className="fdc-metric-label">Needs action</span>
          <span className={`fdc-metric-num orange`}>{loading ? '—' : pendingCount}</span>
          <span className="fdc-metric-sub">Pending requests</span>
        </button>
        <button className="fdc-metric" onClick={() => onTabChange('Requests', 'Approved')}>
          <span className="fdc-metric-label">Upcoming</span>
          <span className="fdc-metric-num blue">{loading ? '—' : approvedCount}</span>
          <span className="fdc-metric-sub">Approved appointments</span>
        </button>
        <button className="fdc-metric" onClick={() => nextAppt && onTabChange('Calendar')}>
          <span className="fdc-metric-label">Next appointment</span>
          {loading ? (
            <span className="fdc-metric-sub">Loading…</span>
          ) : nextAppt ? (
            <>
              <span className="fdc-metric-date">{nextDateLabel}</span>
              <span className="fdc-metric-who">{nextAppt.time} · {nextAppt.name}</span>
            </>
          ) : (
            <span className="fdc-metric-sub" style={{ marginTop: '0.3rem' }}>No upcoming</span>
          )}
        </button>
      </div>

      {/* Pending requests section */}
      <div className="fdc-section">
        <div className="fdc-section-head">
          <h3>Pending requests</h3>
          <button className="fdc-view-btn" onClick={() => onTabChange('Requests', 'Pending')}>View all</button>
        </div>
        {loading ? (
          <div className="fdc-empty"><span>Loading…</span></div>
        ) : pendingList.length === 0 ? (
          <div className="fdc-empty">
            <Inbox size={32} strokeWidth={1.5} />
            <span style={{ fontWeight: 600, color: '#374151' }}>No pending requests</span>
            <span style={{ fontSize: '0.82rem' }}>You're all caught up!</span>
          </div>
        ) : pendingList.map(req => (
          <div key={req.id} className="fdc-req-row">
            <div className="fdc-avatar">
              {req.avatar
                ? <img src={req.avatar} alt={req.name} />
                : <span style={{ fontSize: '1rem', fontWeight: 700 }}>{req.name?.[0] || '?'}</span>}
            </div>
            <div className="fdc-req-info">
              <div className="fdc-req-name">
                {req.name}
                {req.section && <span className="fdc-req-section">{req.section}</span>}
              </div>
              <div className="fdc-req-detail">
                {req.subject} · {req.day}, {req.date ? fmt(req.date) : ''} {req.time} · {req.filled || 1} of {req.max_slots || 1} slots held
              </div>
              {req.details && <div className="fdc-req-note">"{req.details}"</div>}
            </div>
            <div className="fdc-req-actions">
              <button className="fdc-decline-btn" onClick={() => openDeclineModal(req)}>Decline</button>
              <button className="fdc-approve-btn" onClick={() => handleApprove(req)}>Approve</button>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming appointments section */}
      <div className="fdc-section">
        <div className="fdc-section-head">
          <h3>Upcoming appointments</h3>
          <button className="fdc-view-btn" onClick={() => onTabChange('Calendar')}>Open calendar</button>
        </div>
        {loading ? (
          <div className="fdc-empty"><span>Loading…</span></div>
        ) : upcomingList.length === 0 ? (
          <div className="fdc-empty">
            <Calendar size={32} strokeWidth={1.5} />
            <span style={{ fontWeight: 600, color: '#374151' }}>No upcoming appointments</span>
          </div>
        ) : upcomingList.map(req => (
          <div key={req.id} className="fdc-upcoming-row">
            <div className="fdc-avatar">
              {req.avatar
                ? <img src={req.avatar} alt={req.name} />
                : <span style={{ fontSize: '1rem', fontWeight: 700 }}>{req.name?.[0] || '?'}</span>}
            </div>
            <div className="fdc-upcoming-info">
              <div className="fdc-upcoming-name">
                {req.name}
                {req.section && <span className="fdc-req-section">{req.section}</span>}
              </div>
              <div className="fdc-upcoming-detail">
                {req.subject} · {fmt(req.date)} {req.time} · {req.filled || 1} of {req.max_slots || 1} slots held
              </div>
              {req.details && <div className="fdc-upcoming-note">"{req.details}"</div>}
            </div>
            <div className="fdc-req-actions">
              <span className="fdc-approved-badge">Approved</span>
              <button className="fdc-cancel-btn" onClick={() => handleCancelUpcoming(req)}>Cancel</button>
            </div>
          </div>
        ))}
      </div>

      {/* Decline modal */}
      {declineTarget && (
        <div className="fdc-modal-overlay" onClick={closeDeclineModal}>
          <div className="fdc-modal" onClick={e => e.stopPropagation()}>
            <button className="fdc-modal-close" onClick={closeDeclineModal}>✕</button>
            <h3>Decline request</h3>
            <p className="fdc-modal-sub">
              {declineTarget.name} · {declineTarget.day}{declineTarget.date ? `, ${fmt(declineTarget.date)}` : ''}{declineTarget.time ? ` · ${declineTarget.time}` : ''}
            </p>

            <p className="fdc-modal-label">Reason for declining request</p>
            <select
              className="fdc-modal-select"
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
            >
              <option value="">select reason</option>
              <option value="Schedule conflict">Schedule conflict</option>
              <option value="Already fully booked">Already fully booked</option>
              <option value="Topic not applicable">Topic not applicable</option>
              <option value="Emergency / unavailable">Emergency / unavailable</option>
              <option value="Other">Other</option>
            </select>

            <p className="fdc-modal-label">Optional notes for the student</p>
            <textarea
              className="fdc-modal-textarea"
              placeholder="Add a message to the student (optional)…"
              value={declineNote}
              onChange={e => setDeclineNote(e.target.value)}
            />

            <div className="fdc-modal-footer">
              <button className="fdc-modal-keep" onClick={closeDeclineModal}>Keep it</button>
              <button
                className="fdc-modal-confirm"
                onClick={handleDeclineConfirm}
                disabled={!declineReason || declining}
              >
                {declining ? 'Declining…' : 'Decline request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboardContent;
