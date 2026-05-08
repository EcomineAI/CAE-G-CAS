import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatTimeRange } from '../utils/dateUtils';

const CalendarView = ({ schedules = [], requests = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Padding for start of month
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Month days
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = new Date(year, month, d).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find schedules for this day of the week
    const daySchedules = schedules.filter(s => s.day === dayName);
    
    // Find requests for this specific date
    const dayRequests = requests.filter(r => r.date === dateStr);
    
    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    days.push(
      <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`}>
        <span className="day-number">{d}</span>
        <div className="day-events">
          {daySchedules.map((s, idx) => (
            <div key={`s-${idx}`} className="event-pill schedule" title={`${s.start_time} - ${s.end_time}`}>
              {formatTimeRange(s.start_time, s.end_time).split('-')[0]}
            </div>
          ))}
          {dayRequests.map((r, idx) => (
            <div key={`r-${idx}`} className={`event-pill request ${r.status.toLowerCase()}`} title={`${r.name}: ${r.subject}`}>
              {r.name.split(' ')[0]}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="calendar-view-container">
      <style>{`
        .calendar-view-container {
          background: var(--bg-secondary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          color: var(--text-primary);
        }
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .month-year {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .nav-btns {
          display: flex;
          gap: 0.5rem;
        }
        .nav-btn {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--border-color);
          gap: 1px;
        }
        .weekday-label {
          background: var(--bg-secondary);
          padding: 0.8rem;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .calendar-day {
          background: var(--bg-secondary);
          min-height: 100px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          position: relative;
        }
        .calendar-day.empty {
          background: var(--bg-primary);
          opacity: 0.5;
        }
        .calendar-day.today {
          background: var(--accent-light);
        }
        .day-number {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .calendar-day.today .day-number {
          color: var(--accent-orange);
          font-weight: 800;
        }
        .day-events {
          display: flex;
          flex-direction: column;
          gap: 2px;
          max-height: 80px;
          overflow-y: auto;
        }
        .event-pill {
          font-size: 0.65rem;
          padding: 2px 4px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }
        .event-pill.schedule {
          background: #dcfce7;
          color: #166534;
          border-left: 2px solid #22c55e;
        }
        .event-pill.request.approved {
          background: #e0f2fe;
          color: #075985;
          border-left: 2px solid #0ea5e9;
        }
        .event-pill.request.pending {
          background: #fef9c3;
          color: #854d0e;
          border-left: 2px solid #eab308;
        }
        
        @media (max-width: 600px) {
          .calendar-day { min-height: 60px; padding: 0.2rem; }
          .weekday-label { padding: 0.4rem; font-size: 0.6rem; }
          .event-pill { font-size: 0.5rem; }
        }
      `}</style>

      <div className="calendar-header">
        <div className="month-year">{monthName} {year}</div>
        <div className="nav-btns">
          <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={16} /></button>
          <button className="nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
        {days}
      </div>
    </div>
  );
};

export default CalendarView;
