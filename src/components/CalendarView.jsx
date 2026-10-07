import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, MapPin } from 'lucide-react';
import { formatTimeRange } from '../utils/dateUtils';

const STATUS_STYLES = {
  approved:  { bg: '#dbeafe', color: '#1e3a8a', border: '#3b82f6', label: 'Approved' },
  pending:   { bg: '#fef3c7', color: '#7c5200', border: '#d97706', label: 'Pending' },
  completed: { bg: '#f3f4f6', color: '#374151', border: '#9ca3af', label: 'Completed' },
  cancelled: { bg: '#f3f4f6', color: '#374151', border: '#9ca3af', label: 'Cancelled' },
  declined:  { bg: '#fee2e2', color: '#b91c1c', border: '#f87171', label: 'Declined' },
};

const fmt12 = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${ampm}` : `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

const calStyles = `
.cv-wrap { color: var(--text-primary); }

.cv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border-color);
}
.cv-month-label {
  font-size: 1.05rem;
  font-weight: 700;
}
.cv-nav {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.cv-nav-btn {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s;
}
.cv-nav-btn:hover { border-color: var(--accent, #2e4a87); }
.cv-today-btn {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 7px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.cv-today-btn:hover { border-color: var(--accent, #2e4a87); color: var(--accent, #2e4a87); }

.cv-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--border-color);
  gap: 1px;
}
.cv-weekday {
  background: var(--card-bg, #fff);
  padding: 0.6rem;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.cv-day {
  background: var(--card-bg, #fff);
  min-height: 90px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}
.cv-day:hover { background: var(--accent-light); }
.cv-day.empty { background: var(--bg-primary, #f0f2f8); opacity: 0.4; cursor: default; }
.cv-day.today { background: var(--accent-light); }
.cv-day.selected { background: var(--accent-light); outline: 2px solid var(--accent, #2e4a87); outline-offset: -2px; }

.cv-day-num {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  line-height: 1;
}
.cv-day.today .cv-day-num {
  background: var(--accent, #2e4a87);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
}

.cv-pill {
  font-size: 0.62rem;
  padding: 2px 5px;
  border-radius: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  border-left: 2px solid;
}
.cv-pill.schedule {
  background: #dbeafe;
  color: #1e40af;
  border-color: #3b82f6;
}
.cv-more {
  font-size: 0.6rem;
  color: var(--text-muted);
  font-weight: 600;
  padding: 1px 4px;
}

.cv-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.8rem 1.2rem;
  border-top: 1px solid var(--border-color);
}
.cv-legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 500;
}
.cv-legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cv-detail {
  border-top: 2px solid var(--accent, #2e4a87);
  background: var(--bg-primary, #f0f2f8);
  padding: 1.2rem;
  animation: slideDown 0.2s ease;
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.cv-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.cv-detail-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}
.cv-detail-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  padding: 2px;
  border-radius: 4px;
}
.cv-detail-close:hover { color: var(--text-primary); }
.cv-detail-section {
  margin-bottom: 1rem;
}
.cv-detail-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.cv-detail-item {
  display: flex;
  gap: 0.7rem;
  padding: 0.6rem 0.8rem;
  background: var(--card-bg, #fff);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 0.4rem;
  align-items: flex-start;
}
.cv-detail-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-top: 3px;
  flex-shrink: 0;
}
.cv-detail-info { flex: 1; min-width: 0; }
.cv-detail-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}
.cv-detail-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 2px;
}
.cv-status-badge {
  padding: 1px 7px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  border: 1px solid;
}
.cv-empty-detail {
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

@media (max-width: 600px) {
  .cv-day { min-height: 55px; padding: 0.2rem; }
  .cv-weekday { padding: 0.4rem 0.2rem; font-size: 0.58rem; }
  .cv-pill { font-size: 0.52rem; }
}
`;

