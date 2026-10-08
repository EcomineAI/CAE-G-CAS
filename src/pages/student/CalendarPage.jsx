import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays } from 'lucide-react';
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

const CalendarPage = ({ onTabChange, focusAppointmentId = null, onFocusHandled }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [highlightedApptId, setHighlightedApptId] = useState(null);
  const [popover, setPopover] = useState(null);
  const detailsRef = useRef(null);

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
    const t = setTimeout(() => setHighlightedApptId(null), 3000);
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
    Cancelled: requests.filter(r => ['Cancelled', 'Completed'].includes(r.status)).length,
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

  const upcomingAppts = requests
    .filter(r => ['Approved', 'Pending'].includes(r.status) && r.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
    .slice(0, 5);

  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => {
      const next = prev === dateStr ? null : dateStr;
      if (next && window.innerWidth < 900) {
        setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
      return next;
    });
  };

  const handleUpcomingClick = (r) => {
    const [y, mo, d] = r.date.split('-').map(Number);
    setCurrentDate(new Date(y, mo - 1, d));
    setSelectedDate(r.date);
    if (window.innerWidth < 900) {
      setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
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

  // Build calendar cells using sc-* classes
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`e-${i}`} className="sc-day-empty" />);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayReqs = filteredRequests.filter(r => r.date === dateStr);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const visiblePills = dayReqs.slice(0, 2);
    const extra = dayReqs.length - visiblePills.length;

    cells.push(
      <div
        key={d}
        className={`sc-day ${isToday ? 'sc-day-today' : ''} ${isSelected ? 'sc-day-selected' : ''}`}
        onClick={() => handleDayClick(dateStr)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleDayClick(dateStr)}
        aria-label={`${MONTH_NAMES[month]} ${d}${dayReqs.length > 0 ? `, ${dayReqs.length} appointment${dayReqs.length > 1 ? 's' : ''}` : ''}`}
      >
        <span className="sc-day-num">{d}</span>
        {visiblePills.map((r, idx) => {
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
          const timeLabel = r.startTime && r.endTime
            ? `${fmt12(r.startTime)} - ${fmt12(r.endTime)}`
            : r.time || '';
          return (
            <div
              key={idx}
              className="sc-pill sc-pill-detailed"
              style={{ background: st.bg, color: st.color, borderColor: st.border, '--pill-dot': st.border }}
              onClick={(e) => openPopover(e, r)}
              title={`${r.name} · ${r.status}`}
            >
              <span className="sc-pill-name">{r.name}</span>
              {timeLabel && <span className="sc-pill-time">{timeLabel}</span>}
              {r.subject && <span className="sc-pill-subject">{r.subject}</span>}
            </div>
          );
        })}
        {extra > 0 && <div className="sc-more">+{extra} more</div>}
      </div>
    );
  }

  const activityItems = [
    { label: 'Approved',  key: 'Approved',  dotColor: '#3b82f6', badgeBg: '#dbeafe', badgeColor: '#1e3a8a', filter: 'Approved' },
    { label: 'Pending',   key: 'Pending',   dotColor: '#d97706', badgeBg: '#fef3c7', badgeColor: '#7c5200', filter: 'Pending' },
    { label: 'Declined',  key: 'Declined',  dotColor: '#f87171', badgeBg: '#fee2e2', badgeColor: '#b91c1c', filter: 'History' },
    { label: 'Cancelled', key: 'Cancelled', dotColor: '#9ca3af', badgeBg: '#f3f4f6', badgeColor: '#374151', filter: 'History' },
  ];

  const legendItems = [
    { color: '#00c853', label: 'Approved' },
    { color: '#ffab00', label: 'Pending' },
    { color: '#ff1744', label: 'Declined' },
    { color: '#78909c', label: 'Cancelled' },
  ];

  return (
    <div className="sc-wrapper">
      <style>{calendarSharedStyles}</style>
      <div className="sc-layout">

        {/* ── Left: Calendar grid (shared component) ── */}
        <SharedCalendarGrid
          year={year}
          month={month}
          todayStr={todayStr}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          filterOptions={['All', 'Approved', 'Pending']}
          cells={cells}
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
              <div className="sc-activity-loading">Loading…</div>
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

          {/* Upcoming agenda */}
          {!loading && upcomingAppts.length > 0 && (
            <div className="sc-section">
              <div className="sc-section-title">Upcoming</div>
              {upcomingAppts.map((r, idx) => {
                const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
                const [y, mo, d] = r.date.split('-').map(Number);
                const dateLabel = new Date(y, mo - 1, d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
                return (
                  <div
                    key={r.id || idx}
                    className="sc-upcoming-item"
                    onClick={() => handleUpcomingClick(r)}
                  >
                    <div className="sc-upcoming-date-badge">{dateLabel}</div>
                    <div className="sc-upcoming-info">
                      <div className="sc-upcoming-name">{r.name}</div>
                      <div className="sc-upcoming-time">{fmt12(r.startTime) || r.time || 'TBD'}</div>
                    </div>
                    <span className="sc-upcoming-dot" style={{ background: st.border }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Day detail */}
          {selectedDate && (
            <div className="sc-section sc-details-section" ref={detailsRef}>
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
                          {r.avatar
                            ? <img src={r.avatar} alt={r.name} />
                            : <span>{r.name?.[0] || '?'}</span>
                          }
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
