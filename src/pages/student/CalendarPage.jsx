import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { getInitials } from '../../utils/dateUtils';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRequests } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { withMinDelay } from '../../supabase/ux';
import SharedCalendarGrid, {
  STATUS_STYLES,
  MONTH_NAMES,
  fmt12,
  calendarSharedStyles,
} from '../../components/SharedCalendarGrid';

const CalendarPage = ({ onTabChange, focusAppointmentId = null, focusDate = null, onFocusHandled }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [highlightedApptId, setHighlightedApptId] = useState(null);
  const [popover, setPopover] = useState(null);
  const [detailsGlow, setDetailsGlow] = useState(false);
  const pendingGlowRef = useRef(false);
  const detailsRef = useRef(null);

  // Deep-link from Dashboard week card → jump to that specific date
  useEffect(() => {
    if (!focusDate) return;
    const [y, m] = focusDate.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    setSelectedDate(focusDate);
    pendingGlowRef.current = true;
    if (onFocusHandled) onFocusHandled();
  }, [focusDate]);

  // Fire glow only after data has loaded (not on skeleton)
  useEffect(() => {
    if (loading || !pendingGlowRef.current) return;
    pendingGlowRef.current = false;
    const scroll = setTimeout(() => {
      if (detailsRef.current) detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setDetailsGlow(true);
    }, 80);
    return () => clearTimeout(scroll);
  }, [loading]);

  // Deep-link from a notification click → jump to that appointment's date
  useEffect(() => {
    if (!focusAppointmentId || requests.length === 0) return;
    const target = requests.find(r => r.id === focusAppointmentId);
    if (!target || !target.date) return;
    const [y, m] = target.date.split('-').map(Number);
    setCurrentDate(new Date(y, m - 1, 1));
    setSelectedDate(target.date);
    setStatusFilter('All');
    setHighlightedApptId(target.id);
    if (onFocusHandled) onFocusHandled();
    setTimeout(() => {
      if (detailsRef.current) detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const row = document.getElementById(`cal-appt-${target.id}`);
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
    const t = setTimeout(() => setHighlightedApptId(null), 3400);
    return () => clearTimeout(t);
  }, [focusAppointmentId, requests]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const data = await withMinDelay(getStudentRequests(user.id), 300);
      setRequests(data);
      setLoading(false);
    };
    fetchData();

    const unsub = subscribeToRequests(
      user.id,
      'student',
      setRequests,
      () => getStudentRequests(user.id)
    );
    return () => unsub();
  }, [user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(null); };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const counts = {
    Approved:  requests.filter(r => r.status === 'Approved').length,
    Pending:   requests.filter(r => r.status === 'Pending').length,
    Declined:  requests.filter(r => r.status === 'Declined').length,
    Cancelled: requests.filter(r => r.status === 'Cancelled').length,
    Completed: requests.filter(r => r.status === 'Completed').length,
  };

  const filteredRequests = statusFilter === 'All'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const selectedDayRequests = selectedDate
    ? requests
        .filter(r => r.date === selectedDate)
        .sort((a, b) => {
          const ta = a.startTime || a.time?.split(' - ')[0] || '00:00';
          const tb = b.startTime || b.time?.split(' - ')[0] || '00:00';
          return ta.localeCompare(tb);
        })
    : [];

  const selectedDayLabel = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-PH', {
          weekday: 'long', month: 'long', day: 'numeric',
        });
      })()
    : '';

  const handleDayClick = (dateStr) => {
    setDetailsGlow(false);
    setSelectedDate(prev => {
      const next = prev === dateStr ? null : dateStr;
      if (next && window.innerWidth < 900) {
        setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
      return next;
    });
  };

  const getApptFilter = (status) => {
    if (status === 'Pending') return 'Pending';
    if (status === 'Approved') return 'Approved';
    return 'History';
  };

  const openPopover = (e, r) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left;
    let y = rect.bottom + 8;
    if (x + 295 > window.innerWidth) x = window.innerWidth - 300;
    if (y + 270 > window.innerHeight) y = rect.top - 275;
    setPopover({ request: r, x, y });
  };
  const closePopover = () => setPopover(null);

  useEffect(() => {
    if (!popover) return;
    const handler = (e) => { if (!e.target.closest('.sc-popover')) closePopover(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  // Skeleton cells shown while data loads
  const skeletonCells = Array.from({ length: 35 }, (_, i) => (
    <div key={`sk-${i}`} className="sc-day-skel">
      <div className="sc-skel sc-day-skel-num" />
    </div>
  ));

  // Build calendar cells using sc-* classes
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`e-${i}`} className="sc-day-empty" />);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayReqs = filteredRequests.filter(r => r.date === dateStr);
    const isToday    = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const isPast     = dateStr < todayStr;
    const hasHistory = isPast && requests.some(r => r.date === dateStr);
    cells.push(
      <div
        key={d}
        className={`sc-day${isToday ? ' sc-day-today' : ''}${isSelected ? ' sc-day-selected' : ''}${isPast && !hasHistory ? ' sc-day-past' : ''}${hasHistory ? ' sc-day-past-history' : ''}`}
        onClick={() => handleDayClick(dateStr)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleDayClick(dateStr)}
        aria-label={`${MONTH_NAMES[month]} ${d}${dayReqs.length > 0 ? `, ${dayReqs.length} appointment${dayReqs.length > 1 ? 's' : ''}` : ''}`}
      >
        <span className="sc-day-num">{d}</span>
        {dayReqs.length === 1 && (() => {
          const r = dayReqs[0];
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
          return (
            <div
              className="sc-pill"
              style={{ background: st.bg, color: st.color, borderColor: st.border, '--pill-dot': st.border }}
              onClick={(e) => openPopover(e, r)}
              title={`${r.name} · ${r.status}`}
            >
              <span className="sc-pill-name">{r.name}</span>
            </div>
          );
        })()}
        {dayReqs.length >= 2 && (() => {
          const statusColors = { Approved: '#00c853', Pending: '#ffab00', Declined: '#ff1744', Cancelled: '#78909c', Completed: '#38bdf8' };
          const uniqueStatuses = [...new Set(dayReqs.map(r => r.status))];
          return (
            <div className="sc-multi-badge" onClick={(e) => { e.stopPropagation(); handleDayClick(dateStr); }}>
              <span className="sc-multi-count">{dayReqs.length}</span>
              <span className="sc-multi-label">appts</span>
              <div className="sc-multi-dots">
                {uniqueStatuses.map(s => (
                  <div key={s} className="sc-multi-dot" style={{ background: statusColors[s] || '#9ca3af' }} title={s} />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  const activityItems = [
    { label: 'Approved',  key: 'Approved',  dotColor: '#00c853', badgeBg: '#dcfce7', badgeColor: '#14532d', filter: 'Approved' },
    { label: 'Pending',   key: 'Pending',   dotColor: '#d97706', badgeBg: '#fef3c7', badgeColor: '#7c5200', filter: 'Pending' },
    { label: 'Declined',  key: 'Declined',  dotColor: '#f87171', badgeBg: '#fee2e2', badgeColor: '#b91c1c', filter: 'History' },
    { label: 'Completed', key: 'Completed', dotColor: '#38bdf8', badgeBg: '#e0f2fe', badgeColor: '#0369a1', filter: 'History' },
    { label: 'Cancelled', key: 'Cancelled', dotColor: '#9ca3af', badgeBg: '#f3f4f6', badgeColor: '#374151', filter: 'History' },
  ];

  const legendItems = [
    { color: '#00c853', label: 'Approved' },
    { color: '#ffab00', label: 'Pending' },
    { color: '#ff1744', label: 'Declined' },
    { color: '#38bdf8', label: 'Completed' },
    { color: '#78909c', label: 'Cancelled' },
  ];

  return (
    <div className="sc-wrapper">
      <style>{calendarSharedStyles}</style>
      <style>{`
        @keyframes detailsGlowPulse {
          0%   { box-shadow: 0 0 0 2px #1a2d5a, 0 4px 20px rgba(26,45,90,0.18); }
          50%  { box-shadow: 0 0 0 4px #1a2d5a, 0 6px 28px rgba(26,45,90,0.32); }
          100% { box-shadow: 0 0 0 2px #1a2d5a, 0 4px 20px rgba(26,45,90,0.18); }
        }
        @keyframes detailsGlowFade {
          from { box-shadow: 0 0 0 2px #1a2d5a, 0 4px 20px rgba(26,45,90,0.18); border-color: #1a2d5a; }
          to   { box-shadow: none; border-color: #c5d0f0; }
        }
        .sc-details-glow {
          border-color: #1a2d5a !important;
          animation: detailsGlowPulse 0.9s ease-in-out 3, detailsGlowFade 0.5s ease 2.7s forwards;
        }
        .sc-details-section {
          border-color: #c5d0f0 !important;
        }
      `}</style>
      <div className="sc-layout">

        {/* ── Left: Calendar grid (shared component) ── */}
        <SharedCalendarGrid
          year={year}
          month={month}
          todayStr={todayStr}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          filterOptions={['All', 'Approved', 'Pending']}
          cells={loading ? skeletonCells : cells}
          legendItems={legendItems}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
          onFilterChange={setStatusFilter}
        />

        {/* ── Pill popover ── */}
        {popover && (() => {
          const r = popover.request;
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
          const timeLabel = r.startTime && r.endTime
            ? `${fmt12(r.startTime)} – ${fmt12(r.endTime)}`
            : r.time || 'TBD';
          return (
            <>
              <div className="sc-popover-overlay" onClick={closePopover} />
              <div className="sc-popover" style={{ left: popover.x, top: popover.y }}>
                <div className="sc-popover-header">
                  <span className="sc-popover-title">{r.name}</span>
                  <button className="sc-popover-close" onClick={closePopover}>×</button>
                </div>
                <div className="sc-popover-row">
                  <span className="sc-popover-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                    {r.status}
                  </span>
                </div>
                <div className="sc-popover-row">{timeLabel}</div>
                {r.subject && <div className="sc-popover-row" style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{r.subject}</div>}
                <button
                  className="sc-popover-action"
                  onClick={() => { closePopover(); onTabChange('Appointments', getApptFilter(r.status)); }}
                >
                  View Details
                </button>
              </div>
            </>
          );
        })()}

        {/* ── Right: Sidebar ── */}
        <div className="sc-right">
          <button className="sc-cta-btn" onClick={() => onTabChange('Faculty')}>
            + Book Appointment
          </button>

          {/* Activity */}
          <div className="sc-section">
            <div className="sc-section-title">Activity</div>
            {loading ? (
              Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="sc-skel-activity-row">
                  <div className="sc-skel sc-skel-dot" />
                  <div className="sc-skel sc-skel-label" />
                  <div className="sc-skel sc-skel-badge" />
                </div>
              ))
            ) : (
              activityItems.map(({ label, key, dotColor, badgeBg, badgeColor, filter }) => (
                <button
                  key={key}
                  className="sc-activity-card"
                  onClick={() => onTabChange('Appointments', filter)}
                >
                  <div className="sc-activity-label">
                    <span className="sc-activity-dot" style={{ background: dotColor }} />
                    {label}
                  </div>
                  <span className="sc-count-badge" style={{ background: badgeBg, color: badgeColor }}>
                    {counts[key]}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Day detail */}
          {selectedDate && (
            <div
              className={`sc-section sc-details-section${detailsGlow ? ' sc-details-glow' : ''}`}
              ref={detailsRef}
            >
              <div className="sc-section-title">{selectedDayLabel}</div>
              {selectedDayRequests.length === 0 ? (
                <div className="sc-detail-empty">
                  <CalendarDays size={22} strokeWidth={1.5} />
                  <p>No appointments on this day.</p>
                </div>
              ) : (
                selectedDayRequests.map((r, idx) => {
                  const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
                  const timeLabel = r.startTime && r.endTime
                    ? `${fmt12(r.startTime)} – ${fmt12(r.endTime)}`
                    : r.time || 'TBD';
                  return (
                    <div
                      key={r.id || idx}
                      id={`cal-appt-${r.id}`}
                      className={`sc-appt-card${highlightedApptId === r.id ? ' sc-appt-card-highlight' : ''}`}
                    >
                      <div className="sc-appt-card-header">
                        <div className="sc-appt-avatar">
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{getInitials(r.name)}</span>
                        </div>
                        <div className="sc-appt-info">
                          <div className="sc-appt-name">{r.name}</div>
                          <div className="sc-appt-time">{timeLabel}</div>
                        </div>
                        <span
                          className="sc-appt-badge"
                          style={{ background: st.bg, color: st.color, borderColor: st.border }}
                        >
                          {r.status}
                        </span>
                      </div>
                      {r.subject && (
                        <div className="sc-appt-subject">{r.subject}</div>
                      )}
                      <button
                        className="sc-appt-action"
                        onClick={() => onTabChange('Appointments', getApptFilter(r.status))}
                      >
                        View Details
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