const CalendarView = ({ schedules = [], requests = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(null); };

  const getEventsForDate = (dateStr, dayName) => {
    const daySchedules = schedules.filter(s =>
      (s.schedule_type === 'recurring' && s.day === dayName) ||
      (s.schedule_type === 'one-time' && s.specific_date === dateStr)
    );
    const dayRequests = requests.filter(r => r.date === dateStr);
    return { daySchedules, dayRequests };
  };

  const handleDayClick = (dateStr, daySchedules, dayRequests) => {
    if (daySchedules.length === 0 && dayRequests.length === 0) {
      setSelectedDate(null);
      return;
    }
    setSelectedDate(prev => prev === dateStr ? null : dateStr);
  };

  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`e-${i}`} className="cv-day empty" />);
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = new Date(year, month, d).toLocaleDateString('en-US', { weekday: 'long' });
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();
    const isSelected = selectedDate === dateStr;

    const { daySchedules, dayRequests } = getEventsForDate(dateStr, dayName);
    const allPills = [
      ...daySchedules.map(s => ({ type: 'schedule', s })),
      ...dayRequests.map(r => ({ type: 'request', r })),
    ];
    const visiblePills = allPills.slice(0, 2);
    const extra = allPills.length - visiblePills.length;

    days.push(
      <div
        key={d}
        className={`cv-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
        onClick={() => handleDayClick(dateStr, daySchedules, dayRequests)}
      >
        <span className="cv-day-num">{d}</span>
        {visiblePills.map((item, idx) => {
          if (item.type === 'schedule') {
            const s = item.s;
            return (
              <div key={`s-${idx}`} className="cv-pill schedule">
                {fmt12(s.start_time)}–{fmt12(s.end_time)}
              </div>
            );
          }
          const r = item.r;
          const st = STATUS_STYLES[r.status.toLowerCase()] || STATUS_STYLES.completed;
          return (
            <div
              key={`r-${idx}`}
              className="cv-pill"
              style={{ background: st.bg, color: st.color, borderColor: st.border }}
            >
              {r.name.split(' ')[0]}
            </div>
          );
        })}
        {extra > 0 && <div className="cv-more">+{extra} more</div>}
      </div>
    );
  }

  // Detail panel data
  let detailSchedules = [];
  let detailRequests = [];
  let detailLabel = '';
  if (selectedDate) {
    const [sy, sm, sd] = selectedDate.split('-').map(Number);
    const dayName = new Date(sy, sm - 1, sd).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    detailLabel = dayName;
    const ev = getEventsForDate(selectedDate, new Date(sy, sm - 1, sd).toLocaleDateString('en-US', { weekday: 'long' }));
    detailSchedules = ev.daySchedules;
    detailRequests = ev.dayRequests;
  }

  return (
    <div className="cv-wrap">
      <style>{calStyles}</style>

      {/* Header */}
      <div className="cv-header">
        <div className="cv-month-label">{monthName} {year}</div>
        <div className="cv-nav">
          <button className="cv-today-btn" onClick={goToday}>Today</button>
          <button className="cv-nav-btn" onClick={prevMonth}><ChevronLeft size={15} /></button>
          <button className="cv-nav-btn" onClick={nextMonth}><ChevronRight size={15} /></button>
        </div>
      </div>

      {/* Grid */}
      <div className="cv-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="cv-weekday">{d}</div>
        ))}
        {days}
      </div>

      {/* Legend */}
      <div className="cv-legend">
        <div className="cv-legend-item">
          <div className="cv-legend-dot" style={{ background: '#3b82f6' }} />
          Schedule Slot
        </div>
        <div className="cv-legend-item">
          <div className="cv-legend-dot" style={{ background: '#3b82f6' }} />
          Approved
        </div>
        <div className="cv-legend-item">
          <div className="cv-legend-dot" style={{ background: '#eab308' }} />
          Pending
        </div>
        <div className="cv-legend-item">
          <div className="cv-legend-dot" style={{ background: '#9ca3af' }} />
          Other
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDate && (
        <div className="cv-detail">
          <div className="cv-detail-header">
            <div className="cv-detail-title">{detailLabel}</div>
            <button className="cv-detail-close" onClick={() => setSelectedDate(null)}>
              <X size={16} />
            </button>
          </div>

          {detailSchedules.length === 0 && detailRequests.length === 0 ? (
            <div className="cv-empty-detail">No events on this day.</div>
          ) : (
            <>
              {detailSchedules.length > 0 && (
                <div className="cv-detail-section">
                  <div className="cv-detail-section-label">Schedule Slots</div>
                  {detailSchedules.map((s, i) => (
                    <div key={i} className="cv-detail-item">
                      <div className="cv-detail-dot" style={{ background: '#3b82f6' }} />
                      <div className="cv-detail-info">
                        <div className="cv-detail-name">
                          {formatTimeRange(s.start_time, s.end_time)}
                        </div>
                        <div className="cv-detail-meta">
                          {s.room && <><MapPin size={11} />{s.room}</>}
                          {s.max_slots != null && (
                            <span>{s.filled ?? 0}/{s.max_slots} slots filled</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detailRequests.length > 0 && (
                <div className="cv-detail-section">
                  <div className="cv-detail-section-label">Student Requests</div>
                  {detailRequests.map((r, i) => {
                    const st = STATUS_STYLES[r.status.toLowerCase()] || STATUS_STYLES.completed;
                    return (
                      <div key={i} className="cv-detail-item">
                        <div className="cv-detail-dot" style={{ background: st.border }} />
                        <div className="cv-detail-info">
                          <div className="cv-detail-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {r.name}
                            <span
                              className="cv-status-badge"
                              style={{ background: st.bg, color: st.color, borderColor: st.border }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <div className="cv-detail-meta">
                            {r.time && <><Clock size={11} />{r.time}</>}
                            {r.subject && <span>· {r.subject}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
