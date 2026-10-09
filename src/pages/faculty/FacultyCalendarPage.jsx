import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, Clock, MapPin, Plus, Ban, Activity, Trash2, X, Pencil, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultyRequests, getFacultySchedules, createSchedule, updateSchedule, deleteSchedule, getBlockedDates, createBlockedDate, deleteBlockedDate } from '../../supabase/api';
import { subscribeToRequests, subscribeToSchedules } from '../../supabase/realtime';
import { withMinDelay, toast } from '../../supabase/ux';
import SharedCalendarGrid, { STATUS_STYLES, WEEKDAYS, MONTH_NAMES, fmt12, calendarSharedStyles } from '../../components/SharedCalendarGrid';
import { getInitials } from '../../utils/dateUtils';

/* ── Faculty-specific styles (shared grid styles come from calendarSharedStyles) ── */
const facultyCalStyles = `
.fcp-wrapper { height: 100%; animation: scFadeIn 0.35s ease; }

.fcp-layout {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  height: calc(100vh - 110px);
  min-height: 480px;
}
.fcp-layout .sc-right { height: 100%; overflow-y: auto; }

/* Action buttons passed into calendar header */
.fcp-actions { display: flex; gap: 0.4rem; margin-left: auto; }
.fcp-action-btn {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.32rem 0.75rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent; color: var(--text-secondary);
  font-size: 0.72rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.fcp-action-btn:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fcp-action-btn.active { background: #1a2d5a; color: #fff; border-color: #1a2d5a; }

/* Slot count badge inside calendar cells */
.fcp-slot-badge {
  display: inline-flex; align-items: center;
  padding: 2px 6px; border-radius: 5px;
  font-size: 0.6rem; font-weight: 700;
  background: #dbeafe; color: #1e40af;
  border: 1px solid rgba(59,130,246,0.3);
  white-space: nowrap;
}
.fcp-slot-badge.has-pending { background: #fef3c7; color: #7c5200; border-color: rgba(217,119,6,0.3); }
.fcp-slot-badge.blocked { background: #fee2e2; color: #991b1b; border-color: rgba(220,38,38,0.3); font-weight: 800; }

/* Blocked day cell */
.fcp-day-blocked {
  background: repeating-linear-gradient(
    45deg,
    rgba(239,68,68,0.06) 0, rgba(239,68,68,0.06) 6px,
    rgba(239,68,68,0.12) 6px, rgba(239,68,68,0.12) 12px
  );
  border-color: rgba(239,68,68,0.3) !important;
}
.fcp-day-blocked:hover { background: rgba(239,68,68,0.1); }

/* Blocked banner inside day detail */
.fcp-block-banner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 0.75rem;
  background: #fee2e2; color: #991b1b;
  border-bottom: 1px solid rgba(220,38,38,0.25);
  padding: 0.65rem 0.9rem; font-size: 0.82rem;
}
.fcp-block-banner-sub { font-size: 0.72rem; color: #b91c1c; opacity: 0.85; margin-top: 2px; }
.fcp-block-banner-btn {
  background: #fff; color: #991b1b;
  border: 1px solid rgba(220,38,38,0.4); border-radius: 7px;
  font-size: 0.74rem; font-weight: 700;
  padding: 4px 10px; cursor: pointer; transition: background 0.15s; flex-shrink: 0;
}
.fcp-block-banner-btn:hover { background: #fecaca; }

/* Day detail card */
.fcp-detail-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px; overflow: hidden;
  box-shadow: var(--card-shadow, 0 1px 6px rgba(0,0,0,0.05));
  animation: scFadeIn 0.25s ease;
}
.fcp-detail-header {
  padding: 0.85rem 1rem 0.7rem;
  border-bottom: 1px solid var(--card-border, #e5e8f0);
}
.fcp-detail-day-label { font-size: 0.9rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
.fcp-detail-hours { font-size: 0.72rem; color: var(--text-muted); margin: 0; display: flex; align-items: center; gap: 0.3rem; }

/* Slot card actions */
.fcp-slot-actions { display: flex; align-items: center; gap: 4px; margin-left: auto; }
.fcp-slot-icon-btn {
  width: 26px; height: 26px; background: transparent; border: none;
  border-radius: 6px; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--text-muted); transition: background 0.15s, color 0.15s;
}
.fcp-slot-icon-btn:hover { background: rgba(0,0,0,0.06); color: var(--text-primary); }
.fcp-slot-icon-btn.danger:hover { background: #fee2e2; color: #dc2626; }

/* Inline edit form */
.fcp-slot-edit {
  padding: 0.75rem 1rem 0.9rem;
  background: rgba(26,45,90,0.04);
  border-bottom: 1px solid var(--card-border, #e5e8f0);
  display: flex; flex-direction: column; gap: 0.55rem;
}
.fcp-slot-edit-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.fcp-slot-edit-field { display: flex; flex-direction: column; gap: 3px; }
.fcp-slot-edit-field label {
  font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.fcp-slot-edit-field input,
.fcp-slot-edit-field select {
  width: 100%; padding: 0.4rem 0.55rem;
  border: 1px solid var(--card-border, #e5e8f0); border-radius: 7px;
  font-size: 0.82rem; color: var(--text-primary); background: var(--card-bg, #fff);
  font-family: inherit; outline: none; box-sizing: border-box;
}
.fcp-slot-edit-field input:focus,
.fcp-slot-edit-field select:focus { border-color: #1a2d5a; box-shadow: 0 0 0 2px rgba(26,45,90,0.1); }
.fcp-slot-edit-footer { display: flex; justify-content: flex-end; gap: 0.4rem; margin-top: 0.35rem; }
.fcp-slot-edit-cancel,
.fcp-slot-edit-save {
  padding: 0.35rem 0.9rem; border-radius: 7px;
  font-size: 0.76rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s, border-color 0.15s;
}
.fcp-slot-edit-cancel { background: transparent; border: 1px solid var(--card-border, #e5e8f0); color: var(--text-secondary); }
.fcp-slot-edit-cancel:hover { border-color: var(--text-primary); color: var(--text-primary); }
.fcp-slot-edit-save { background: #1a2d5a; color: #fff; border: none; }
.fcp-slot-edit-save:hover:not(:disabled) { opacity: 0.9; }
.fcp-slot-edit-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* Slot row */
.fcp-slot-row { padding: 0.6rem 1rem; border-bottom: 1px solid var(--card-border, #e5e8f0); }
.fcp-slot-bar-row { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; }
.fcp-slot-bar { width: 4px; border-radius: 3px; background: #2e4a87; align-self: stretch; flex-shrink: 0; min-height: 32px; }
.fcp-slot-info { flex: 1; min-width: 0; }
.fcp-slot-time-label { font-size: 0.82rem; font-weight: 700; color: var(--text-primary); }
.fcp-slot-meta-row { font-size: 0.68rem; color: var(--text-muted); margin-top: 1px; display: flex; align-items: center; gap: 0.3rem; }

/* Student row */
.fcp-student-row {
  display: flex; align-items: center; gap: 0.55rem;
  padding: 0.55rem 1rem 0.55rem 1.65rem;
  border-bottom: 1px solid var(--card-border, #e5e8f0);
}
.fcp-student-row:last-of-type { border-bottom: none; }
.fcp-student-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #dbeafe; color: #1e3a8a;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0; overflow: hidden;
}
.fcp-student-avatar img { width: 100%; height: 100%; object-fit: cover; }
.fcp-student-name { flex: 1; min-width: 0; font-size: 0.8rem; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fcp-appt-badge { font-size: 0.6rem; font-weight: 700; padding: 2px 6px; border-radius: 8px; border: 1px solid; flex-shrink: 0; }
.fcp-cancel-btn {
  font-size: 0.68rem; font-weight: 600; padding: 0.22rem 0.55rem;
  border-radius: 6px; border: 1px solid #f87171;
  background: transparent; color: #ef4444;
  cursor: pointer; font-family: inherit; transition: all 0.12s; flex-shrink: 0;
}
.fcp-cancel-btn:hover { background: #fee2e2; }

/* Detail actions */
.fcp-detail-actions { display: flex; flex-direction: column; gap: 0.45rem; padding: 0.7rem 1rem; }
.fcp-block-btn {
  width: 100%; padding: 0.5rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent; color: var(--text-secondary);
  font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-block-btn:hover { border-color: #ef4444; color: #ef4444; }
.fcp-add-slot-btn {
  width: 100%; padding: 0.5rem; border-radius: 8px; border: none;
  background: #1a2d5a; color: #fff;
  font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-add-slot-btn:hover { opacity: 0.88; }

/* No day selected */
.fcp-no-day {
  background: var(--card-bg, #fff); border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px; padding: 2rem 1.2rem; text-align: center;
  color: var(--text-muted); font-size: 0.82rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
}

/* Dark mode overrides for faculty-specific elements */
.faculty-dashboard-wrapper.dark .fcp-detail-card,
.faculty-dashboard-wrapper.dark .fcp-no-day {
  background: rgba(12,14,26,0.97);
  border-color: rgba(99,102,241,0.2);
}

/* Mobile */
@media (max-width: 900px) {
  .fcp-layout { flex-direction: column; height: auto; }
  .fcp-layout .sc-right { height: auto; overflow-y: visible; }
}

/* ── Modal overlay ── */
.fcp-modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; animation: fcpOverlayIn 0.18s ease;
}
@keyframes fcpOverlayIn { from { opacity:0; } to { opacity:1; } }

.fcp-modal {
  background: var(--card-bg, #fff); border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  width: 100%; max-width: 520px; max-height: 88vh;
  overflow-y: auto; scrollbar-width: none;
  animation: fcpModalIn 0.2s ease; font-family: 'Outfit', sans-serif;
}
.fcp-modal::-webkit-scrollbar { display: none; }
@keyframes fcpModalIn {
  from { opacity:0; transform: scale(0.96) translateY(10px); }
  to   { opacity:1; transform: scale(1) translateY(0); }
}
.fcp-modal-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 1.4rem 1.5rem 0; }
.fcp-modal-title { font-size: 1.1rem; font-weight: 800; color: var(--text-primary, #1a2d5a); margin: 0 0 0.15rem; }
.fcp-modal-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
.fcp-modal-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.1rem; line-height: 1; transition: color 0.12s; flex-shrink: 0; }
.fcp-modal-close:hover { color: var(--text-primary); }
.fcp-modal-body { padding: 1.2rem 1.5rem; }
.fcp-modal-divider { border: none; border-top: 1px solid var(--border-color, #e5e8f0); margin: 0; }
.fcp-modal-footer { display: flex; align-items: center; justify-content: flex-end; gap: 0.65rem; padding: 1rem 1.5rem; border-top: 1px solid var(--border-color, #e5e8f0); }
.fcp-modal-btn-cancel {
  padding: 0.55rem 1.3rem; border-radius: 9px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent; color: var(--text-secondary);
  font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: border-color 0.15s;
}
.fcp-modal-btn-cancel:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fcp-modal-btn-primary {
  padding: 0.55rem 1.4rem; border-radius: 9px; border: none;
  background: #1a2d5a; color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: opacity 0.15s;
}
.fcp-modal-btn-primary:hover { opacity: 0.88; }
.fcp-modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Weekly Hours modal ── */
.fcp-wh-day-row { display: flex; align-items: center; padding: 0.9rem 0; border-bottom: 1px solid var(--border-color, #e5e8f0); gap: 0.75rem; }
.fcp-wh-day-row:last-child { border-bottom: none; }
.fcp-wh-day-name { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); min-width: 90px; }
.fcp-wh-day-info { flex: 1; font-size: 0.78rem; color: var(--text-muted); }
.fcp-wh-icon-btn { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; border-radius: 6px; transition: all 0.12s; display: flex; align-items: center; }
.fcp-wh-icon-btn:hover { background: var(--bg-primary, #f0f2f8); color: var(--text-primary); }
.fcp-wh-icon-btn.danger:hover { color: #ef4444; background: #fee2e2; }
.fcp-wh-empty { text-align: center; padding: 1.5rem 0; color: var(--text-muted); font-size: 0.82rem; }
.fcp-wh-form {
  background: var(--bg-primary, #f0f2f8); border-radius: 10px; padding: 1rem; margin-top: 1rem;
  display: flex; flex-direction: column; gap: 0.75rem; border: 1px solid var(--border-color, #e5e8f0);
}
.fcp-wh-form-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.fcp-wh-label { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem; display: block; }
.fcp-wh-select, .fcp-wh-input {
  width: 100%; padding: 0.5rem 0.7rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff); color: var(--text-primary);
  font-family: inherit; font-size: 0.85rem; outline: none;
  transition: border-color 0.15s; box-sizing: border-box;
}
.fcp-wh-select:focus, .fcp-wh-input:focus { border-color: #1a2d5a; }
.fcp-wh-form-field { flex: 1; min-width: 110px; }
.fcp-wh-add-btn {
  width: 100%; padding: 0.5rem; border-radius: 8px; border: none;
  background: #1a2d5a; color: #fff; font-size: 0.82rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-wh-add-btn:hover { opacity: 0.88; }
.fcp-wh-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.fcp-wh-show-form-btn {
  width: 100%; margin-top: 1rem; padding: 0.5rem; border-radius: 8px;
  border: 1.5px dashed var(--border-color, #d1d5db);
  background: transparent; color: var(--text-muted);
  font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-wh-show-form-btn:hover { border-color: #1a2d5a; color: #1a2d5a; }

/* ── Block dates modal ── */
.fcp-bd-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.fcp-bd-field { flex: 1; min-width: 130px; }
.fcp-bd-label { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.3rem; display: block; }
.fcp-bd-input {
  width: 100%; padding: 0.55rem 0.75rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff); color: var(--text-primary);
  font-family: inherit; font-size: 0.88rem; outline: none;
  transition: border-color 0.15s; box-sizing: border-box;
}
.fcp-bd-input:focus { border-color: #1a2d5a; }
.fcp-bd-select {
  width: 100%; padding: 0.55rem 0.75rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff); color: var(--text-primary);
  font-family: inherit; font-size: 0.88rem; outline: none;
  cursor: pointer; margin-top: 0.75rem;
  transition: border-color 0.15s; box-sizing: border-box;
}
.fcp-bd-select:focus { border-color: #1a2d5a; }
.fcp-bd-info { margin-top: 0.85rem; padding: 0.7rem 0.9rem; background: #eef3fb; border-radius: 8px; font-size: 0.8rem; color: #2e4a87; font-weight: 500; }
.fcp-bd-info.warning { background: #fef3c7; color: #7c5200; }

/* ── Activity log modal ── */
.fcp-al-item { padding: 0.85rem 0; border-bottom: 1px solid var(--border-color, #e5e8f0); }
.fcp-al-item:last-child { border-bottom: none; }
.fcp-al-desc { font-size: 0.86rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.2rem; }
.fcp-al-time { font-size: 0.74rem; color: var(--text-muted); margin: 0; }
`;

