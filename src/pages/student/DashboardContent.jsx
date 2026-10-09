import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, History, ArrowRight, MapPin } from 'lucide-react';
import { getInitials } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRequests, getAllFaculty } from '../../supabase/api';
import { subscribeToRequests, subscribeToFacultyStatus } from '../../supabase/realtime';
import { withMinDelay } from '../../supabase/ux';
import { formatTimeRange } from '../../utils/dateUtils';

const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAYS_FULL  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatWelcomeName(name) {
  if (!name) return 'User';
  if (name.includes(',')) {
    const [last, rest = ''] = name.split(', ');
    return `${rest} ${last}`.trim();
  }
  return name.split(' ')[0] || name;
}

function todayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Rolling 5-day window starting from today
function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      label: DAYS_SHORT[d.getDay()],
      num: d.getDate(),
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      isToday: i === 0,
    };
  });
}

function getStatusColor(status) {
  if (status === 'Approved')  return { bg: '#00c853', text: '#fff' };
  if (status === 'Pending')   return { bg: '#ffab00', text: '#fff' };
  if (status === 'Declined' || status === 'Cancelled') return { bg: '#ff1744', text: '#fff' };
  return { bg: '#78909c', text: '#fff' };
}

const DashboardContent = ({ onTabChange, realName }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [reqs, faculty] = await Promise.all([
        withMinDelay(getStudentRequests(user.id), 300),
        getAllFaculty(),
      ]);
      setRequests(reqs);
      setFacultyList(faculty);
      setLoading(false);
    };
    fetch();

    const unsub = subscribeToRequests(user.id, 'student', setRequests, () => getStudentRequests(user.id));
    const unsubFaculty = subscribeToFacultyStatus((payload) => {
      setFacultyList(prev => prev.map(f =>
        f.id === payload.new.id ? { ...f, status: payload.new.status } : f
      ));
    });
    return () => { unsub(); unsubFaculty(); };
  }, [user]);

  const counts = {
    Approved: requests.filter(r => r.status === 'Approved').length,
    Pending:  requests.filter(r => r.status === 'Pending').length,
    History:  requests.filter(r => ['Completed', 'Cancelled', 'Declined'].includes(r.status)).length,
  };

  const todayStr = todayDateStr();
  const upcomingApproved = requests
    .filter(r => r.status === 'Approved' && r.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''));
  const nextAppt = upcomingApproved[0] || null;

  const weekDays = getWeekDays();
  const apptsByDay = (dateStr) =>
    requests.filter(r => r.date === dateStr && ['Approved', 'Pending'].includes(r.status));

  const today = new Date();

  return (
    <>
      <style>{`
        .dc-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        /* ── Greeting ── */
        .dc-greeting-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .dc-greeting-name {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 0.08rem 0;
          letter-spacing: -0.3px;
        }
        .dc-greeting-date {
          font-size: 0.75rem;
          color: #2e4a87;
          font-weight: 600;
          margin: 0;
        }
        .sd-root.dark .dc-greeting-date { color: #7ba4e0; }

        /* ── Stat cards ── */
        .dc-stat-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem;
        }
        .dc-stat-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 10px;
          padding: 0.75rem 0.9rem 0.65rem 0.9rem;
          box-shadow: var(--card-shadow);
          cursor: pointer;
          transition: box-shadow 0.18s, transform 0.14s;
        }
        .dc-stat-card:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.09); transform: translateY(-1px); }
        .dc-stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.3rem;
        }
        .dc-stat-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin: 0; }
        .dc-stat-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: #e8eef8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .sd-root.dark .dc-stat-icon { background: rgba(91,128,196,0.2); }
        .dc-stat-number {
          font-size: 1.6rem; font-weight: 800;
          color: var(--text-primary); line-height: 1.1; margin: 0 0 0.12rem 0;
        }
        .dc-stat-sub { font-size: 0.67rem; color: var(--text-muted); margin: 0; }

        /* ── Next consultation card (filled) ── */
        .dc-next-card {
          background: #1a2d5a;
          border-radius: 14px;
          padding: 1rem 1.2rem 1rem 1.2rem;
          position: relative;
          min-height: 110px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .dc-next-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .dc-next-left { flex: 1; min-width: 0; }
        .dc-next-label {
          font-size: 0.6rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.5);
          margin: 0 0 0.35rem 0;
        }
        .dc-next-subject {
          font-size: 1.25rem; font-weight: 800; color: #fff;
          margin: 0 0 0.12rem 0;
          line-height: 1.2;
        }
        .dc-next-faculty {
          font-size: 0.75rem; color: rgba(255,255,255,0.6);
          margin: 0;
        }
        .dc-next-bottom {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 0.7rem;
        }
        .dc-next-meta {
          display: flex; align-items: center; gap: 1rem;
        }
        .dc-next-meta-item {
          display: flex; align-items: center; gap: 0.28rem;
          font-size: 0.72rem; color: rgba(255,255,255,0.75);
        }
        .dc-next-badge {
          background: #22c55e; color: #fff;
          font-size: 0.54rem; font-weight: 800; letter-spacing: 0.1em;
          padding: 0.18rem 0.55rem; border-radius: 20px; text-transform: uppercase;
          white-space: nowrap;
        }
        .dc-next-btn {
          display: flex; align-items: center; gap: 0.28rem;
          background: rgba(255,255,255,0.13); color: #fff;
          border: none; border-radius: 7px;
          font-size: 0.7rem; font-weight: 700; cursor: pointer;
          padding: 0.3rem 0.8rem; font-family: 'Outfit', sans-serif;
          transition: background 0.15s; white-space: nowrap;
        }
        .dc-next-btn:hover { background: rgba(255,255,255,0.22); }

        /* ── Empty next ── */
        .dc-next-empty {
          background: #1a2d5a;
          border-radius: 14px;
          padding: 1rem 1.2rem;
          min-height: 110px;
          display: flex; align-items: center; justify-content: center; gap: 0.3rem;
          color: rgba(255,255,255,0.55);
          font-size: 0.83rem;
        }

        /* ── Quick Schedule ── */
        .dc-sched-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 0.9rem 1rem 1rem 1rem;
          box-shadow: var(--card-shadow);
        }
        .dc-sched-hd {
          display: flex; justify-content: space-between; align-items: flex-end;
          margin-bottom: 0.7rem;
        }
        .dc-sched-title {
          font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-muted); margin: 0 0 0.08rem 0;
        }
        .dc-sched-week {
          font-size: 0.85rem; font-weight: 800; color: var(--text-primary); margin: 0;
        }
        .dc-fullcal-btn {
          font-size: 0.73rem; font-weight: 700; color: #2e4a87;
          background: none; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; padding: 0;
          text-decoration: underline; text-underline-offset: 2px;
        }
        .sd-root.dark .dc-fullcal-btn { color: #7ba4e0; }

        .dc-week-grid {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;
        }
        .dc-day-col {
          display: flex; flex-direction: column;
          border: 1.5px solid #94a3b8 !important;
          border-radius: 8px;
          overflow: hidden;
          min-height: 90px;
          cursor: pointer;
          background: var(--card-bg);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }
        .dc-day-col:hover {
          transform: translateY(-3px);
          border-color: #3d5fa8 !important;
          background: #eef2fb;
          box-shadow: 0 8px 22px rgba(46,74,135,0.25);
        }
        .dc-day-col:hover .dc-day-hd { background: #dfe6f5; }
        .dc-day-col:hover .dc-day-body { background: transparent; }
        .dc-day-col:hover .dc-day-lbl { color: #1a2d5a; font-weight: 800; }
        .dc-day-col:hover .dc-day-num { color: #1a2d5a; font-weight: 900; }
        .dc-day-col:active { transform: translateY(-1px); }
        .sd-root.dark .dc-day-col { border-color: rgba(123,164,224,0.5); }
        .sd-root.dark .dc-day-col:hover {
          background: rgba(61,90,158,0.18);
          border-color: #7ba4e0;
          box-shadow: 0 6px 18px rgba(0,0,0,0.4);
        }
        .sd-root.dark .dc-day-col:hover .dc-day-hd { background: rgba(61,90,158,0.25); }
        .dc-day-hd {
          text-align: left;
          padding: 0.45rem 0.6rem 0.35rem 0.6rem;
          border-bottom: 1.5px solid #94a3b8;
          background: var(--card-bg);
          transition: background 0.18s ease, border-color 0.18s ease;
        }
        .dc-day-col:hover .dc-day-hd { border-bottom-color: #3d5fa8; }
        .dc-day-lbl { font-size: 0.6rem; font-weight: 700; color: #64748b; display: block; letter-spacing: 0.04em; }
        .dc-day-num {
          font-size: 0.95rem; font-weight: 800; color: #475569;
          display: inline-block; margin-top: 1px;
        }
        .sd-root.dark .dc-day-hd { border-bottom-color: rgba(148,163,184,0.4); }
        .sd-root.dark .dc-day-lbl { color: #94a3b8; }
        .sd-root.dark .dc-day-num { color: #cbd5e1; }
        .dc-day-num.today {
          background: #1a2d5a; color: #fff;
          border-radius: 5px; padding: 1px 6px;
        }
        .sd-root.dark .dc-day-num.today { background: #3d5a9e; }
        .dc-day-body {
          flex: 1; padding: 0.35rem 0.4rem;
          display: flex; flex-direction: column; gap: 0.25rem;
          background: var(--card-bg);
        }
        .dc-day-appt {
          border-radius: 5px; padding: 0.28rem 0.45rem;
          font-size: 0.6rem; font-weight: 700;
          line-height: 1.4;
        }

        /* ── Live Availability ── */
        .dc-avail-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 0.9rem 1rem 1rem 1rem;
          box-shadow: var(--card-shadow);
        }
        .dc-avail-hd { margin-bottom: 0.8rem; }
        .dc-avail-label {
          font-size: 0.63rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-muted);
          margin: 0 0 0.2rem 0;
        }
        .dc-avail-subtitle {
          font-size: 0.92rem; font-weight: 700;
          color: var(--text-primary); margin: 0;
        }
        .dc-avail-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem;
        }
        .dc-avail-fc {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          padding: 0.75rem 0.9rem;
          display: flex; align-items: center; gap: 0.75rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.14s;
        }
        .dc-avail-fc:hover {
          border-color: #1a2d5a;
          box-shadow: 0 0 0 3px rgba(26,45,90,0.10), 0 4px 14px rgba(26,45,90,0.12);
          transform: translateY(-1px);
        }
        .sd-root.dark .dc-avail-fc:hover {
          border-color: #5b8ed6;
          box-shadow: 0 0 0 3px rgba(91,142,214,0.15), 0 4px 14px rgba(91,142,214,0.15);
        }
        .dc-avail-avatar {
          width: 40px; height: 40px; border-radius: 50%;
          background: #3d5fa8;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          color: #fff; font-weight: 700; font-size: 1rem;
          overflow: hidden;
        }
        .dc-avail-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
        .dc-avail-info { flex: 1; min-width: 0; }
        .dc-avail-name {
          font-size: 0.82rem; font-weight: 700;
          color: var(--text-primary); margin: 0 0 0.18rem 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .dc-avail-status-row {
          display: flex; align-items: center; gap: 0.28rem;
          font-size: 0.7rem; font-weight: 600;
        }
        .dc-avail-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .dc-avail-book-btn {
          padding: 0.3rem 0.85rem;
          border: 1.5px solid #c5cde0;
          border-radius: 6px; background: #fff;
          color: #1a2d5a; font-weight: 700; font-size: 0.75rem;
          font-family: inherit; flex-shrink: 0;
          white-space: nowrap; pointer-events: none;
          transition: border-color 0.18s, background 0.18s;
        }
        .dc-avail-fc:hover .dc-avail-book-btn {
          border-color: #1a2d5a; background: #eef2ff;
        }
        .sd-root.dark .dc-avail-book-btn {
          background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); color: #c7d9f5;
        }
        .dc-avail-empty { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

        /* skeleton */
        .dc-skel {
          background: linear-gradient(90deg, var(--card-border) 25%, var(--card-bg) 50%, var(--card-border) 75%);
          background-size: 200% 100%;
          animation: dcShim 1.4s infinite;
          border-radius: 8px;
        }
        @keyframes dcShim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="dc-wrap">

        {/* ── Stat cards ── */}
        <div className="dc-stat-row">
          <div className="dc-stat-card" onClick={() => onTabChange('Appointments', 'Approved')}>
            <div className="dc-stat-header">
              <p className="dc-stat-label">Approved</p>
              <div className="dc-stat-icon"><CheckCircle2 size={17} color="#1a2d5a" /></div>
            </div>
            <p className="dc-stat-number">{loading ? '—' : counts.Approved}</p>
            <p className="dc-stat-sub">Confirmed Appointments</p>
          </div>
          <div className="dc-stat-card" onClick={() => onTabChange('Appointments', 'Pending')}>
            <div className="dc-stat-header">
              <p className="dc-stat-label">Pending</p>
              <div className="dc-stat-icon"><Clock size={17} color="#1a2d5a" /></div>
            </div>
            <p className="dc-stat-number">{loading ? '—' : counts.Pending}</p>
            <p className="dc-stat-sub">Awaiting Confirmation</p>
          </div>
          <div className="dc-stat-card" onClick={() => onTabChange('Appointments', 'History')}>
            <div className="dc-stat-header">
              <p className="dc-stat-label">History</p>
              <div className="dc-stat-icon"><History size={17} color="#1a2d5a" /></div>
            </div>
            <p className="dc-stat-number">{loading ? '—' : counts.History}</p>
            <p className="dc-stat-sub">Past Records</p>
          </div>
        </div>

        {/* ── Next consultation ── */}
        {loading ? (
          <div className="dc-next-empty"><div className="dc-skel" style={{ height: 20, width: '40%', borderRadius: 6 }} /></div>
        ) : nextAppt ? (
          <div className="dc-next-card">
            <div className="dc-next-top">
              <div className="dc-next-left">
                <p className="dc-next-label">
                  Next Consultation : {(() => { const d = new Date(nextAppt.date + 'T00:00:00'); return DAYS_FULL[d.getDay()]; })()}
                </p>
                <p className="dc-next-subject">{nextAppt.subject || 'Consultation'}</p>
                <p className="dc-next-faculty">{nextAppt.name || nextAppt.facultyName || 'Faculty'}</p>
              </div>
              <span className="dc-next-badge">APPROVED</span>
            </div>
            <div className="dc-next-bottom">
              <div className="dc-next-meta">
                <span className="dc-next-meta-item">
                  <Clock size={12} />
                  {nextAppt.time || (nextAppt.startTime ? formatTimeRange(nextAppt.startTime, nextAppt.endTime) : '')}
                </span>
                {nextAppt.room && (
                  <span className="dc-next-meta-item"><MapPin size={12} /> Room {nextAppt.room}</span>
                )}
              </div>
              <button className="dc-next-btn" onClick={() => onTabChange('Appointments', 'Approved')}>
                View Appointment <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ) : (
          <div className="dc-next-empty">
            <div className="dc-next-top">
              <div className="dc-next-left">
                <p className="dc-next-label">Next Consultation</p>
                <p className="dc-next-subject" style={{ opacity: 0.35 }}>No upcoming appointments</p>
                <p className="dc-next-faculty" style={{ opacity: 0.35 }}>—</p>
              </div>
            </div>
            <div className="dc-next-bottom">
              <div className="dc-next-meta" />
              <button className="dc-next-btn" onClick={() => onTabChange('Faculty')}>
                Book one now <ArrowRight size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── Quick Schedule ── */}
        <div className="dc-sched-card">
          <div className="dc-sched-hd">
            <div>
              <p className="dc-sched-title">Quick Schedule</p>
              <p className="dc-sched-week">This Week</p>
            </div>
            <button className="dc-fullcal-btn" onClick={() => onTabChange('Calendar')}>Full Calendar</button>
          </div>
          <div className="dc-week-grid">
            {weekDays.map(day => {
              const dayAppts = apptsByDay(day.dateStr);
              return (
                <div
                  className="dc-day-col"
                  key={day.dateStr}
                  role="button"
                  tabIndex={0}
                  onClick={() => onTabChange && onTabChange('Calendar', null, day.dateStr)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onTabChange && onTabChange('Calendar', null, day.dateStr); }}
                >
                  <div className="dc-day-hd">
                    <span className="dc-day-lbl">{day.label} {day.num}</span>
                  </div>
                  <div className="dc-day-body">
                    {dayAppts.map((a, i) => {
                      const sc = getStatusColor(a.status);
                      return (
                        <div key={i} className="dc-day-appt" style={{ background: sc.bg, color: sc.text }}
                          title={`${a.name || a.facultyName} · ${a.time}`}>
                          {a.time?.split(' - ')[0] || a.startTime || ''}<br />
                          {a.name?.split(' ').slice(-1)[0] || a.facultyName?.split(' ').slice(-1)[0] || ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Live Availability ── */}
        <div className="dc-avail-card">
          <div className="dc-avail-hd">
            <p className="dc-avail-label">Live Availability</p>
            <p className="dc-avail-subtitle">Faculty you can consult today</p>
          </div>
          {loading ? (
            <div className="dc-avail-grid">
              {[1,2,3,4].map(i => (
                <div key={i} className="dc-avail-fc">
                  <div className="dc-skel" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="dc-skel" style={{ height: 12, width: '70%', borderRadius: 6, marginBottom: 6 }} />
                    <div className="dc-skel" style={{ height: 10, width: '45%', borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : facultyList.length === 0 ? (
            <p className="dc-avail-empty">No faculty data available.</p>
          ) : (
            <div className="dc-avail-grid">
              {facultyList.map((f, i) => {
                const isUnavailable = f.status === 'Unavailable';
                const isBusy = f.status === 'Busy';
                const dotColor = isUnavailable ? '#616161' : isBusy ? '#ff1744' : '#00c853';
                const statusText = isUnavailable ? 'Unavailable' : isBusy ? 'Busy' : 'Available';
                return (
                  <div
                    key={i}
                    className="dc-avail-fc"
                    onClick={() => !isUnavailable && onTabChange('Faculty', 'All', f.id)}
                    style={{ opacity: isUnavailable ? 0.55 : 1, cursor: isUnavailable ? 'default' : 'pointer' }}
                    role="button"
                    tabIndex={isUnavailable ? -1 : 0}
                    onKeyDown={e => e.key === 'Enter' && !isUnavailable && onTabChange('Faculty', 'All', f.id)}
                  >
                    <div className="dc-avail-avatar">
                      <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{getInitials(f.name)}</span>
                    </div>
                    <div className="dc-avail-info">
                      <p className="dc-avail-name">{f.name?.split(' ').slice(0, 2).join(' ') || 'Faculty'}</p>
                      <div className="dc-avail-status-row" style={{ color: dotColor }}>
                        <span className="dc-avail-dot" style={{ background: dotColor }} />
                        {statusText}
                      </div>
                    </div>
                    <span className="dc-avail-book-btn" aria-hidden="true">Book</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
};

export default DashboardContent;