// ─── Blocked dates helpers ───────────────────────────────────────────────────
const normBlock = (row) => ({ id: row.id, from: row.from_date, to: row.to_date, reason: row.reason || '' });
const findBlock = (list, dateStr) => list.find(b => dateStr >= b.from && dateStr <= b.to) || null;
const weekdayFromIso = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
};

const FacultyCalendarPage = ({ onTabChange }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [blockedDates, setBlockedDates] = useState([]);
  const [popover, setPopover] = useState(null);
  const [modal, setModal] = useState(null);
  const detailsRef = useRef(null);

  // Weekly Hours modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [whSaving, setWhSaving] = useState(false);
  const [whForm, setWhForm] = useState({ day: 'Monday', start_time: '08:00', end_time: '09:00', max_slots: 3, duration: 30, room: '' });

  // Block dates modal state
  const today2 = new Date();
  const todayIso = `${today2.getFullYear()}-${String(today2.getMonth()+1).padStart(2,'0')}-${String(today2.getDate()).padStart(2,'0')}`;
  const [bdFrom, setBdFrom] = useState(todayIso);
  const [bdTo,   setBdTo]   = useState(todayIso);
  const [bdReason, setBdReason] = useState('');
  const [bdSaving, setBdSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [reqs, scheds, blocks] = await withMinDelay(
        Promise.all([getFacultyRequests(user.id), getFacultySchedules(user.id), getBlockedDates(user.id)]),
        300
      );
      setRequests(reqs);
      setSchedules(scheds);
      setBlockedDates(blocks.map(normBlock));
      setLoading(false);
    };
    fetchData();
    const unsubReqs = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    const unsubScheds = subscribeToSchedules(user.id, setSchedules, () => getFacultySchedules(user.id));
    return () => { unsubReqs(); unsubScheds(); };
  }, [user]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay  = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday   = () => { setCurrentDate(new Date()); setSelectedDate(null); };

  const today    = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const counts = {
    Approved:  requests.filter(r => r.status === 'Approved').length,
    Pending:   requests.filter(r => r.status === 'Pending').length,
    Declined:  requests.filter(r => r.status === 'Declined').length,
    Cancelled: requests.filter(r => ['Cancelled','Completed'].includes(r.status)).length,
  };

  const filteredRequests = statusFilter === 'All' ? requests : requests.filter(r => r.status === statusFilter);

  const getEventsForDate = (dateStr) => {
    const dayName = new Date(...dateStr.split('-').map((v,i) => i===1 ? Number(v)-1 : Number(v)))
      .toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedules = schedules.filter(s =>
      (s.schedule_type === 'recurring' && s.day === dayName) ||
      (s.schedule_type === 'one-time'  && s.specific_date === dateStr)
    );
    const dayRequests = filteredRequests.filter(r => r.date === dateStr);
    return { daySchedules, dayRequests };
  };

  const getDetailForDate = (dateStr) => {
    const dayName = new Date(...dateStr.split('-').map((v,i) => i===1 ? Number(v)-1 : Number(v)))
      .toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedules = schedules.filter(s =>
      (s.schedule_type === 'recurring' && s.day === dayName) ||
      (s.schedule_type === 'one-time'  && s.specific_date === dateStr)
    );
    const dayRequests = requests
      .filter(r => r.date === dateStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    return { daySchedules, dayRequests };
  };

  const selectedDayLabel = selectedDate
    ? (() => { const [y,m,d] = selectedDate.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }); })()
    : '';

  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => {
      const next = prev === dateStr ? null : dateStr;
      if (next && window.innerWidth < 900) {
        setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
      return next;
    });
  };

  const getReqFilter = (status) => {
    if (status === 'Pending') return 'Pending';
    if (status === 'Approved') return 'Approved';
    return 'History';
  };

  const openPopover = (e, r) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left, y = rect.bottom + 8;
    if (x + 285 > window.innerWidth) x = window.innerWidth - 290;
    if (y + 260 > window.innerHeight) y = rect.top - 265;
    setPopover({ request: r, x, y });
  };
  const closePopover = () => setPopover(null);

  useEffect(() => {
    if (!popover) return;
    const handler = (e) => { if (!e.target.closest('.sc-popover')) closePopover(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  // Weekly Hours: add a recurring slot
  const handleAddHours = async () => {
    if (!user) return;
    setWhSaving(true);
    const data = await createSchedule({
      faculty_id: user.id, schedule_type: 'recurring',
      day: whForm.day, start_time: whForm.start_time, end_time: whForm.end_time,
      max_slots: Number(whForm.max_slots), duration: Number(whForm.duration), room: whForm.room || null,
    });
    if (data) {
      setSchedules(prev => [...prev, { ...data, filled: 0 }]);
      setShowAddForm(false);
      setWhForm({ day: 'Monday', start_time: '08:00', end_time: '09:00', max_slots: 3, duration: 30, room: '' });
      toast?.success?.(`${whForm.day} hours added`);
    } else {
      toast?.error?.('Could not save hours. Check your database connection.');
    }
    setWhSaving(false);
  };

  const handleDeleteSchedule = async (id) => {
    const ok = await deleteSchedule(id);
    if (ok) { setSchedules(prev => prev.filter(s => s.id !== id)); toast?.success?.('Slot deleted'); }
    else    { toast?.error?.('Could not delete slot.'); }
  };

  // Inline slot editing
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editSlotForm, setEditSlotForm]   = useState(null);
  const [editSaving, setEditSaving]       = useState(false);

  const startEditSlot  = (slot) => { setEditingSlotId(slot.id); setEditSlotForm({ start_time: slot.start_time || '08:00', end_time: slot.end_time || '09:00', max_slots: slot.max_slots ?? 3, duration: slot.duration ?? 30, room: slot.room ?? '' }); };
  const cancelEditSlot = () => { setEditingSlotId(null); setEditSlotForm(null); };
  const saveEditSlot   = async (slotId) => {
    if (!editSlotForm) return;
    setEditSaving(true);
    const updates = { start_time: editSlotForm.start_time, end_time: editSlotForm.end_time, max_slots: Number(editSlotForm.max_slots), duration: Number(editSlotForm.duration), room: editSlotForm.room || null };
    const updated = await updateSchedule(slotId, updates);
    setEditSaving(false);
    if (updated) { setSchedules(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s)); cancelEditSlot(); toast?.success?.('Slot updated'); }
    else         { toast?.error?.('Could not save changes.'); }
  };

  // Group recurring schedules by day
  const recurringByDay = WEEKDAYS.reduce((acc, d) => {
    const full = { Sun:'Sunday',Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday' }[d];
    const slots = schedules.filter(s => s.schedule_type === 'recurring' && s.day === full);
    if (slots.length) acc[full] = slots;
    return acc;
  }, {});

  const bdRequestsInRange = bdFrom && bdTo
    ? requests.filter(r => r.date >= bdFrom && r.date <= bdTo && ['Pending','Approved'].includes(r.status))
    : [];

  const mockActivityLog = [
    ...requests.filter(r => r.status === 'Approved').slice(0,3).map(r => ({ id: `appr-${r.id}`, desc: `Approved ${r.name?.split('(')[0]?.trim() || 'student'} · ${r.day}, ${fmt12(r.startTime)}`, ts: r.date })),
    ...requests.filter(r => r.status === 'Declined').slice(0,2).map(r => ({ id: `decl-${r.id}`, desc: `Declined ${r.name?.split('(')[0]?.trim() || 'student'} · ${r.day}, ${fmt12(r.startTime)}`, ts: r.date })),
  ].sort((a,b) => (b.ts||'').localeCompare(a.ts||'')).slice(0,10);

  // Build calendar cells using sc-* classes
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`e-${i}`} className="sc-day-empty" />);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr   = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday    = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const { daySchedules, dayRequests } = getEventsForDate(dateStr);
    const block = findBlock(blockedDates, dateStr);
    const totalSlots  = daySchedules.reduce((sum,s) => sum + (s.max_slots||0), 0);
    const filledSlots = dayRequests.filter(r => r.status === 'Approved').length;
    const hasPending  = dayRequests.some(r => r.status === 'Pending');

    // When a filter is active, only show badge if filtered requests exist for this day
    const isFiltered   = statusFilter !== 'All';
    const showBadge    = isFiltered
      ? dayRequests.length > 0
      : daySchedules.length > 0 || dayRequests.length > 0;

    cells.push(
      <div
        key={d}
        className={`sc-day${isToday ? ' sc-day-today' : ''}${isSelected ? ' sc-day-selected' : ''}${block ? ' fcp-day-blocked' : ''}`}
        onClick={() => handleDayClick(dateStr)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleDayClick(dateStr)}
        aria-label={`${MONTH_NAMES[month]} ${d}${block ? ' (blocked)' : ''}`}
      >
        <span className="sc-day-num">{d}</span>
        {block && <span className="fcp-slot-badge blocked" title={block.reason || 'Blocked'}>Blocked</span>}
        {!block && showBadge && (
          <span className={`fcp-slot-badge${hasPending ? ' has-pending' : ''}`}>
            {isFiltered
              ? `${dayRequests.length} ${statusFilter.toLowerCase()}`
              : totalSlots > 0
                ? `${filledSlots} of ${totalSlots}`
                : dayRequests.length > 0
                  ? `${dayRequests.length} req`
                  : `${daySchedules.length} slot${daySchedules.length !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    );
  }

  const activityItems = [
    { label: 'Approved',  key: 'Approved',  dotColor: '#3b82f6', badgeBg: '#dbeafe', badgeColor: '#1e3a8a', filter: 'Approved' },
    { label: 'Pending',   key: 'Pending',   dotColor: '#d97706', badgeBg: '#fef3c7', badgeColor: '#7c5200', filter: 'Pending' },
    { label: 'Declined',  key: 'Declined',  dotColor: '#f87171', badgeBg: '#fee2e2', badgeColor: '#b91c1c', filter: 'History' },
    { label: 'Cancelled', key: 'Cancelled', dotColor: '#9ca3af', badgeBg: '#f3f4f6', badgeColor: '#374151', filter: 'History' },
  ];

  const detailData = selectedDate ? getDetailForDate(selectedDate) : null;

  const buildSlotGroups = (daySchedules, dayRequests) =>
    daySchedules.map(s => ({
      schedule: s,
      requests: dayRequests.filter(r => r.startTime && s.start_time && r.startTime >= s.start_time && (s.end_time ? r.startTime < s.end_time : true)),
    }));

  // Header action buttons passed to SharedCalendarGrid via headerExtra
  const headerExtra = (
    <div className="fcp-actions">
      <button
        className={`fcp-action-btn${modal === 'weekly' ? ' active' : ''}`}
        onClick={() => {
          const prefillDay = weekdayFromIso(selectedDate);
          if (prefillDay) { setWhForm(f => ({ ...f, day: prefillDay })); setShowAddForm(true); }
          else             { setShowAddForm(false); }
          setModal('weekly');
        }}
      >
        <Clock size={11} /> Weekly hours
      </button>
      <button
        className={`fcp-action-btn${modal === 'block' ? ' active' : ''}`}
        onClick={() => {
          if (selectedDate) { setBdFrom(selectedDate); setBdTo(selectedDate); }
          setModal('block');
        }}
      >
        <Ban size={11} /> Block dates
      </button>
      <button className={`fcp-action-btn${modal === 'activity' ? ' active' : ''}`} onClick={() => setModal('activity')}>
        <Activity size={11} /> Activity log
      </button>
    </div>
  );

  return (
    <>
    <div className="fcp-wrapper">
      <style>{calendarSharedStyles}</style>
      <style>{facultyCalStyles}</style>

      <div className="fcp-layout">

        {/* ── Left: SharedCalendarGrid ── */}
        <SharedCalendarGrid
          year={year}
          month={month}
          todayStr={todayStr}
          selectedDate={selectedDate}
          statusFilter={statusFilter}
          filterOptions={['All', 'Approved', 'Pending']}
          cells={cells}
          legendItems={[
            { color: '#3b82f6', label: 'Open slots' },
            { color: '#d97706', label: 'Has pending' },
            { color: '#9ca3af', label: 'Blocked' },
          ]}
          headerExtra={headerExtra}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
          onFilterChange={setStatusFilter}
        />

        {/* ── Pill popover ── */}
        {popover && (() => {
          const r  = popover.request;
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
          const name = r.studentName || r.name || '—';
          const timeLabel = r.startTime && r.endTime ? `${fmt12(r.startTime)} – ${fmt12(r.endTime)}` : r.time || 'TBD';
          return (
            <>
              <div className="sc-popover-overlay" onClick={closePopover} />
              <div className="sc-popover" style={{ left: popover.x, top: popover.y }}>
                <div className="sc-popover-header">
                  <span className="sc-popover-title">{name}</span>
                  <button className="sc-popover-close" onClick={closePopover}>×</button>
                </div>
                <div className="sc-popover-row">
                  <span className="sc-popover-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{r.status}</span>
                </div>
                <div className="sc-popover-row">{timeLabel}</div>
                {r.subject && <div className="sc-popover-row" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{r.subject}</div>}
                <button className="sc-popover-action" onClick={() => { closePopover(); onTabChange('Requests', getReqFilter(r.status)); }}>
                  View Details
                </button>
              </div>
            </>
          );
        })()}

        {/* ── Right panel ── */}
        <div className="sc-right" ref={detailsRef}>

          {/* Day detail */}
          {selectedDate && detailData ? (
            <div className="fcp-detail-card">
              {/* Blocked banner */}
              {(() => {
                const block = findBlock(blockedDates, selectedDate);
                if (!block) return null;
                return (
                  <div className="fcp-block-banner">
                    <div>
                      <strong>This date is blocked.</strong>
                      {block.reason && <> — <em>{block.reason}</em></>}
                      <div className="fcp-block-banner-sub">
                        {block.from === block.to ? 'Single day' : `Range: ${block.from} to ${block.to}`}
                      </div>
                    </div>
                    <button
                      className="fcp-block-banner-btn"
                      onClick={async () => {
                        const ok = await deleteBlockedDate(block.id);
                        if (ok) { setBlockedDates(prev => prev.filter(b => b.id !== block.id)); toast?.success?.('Date unblocked'); }
                        else    { toast?.error?.('Could not unblock. Try again.'); }
                      }}
                    >Unblock</button>
                  </div>
                );
              })()}

              {/* Day header */}
              <div className="fcp-detail-header">
                <p className="fcp-detail-day-label">{selectedDayLabel}</p>
                {detailData.daySchedules.length > 0 && (() => {
                  const earliest = detailData.daySchedules.reduce((min,s) => s.start_time < min ? s.start_time : min, detailData.daySchedules[0].start_time);
                  const latest   = detailData.daySchedules.reduce((max,s) => s.end_time   > max ? s.end_time   : max, detailData.daySchedules[0].end_time);
                  return <p className="fcp-detail-hours"><Clock size={10} />Hours: {fmt12(earliest)} to {fmt12(latest)}</p>;
                })()}
              </div>

              {detailData.daySchedules.length === 0 && detailData.dayRequests.length === 0 ? (
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No events on this day.
                </div>
              ) : (
                <>
                  {detailData.daySchedules.length > 0
                    ? buildSlotGroups(detailData.daySchedules, detailData.dayRequests).map((group, gi) => (
                        <React.Fragment key={gi}>
                          <div className="fcp-slot-row">
                            <div className="fcp-slot-bar-row">
                              <div className="fcp-slot-bar" />
                              <div className="fcp-slot-info">
                                <div className="fcp-slot-time-label">{fmt12(group.schedule.start_time)} to {fmt12(group.schedule.end_time)}</div>
                                <div className="fcp-slot-meta-row">
                                  {group.schedule.filled != null && group.schedule.max_slots != null && (
                                    <span>{group.schedule.filled ?? 0} of {group.schedule.max_slots}</span>
                                  )}
                                  {group.schedule.room && <><span>·</span><MapPin size={9} /><span>{group.schedule.room}</span></>}
                                </div>
                              </div>
                              <div className="fcp-slot-actions">
                                <button className="fcp-slot-icon-btn" title="Edit slot" onClick={() => startEditSlot(group.schedule)}><Pencil size={13} /></button>
                                <button className="fcp-slot-icon-btn danger" title="Delete slot" onClick={() => handleDeleteSchedule(group.schedule.id)}><Trash2 size={13} /></button>
                              </div>
                            </div>
                          </div>

                          {editingSlotId === group.schedule.id && editSlotForm && (
                            <div className="fcp-slot-edit">
                              <div className="fcp-slot-edit-row">
                                <div className="fcp-slot-edit-field">
                                  <label>Start time</label>
                                  <input type="time" value={editSlotForm.start_time} onChange={e => setEditSlotForm(f => ({ ...f, start_time: e.target.value }))} />
                                </div>
                                <div className="fcp-slot-edit-field">
                                  <label>End time</label>
                                  <input type="time" value={editSlotForm.end_time} onChange={e => setEditSlotForm(f => ({ ...f, end_time: e.target.value }))} />
                                </div>
                              </div>
                              <div className="fcp-slot-edit-row">
                                <div className="fcp-slot-edit-field">
                                  <label>Duration (min)</label>
                                  <select value={editSlotForm.duration} onChange={e => setEditSlotForm(f => ({ ...f, duration: e.target.value }))}>
                                    {[15,20,30,45,60].map(d => <option key={d} value={d}>{d} min</option>)}
                                  </select>
                                </div>
                                <div className="fcp-slot-edit-field">
                                  <label>Slots per time</label>
                                  <input type="number" min={1} max={20} value={editSlotForm.max_slots} onChange={e => setEditSlotForm(f => ({ ...f, max_slots: e.target.value }))} />
                                </div>
                              </div>
                              <div className="fcp-slot-edit-field">
                                <label>Room</label>
                                <input type="text" placeholder="e.g. Room 510 or TBA" value={editSlotForm.room} onChange={e => setEditSlotForm(f => ({ ...f, room: e.target.value }))} />
                              </div>
                              <div className="fcp-slot-edit-footer">
                                <button className="fcp-slot-edit-cancel" onClick={cancelEditSlot} disabled={editSaving}>Cancel</button>
                                <button className="fcp-slot-edit-save" onClick={() => saveEditSlot(group.schedule.id)} disabled={editSaving || !editSlotForm.start_time || !editSlotForm.end_time}>
                                  <Check size={12} /> {editSaving ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}

                          {group.requests.map((r, ri) => {
                            const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
                            return (
                              <div key={r.id || ri} className="fcp-student-row">
                                <div className="fcp-student-avatar">
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{getInitials(r.name || r.studentName)}</span>
                                </div>
                                <span className="fcp-student-name">{r.name || r.studentName || '—'}</span>
                                <span className="fcp-appt-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{r.status}</span>
                                {r.status !== 'Cancelled' && r.status !== 'Declined' && (
                                  <button className="fcp-cancel-btn" onClick={e => { e.stopPropagation(); onTabChange('Requests', getReqFilter(r.status)); }}>Cancel</button>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))
                    : detailData.dayRequests.map((r, idx) => {
                        const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
                        return (
                          <div key={r.id || idx} className="fcp-student-row" style={{ paddingLeft: '1rem' }}>
                            <div className="fcp-student-avatar">
                              <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>{getInitials(r.name || r.studentName)}</span>
                            </div>
                            <span className="fcp-student-name">{r.name || r.studentName || '—'}</span>
                            <span className="fcp-appt-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{r.status}</span>
                            {r.status !== 'Cancelled' && r.status !== 'Declined' && (
                              <button className="fcp-cancel-btn" onClick={e => { e.stopPropagation(); onTabChange('Requests', getReqFilter(r.status)); }}>Cancel</button>
                            )}
                          </div>
                        );
                      })
                  }

                  <div className="fcp-detail-actions">
                    <button
                      className="fcp-block-btn"
                      onClick={() => { if (selectedDate) { setBdFrom(selectedDate); setBdTo(selectedDate); } setBdReason(''); setModal('block'); }}
                    >
                      <Ban size={13} /> Block this date
                    </button>
                    <button
                      className="fcp-add-slot-btn"
                      onClick={async () => {
                        if (!user || !selectedDate) return;
                        const dayName = weekdayFromIso(selectedDate);
                        const row = await createSchedule({ faculty_id: user.id, schedule_type: 'one-time', specific_date: selectedDate, day: dayName, start_time: '08:00', end_time: '09:00', max_slots: 3, duration: 30, room: null });
                        if (row) { setSchedules(prev => [...prev, { ...row, filled: 0 }]); toast?.success?.(`One-time slot added for ${selectedDate}`); }
                        else     { toast?.error?.('Could not add slot. Check your database connection.'); }
                      }}
                    >
                      <Plus size={13} /> Add one-time slot
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="fcp-no-day">
              <CalendarDays size={28} strokeWidth={1.5} style={{ opacity: 0.25 }} />
              <span>Select a day to see details</span>
            </div>
          )}

          {/* Activity summary */}
          <div className="sc-section">
            <div className="sc-section-title">Activity</div>
            {loading ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.4rem 0' }}>Loading…</div>
            ) : (
              activityItems.map(({ label, key, dotColor, badgeBg, badgeColor, filter }) => (
                <button key={key} className="sc-activity-card" onClick={() => onTabChange('Requests', filter)}>
                  <div className="sc-activity-label">
                    <span className="sc-activity-dot" style={{ background: dotColor }} />
                    {label}
                  </div>
                  <span className="sc-count-badge" style={{ background: badgeBg, color: badgeColor }}>{counts[key]}</span>
                </button>
              ))
            )}
          </div>

        </div>
      </div>
    </div>

    {/* ══════════════════════════════════════
        WEEKLY HOURS MODAL
    ══════════════════════════════════════ */}
    {modal === 'weekly' && (
      <div className="fcp-modal-overlay" onClick={() => setModal(null)}>
        <div className="fcp-modal" onClick={e => e.stopPropagation()}>
          <div className="fcp-modal-header">
            <div>
              <p className="fcp-modal-title">Weekly Hours</p>
              <p className="fcp-modal-sub">Your recurring consultation schedule</p>
            </div>
            <button className="fcp-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
          </div>
          <hr className="fcp-modal-divider" style={{ margin: '1rem 0 0' }} />
          <div className="fcp-modal-body">
            {Object.keys(recurringByDay).length === 0 && !showAddForm ? (
              <div className="fcp-wh-empty">No recurring hours set yet.</div>
            ) : (
              Object.entries(recurringByDay).map(([day, slots]) =>
                slots.map((s, si) => (
                  <div key={s.id || si} className="fcp-wh-day-row">
                    <div style={{ flex: 1 }}>
                      <div className="fcp-wh-day-name">{day}</div>
                      <div className="fcp-wh-day-info">
                        {fmt12(s.start_time)} to {fmt12(s.end_time)}
                        {s.duration  ? ` · ${s.duration} min`      : ''}
                        {s.max_slots ? ` · ${s.max_slots} per slot` : ''}
                        {s.room      ? ` · ${s.room}`               : ' · Room TBA'}
                      </div>
                    </div>
                    <button className="fcp-wh-icon-btn danger" title="Delete" onClick={() => handleDeleteSchedule(s.id)}><Trash2 size={15} /></button>
                  </div>
                ))
              )
            )}
            {showAddForm && (
              <div className="fcp-wh-form">
                <div>
                  <label className="fcp-wh-label">Day</label>
                  <select className="fcp-wh-select" value={whForm.day} onChange={e => setWhForm(f => ({ ...f, day: e.target.value }))}>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="fcp-wh-form-row">
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">Start time</label>
                    <input className="fcp-wh-input" type="time" value={whForm.start_time} onChange={e => setWhForm(f => ({ ...f, start_time: e.target.value }))} />
                  </div>
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">End time</label>
                    <input className="fcp-wh-input" type="time" value={whForm.end_time} onChange={e => setWhForm(f => ({ ...f, end_time: e.target.value }))} />
                  </div>
                </div>
                <div className="fcp-wh-form-row">
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">Duration (min)</label>
                    <select className="fcp-wh-select" value={whForm.duration} onChange={e => setWhForm(f => ({ ...f, duration: e.target.value }))}>
                      {[15,20,30,45,60].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">Slots per time</label>
                    <input className="fcp-wh-input" type="number" min={1} max={20} value={whForm.max_slots} onChange={e => setWhForm(f => ({ ...f, max_slots: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="fcp-wh-label">Room (optional)</label>
                  <input className="fcp-wh-input" type="text" placeholder="e.g. Room 510" value={whForm.room} onChange={e => setWhForm(f => ({ ...f, room: e.target.value }))} />
                </div>
                <button className="fcp-wh-add-btn" onClick={handleAddHours} disabled={whSaving || !whForm.start_time || !whForm.end_time}>
                  {whSaving ? 'Saving…' : <><Plus size={13} /> Save hours</>}
                </button>
              </div>
            )}
            {!showAddForm && (
              <button className="fcp-wh-show-form-btn" onClick={() => setShowAddForm(true)}><Plus size={13} /> Add hours</button>
            )}
          </div>
          <div className="fcp-modal-footer">
            <button className="fcp-modal-btn-cancel" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      </div>
    )}

    {/* ══════════════════════════════════════
        BLOCK DATES MODAL
    ══════════════════════════════════════ */}
    {modal === 'block' && (
      <div className="fcp-modal-overlay" onClick={() => setModal(null)}>
        <div className="fcp-modal" onClick={e => e.stopPropagation()}>
          <div className="fcp-modal-header">
            <div>
              <p className="fcp-modal-title">Block dates</p>
              <p className="fcp-modal-sub">Students won't be able to book these dates.</p>
            </div>
            <button className="fcp-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
          </div>
          <hr className="fcp-modal-divider" style={{ margin: '1rem 0 0' }} />
          <div className="fcp-modal-body">
            <div className="fcp-bd-row">
              <div className="fcp-bd-field">
                <label className="fcp-bd-label">From</label>
                <input className="fcp-bd-input" type="date" value={bdFrom} onChange={e => { setBdFrom(e.target.value); if (e.target.value > bdTo) setBdTo(e.target.value); }} />
              </div>
              <div className="fcp-bd-field">
                <label className="fcp-bd-label">To</label>
                <input className="fcp-bd-input" type="date" value={bdTo} min={bdFrom} onChange={e => setBdTo(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="fcp-bd-label" style={{ marginTop: '0.85rem', display: 'block' }}>Reason (Optional)</label>
              <select className="fcp-bd-select" value={bdReason} onChange={e => setBdReason(e.target.value)}>
                <option value="">Select a reason</option>
                <option value="Out of office">Out of office</option>
                <option value="Holiday">Holiday</option>
                <option value="Personal">Personal</option>
                <option value="Conference / Event">Conference / Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {bdFrom && bdTo && (
              <div className={`fcp-bd-info${bdRequestsInRange.length > 0 ? ' warning' : ''}`}>
                {bdRequestsInRange.length > 0
                  ? `⚠ ${bdRequestsInRange.length} active booking${bdRequestsInRange.length > 1 ? 's' : ''} fall in this range.`
                  : 'No bookings fall in this range.'}
              </div>
            )}
          </div>
          <div className="fcp-modal-footer">
            <button className="fcp-modal-btn-cancel" onClick={() => setModal(null)}>Cancel</button>
            <button
              className="fcp-modal-btn-primary"
              disabled={bdSaving || !bdFrom || !bdTo}
              onClick={async () => {
                if (!user) return;
                setBdSaving(true);
                const row = await createBlockedDate({ faculty_id: user.id, from_date: bdFrom, to_date: bdTo, reason: bdReason || '' });
                setBdSaving(false);
                if (row) {
                  setBlockedDates(prev => [...prev, normBlock(row)]);
                  setModal(null); setBdReason('');
                  toast?.success?.(bdFrom === bdTo ? `${bdFrom} blocked` : `${bdFrom} to ${bdTo} blocked`);
                } else {
                  toast?.error?.('Could not save block. Check your database connection.');
                }
              }}
            >
              {bdSaving ? 'Blocking…' : 'Block dates'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══════════════════════════════════════
        ACTIVITY LOG MODAL
    ══════════════════════════════════════ */}
    {modal === 'activity' && (
      <div className="fcp-modal-overlay" onClick={() => setModal(null)}>
        <div className="fcp-modal" onClick={e => e.stopPropagation()}>
          <div className="fcp-modal-header">
            <div>
              <p className="fcp-modal-title">Activity log</p>
              <p className="fcp-modal-sub">Schedule and availability updates</p>
            </div>
            <button className="fcp-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
          </div>
          <hr className="fcp-modal-divider" style={{ margin: '1rem 0 0' }} />
          <div className="fcp-modal-body">
            {mockActivityLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>No activity recorded yet.</div>
            ) : (
              mockActivityLog.map(item => (
                <div key={item.id} className="fcp-al-item">
                  <p className="fcp-al-desc">{item.desc}</p>
                  <p className="fcp-al-time">{item.ts}</p>
                </div>
              ))
            )}
          </div>
          <div className="fcp-modal-footer">
            <button className="fcp-modal-btn-cancel" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default FacultyCalendarPage;
