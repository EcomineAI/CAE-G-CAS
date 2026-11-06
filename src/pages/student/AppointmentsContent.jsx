import React, { useState, useEffect } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { User, Archive, ClipboardList, Calendar, Clock, MapPin, ChevronRight, Star, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRequests, updateRequestDetails, updateRequestStatus, deleteRequest, getSchedulesForFaculty, submitRequest, isDateBlocked, checkActiveRequestForSlot, submitRating } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { withMinDelay, optimistic, toast } from '../../supabase/ux';
import { formatTimeRange } from '../../utils/dateUtils';

const CANCEL_REASONS = [
  'Schedule conflict',
  'Concern already resolved',
  'Book the wrong date or time',
  'Not feeling well/ Emergency',
];

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const STATUS_BAR = {
  Approved:  '#00c853',
  Pending:   '#ffab00',
  Declined:  '#ff1744',
  Cancelled: '#78909c',
  Completed: '#00b0ff',
};

const STATUS_BADGE = {
  Approved:  { bg: '#dcfce7', color: '#14532d' },
  Pending:   { bg: '#fef9c3', color: '#713f12' },
  Declined:  { bg: '#fee2e2', color: '#7f1d1d' },
  Cancelled: { bg: '#f1f5f9', color: '#334155' },
  Completed: { bg: '#e0f2fe', color: '#0c4a6e' },
};

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(3px)', padding: '1rem',
};
const PAD = { padding: '1.6rem 1.8rem' };

const STYLES = `
@keyframes apptShim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.appt-skel {
  background: linear-gradient(90deg,#eef0f6 25%,#dde1ec 50%,#eef0f6 75%);
  background-size: 200% 100%;
  animation: apptShim 1.4s ease-in-out infinite;
  border-radius: 6px;
  display: inline-block;
}

/* ── Card ── */
@keyframes acFadeIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
.ac-card {
  display: flex; align-items: stretch; gap: 0;
  background: #fff;
  border: 1.5px solid #e5e8f0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.15s, border-color 0.15s, transform 0.12s;
  animation: acFadeIn 0.22s ease;
}
.ac-card:hover { box-shadow: 0 4px 16px rgba(26,45,90,0.10); border-color: #c5d0f0; transform: translateY(-1px); }
.ac-card.selected { border-color: #1a2d5a; box-shadow: 0 4px 20px rgba(26,45,90,0.16); }
.ac-bar { width: 4px; flex-shrink: 0; border-radius: 0; }
.ac-body { flex: 1; padding: 0.85rem 1rem; min-width: 0; }
.ac-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.35rem; }
.ac-name { font-size: 0.92rem; font-weight: 700; color: #1a2d5a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ac-badge { font-size: 0.67rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.ac-meta { font-size: 0.76rem; color: #6b7280; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap; }
.ac-subject { font-size: 0.78rem; color: #374151; font-weight: 500; margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ac-chevron { display: flex; align-items: center; padding: 0 0.7rem; color: #c5d0f0; flex-shrink: 0; transition: color 0.15s; }
.ac-card.selected .ac-chevron { color: #1a2d5a; }
.ac-card:hover .ac-chevron { color: #1a2d5a; }

/* ── Group label ── */
.ac-group-label {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; color: #9ca3af;
  padding: 0.9rem 0 0.4rem;
}
.ac-group-label:first-child { padding-top: 0; }

/* ── Detail panel ── */
.ac-detail {
  background: #fff;
  border: 1.5px solid #e5e8f0;
  border-radius: 14px;
  padding: 1.4rem 1.5rem;
  box-shadow: 0 2px 12px rgba(26,45,90,0.07);
  animation: acFadeIn 0.2s ease;
}
.ac-detail-ref { font-size: 0.72rem; font-weight: 700; color: #9ca3af; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; }
.ac-detail-subject { font-size: 1.2rem; font-weight: 800; color: #1a2d5a; margin: 0 0 0.15rem; }
.ac-detail-faculty { font-size: 0.84rem; color: #6b7280; margin-bottom: 1rem; }
.ac-detail-info {
  background: #f0f6ff; border: 1px solid #c7dff7; border-radius: 10px;
  padding: 0.85rem 1rem; margin-bottom: 1rem;
  display: flex; flex-direction: column; gap: 0.5rem;
}
.ac-detail-info-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.83rem; color: #1f2937; font-weight: 500; }
.ac-detail-note {
  border-left: 3px solid #1a2d5a; background: #f0f6ff;
  border-radius: 0 8px 8px 0; padding: 0.65rem 0.9rem;
  font-size: 0.81rem; margin-bottom: 0.8rem; color: #1f2937;
}
.ac-detail-decline {
  border-left: 3px solid #ef4444; background: #fee2e2;
  border-radius: 0 8px 8px 0; padding: 0.65rem 0.9rem;
  font-size: 0.81rem; margin-bottom: 0.8rem; color: #b91c1c;
}
.ac-detail-hint { font-size: 0.76rem; color: #9ca3af; margin: 0 0 1rem; }
.ac-detail-actions { display: flex; flex-direction: column; gap: 0.5rem; }
.ac-action-btn {
  width: 100%; padding: 0.72rem; border-radius: 9px; font-family: inherit;
  font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: opacity 0.15s;
}
.ac-action-btn:hover { opacity: 0.88; }
.ac-empty-panel {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 300px; color: #a0aec0; text-align: center; gap: 0.7rem;
  background: #ffffff;
  border: 1.5px solid #e5e8f0;
  border-radius: 14px; padding: 2rem;
  box-shadow: 0 2px 12px rgba(26,45,90,0.07);
}

/* ── Filter chips ── */
.ac-filter-row { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.2rem; }

@keyframes acInlineFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
/* Responsive */
@media (max-width: 768px) {
  .ac-split { flex-direction: column !important; }
  .ac-list-col { flex: none !important; width: 100% !important; }
  .ac-detail-col { display: none !important; }
  .ac-inline-detail {
    display: block !important;
    animation: acInlineFade 0.18s ease;
  }

  /* Compact inline detail on mobile */
  .ac-inline-detail .ac-detail { padding: 0.75rem 0.9rem; border-radius: 10px; }
  .ac-inline-detail .ac-detail-ref { font-size: 0.62rem; margin-bottom: 0.28rem; }
  .ac-inline-detail .ac-detail-subject { font-size: 0.95rem; margin-bottom: 0.06rem; }
  .ac-inline-detail .ac-detail-faculty { font-size: 0.74rem; margin-bottom: 0.55rem; }
  .ac-inline-detail .ac-detail-info { padding: 0.5rem 0.7rem; gap: 0.28rem; margin-bottom: 0.55rem; border-radius: 8px; }
  .ac-inline-detail .ac-detail-info-row { font-size: 0.73rem; gap: 0.32rem; }
  .ac-inline-detail .ac-detail-hint { font-size: 0.67rem; margin-bottom: 0.55rem; }
  .ac-inline-detail .ac-detail-actions { gap: 0.3rem; }
  .ac-inline-detail .ac-action-btn { padding: 0.5rem; font-size: 0.76rem; border-radius: 8px; }
  .ac-inline-detail .ac-detail-note,
  .ac-inline-detail .ac-detail-decline { padding: 0.42rem 0.65rem; font-size: 0.72rem; margin-bottom: 0.45rem; }
}
.ac-inline-detail { display: none; margin-top: 4px; margin-bottom: 2px; }
@media (max-width: 430px) {
  .ac-chip { padding: 0.32rem 0.8rem; font-size: 0.75rem; }
  .ac-card { border-radius: 10px; }
  .ac-detail { border-radius: 12px; }
}
.ac-chip {
  padding: 0.38rem 1rem; border-radius: 50px; border: 1.5px solid #d1d5db;
  background: #fff; color: #374151; font-size: 0.81rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.ac-chip:hover { border-color: #1a2d5a; color: #1a2d5a; }
.ac-chip.active { background: #1a2d5a; border-color: #1a2d5a; color: #fff; }

/* ── Modal shared ── */
.appt-modal {
  background: #fff; border-radius: 16px; width: 93%; max-width: 480px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22); overflow: visible;
  animation: apptPopIn 0.17s ease;
}
@keyframes apptPopIn {
  from { opacity: 0; transform: scale(0.95) translateY(-8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.appt-dd-wrap { position: relative; margin-bottom: 1.4rem; z-index: 100; }
.appt-dd-menu {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0;
  background: #fff; border: 1.5px solid #e5e8f0;
  border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.13);
  z-index: 2000; overflow: hidden;
}
.appt-dd-item {
  width: 100%; padding: 0.7rem 1rem; text-align: left;
  background: none; border: none; border-bottom: 1px solid #f0f2f8;
  font-size: 0.85rem; font-family: inherit; color: #1f2937;
  cursor: pointer; transition: background 0.1s;
}
.appt-dd-item:last-child { border-bottom: none; }
.appt-dd-item:hover { background: #f0f7ff; }
.appt-dd-item.sel { font-weight: 700; color: #1a2d5a; }
.rs-date-strip { display: flex; gap: 0.4rem; overflow-x: auto; scrollbar-width: none; }
.rs-date-strip::-webkit-scrollbar { display: none; }
.rs-date-cell {
  flex: 1; min-width: 56px; display: flex; flex-direction: column;
  align-items: center; gap: 2px; padding: 0.55rem 0.3rem;
  border-radius: 10px; border: 1.5px solid #e5e8f0;
  background: #f0f2f8; cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.rs-date-cell:hover { border-color: #3d5fa8; background: #eef2fb; }
.rs-date-cell.sel { background: #1a2d5a; border-color: #1a2d5a; color: #fff; font-weight: 800; }
.rs-date-cell.sel * { font-weight: 800 !important; }
.rs-date-cell.nohours { opacity: 0.45; cursor: default; }
.rs-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
.rs-chip {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 0.45rem 0.8rem; border-radius: 9px;
  border: 1.5px solid #e5e8f0; background: #f0f2f8;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.rs-chip:hover:not([disabled]) { border-color: #3d5fa8; background: #eef2fb; }
.rs-chip.sel { background: #e0e8f7; border-color: #1a2d5a; }
.rs-chip.sel * { font-weight: 800 !important; color: #1a2d5a !important; }
.rs-chip[disabled] { opacity: 0.4; cursor: not-allowed; }
`;

const AppointmentsContent = ({ initialFilter = 'All', onResetFilter, focusAppointmentId = null, onFocusHandled }) => {
  const { user } = useAuth();
  const [listParent] = useAutoAnimate();
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  useEffect(() => { setActiveFilter(initialFilter); }, [initialFilter]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const [ratingModal, setRatingModal] = useState(null);
  const [ratingCriteria, setRatingCriteria] = useState({ preparedness: 0, communication: 0, helpfulness: 0, professionalism: 0 });
  const [ratingHover, setRatingHover] = useState({ preparedness: 0, communication: 0, helpfulness: 0, professionalism: 0 });
  const [ratingNotes, setRatingNotes] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDropOpen, setCancelDropOpen] = useState(false);
  const [reschedModal, setReschedModal] = useState(null);
  const [reschedSchedules, setReschedSchedules] = useState([]);
  const [reschedDateIdx, setReschedDateIdx] = useState(0);
  const [reschedSlotIdx, setReschedSlotIdx] = useState(null);
  const [reschedLoading, setReschedLoading] = useState(false);
  const [reschedBlockedDates, setReschedBlockedDates] = useState(new Set());
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const data = await withMinDelay(getStudentRequests(user.id), 300);
      setRequests(data);
      setLoading(false);
    };
    load();
    const unsub = subscribeToRequests(user.id, 'student', setRequests, () => getStudentRequests(user.id));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!focusAppointmentId || requests.length === 0) return;
    const target = requests.find(r => r.id === focusAppointmentId);
    if (target) {
      setActiveFilter(target.status === 'Completed' ? 'History' : 'All');
      setSelectedId(target.id);
      if (target.status === 'Completed' && !target.satisfactionRating) {
        openRating(target);
      }
      if (onFocusHandled) onFocusHandled();
    }
  }, [focusAppointmentId, requests]);


  const handleFilterClick = (f) => { setActiveFilter(f); setSelectedId(null); if (onResetFilter) onResetFilter(); };

  const getDividedTime = (app) =>
    app.startTime ? formatTimeRange(app.startTime, app.endTime) : (app.time || '—');

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const HISTORY_STATUSES = ['Completed','Declined','Cancelled'];
  const filteredData = requests.filter(app => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'History') return HISTORY_STATUSES.includes(app.status);
    return app.status === activeFilter;
  });

  // Group by date proximity
  const todayStr = new Date().toISOString().split('T')[0];

  const groups = activeFilter === 'History'
    ? [{ key: 'history', label: 'History', items: filteredData }].filter(g => g.items.length > 0)
    : [
        { key: 'upcoming', label: 'This Week & Upcoming', items: filteredData.filter(a => a.date >= todayStr) },
        { key: 'past',     label: 'Past',                 items: filteredData.filter(a => a.date < todayStr) },
      ].filter(g => g.items.length > 0);

  const selectedApp = requests.find(r => r.id === selectedId) || null;

  // ── Cancel ──
  const openCancel = (app) => { setCancelReason(''); setCancelDropOpen(false); setCancelModal({ app }); };
  const executeCancel = async () => {
    if (!cancelReason) { toast.error('Please select a reason.'); return; }
    const { app } = cancelModal; setCancelModal(null);
    await optimistic(setRequests, requests,
      requests.map(r => r.id === app.id ? { ...r, status: 'Cancelled' } : r),
      () => updateRequestStatus(app.id, 'Cancelled', cancelReason, null, null,
        { facultyId: app.avatarSeed, studentName: user?.displayName || 'A student', day: app.day, time: app.time }),
      { success: 'Appointment cancelled', error: 'Failed to cancel' });
    setSelectedId(null);
  };

  // ── Reschedule ──
  const openResched = async (app) => {
    setReschedDateIdx(0); setReschedSlotIdx(null); setReschedBlockedDates(new Set());
    setReschedLoading(true); setReschedModal({ app });
    const facultyId = app.faculty_id || app.avatarSeed;
    const [schedules] = await Promise.all([getSchedulesForFaculty(facultyId)]);
    setReschedSchedules(schedules);
    const today = new Date(); today.setHours(0,0,0,0);
    const dateStrings = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    });
    const blockChecks = await Promise.all(dateStrings.map(ds => isDateBlocked(facultyId, ds)));
    const blocked = new Set(dateStrings.filter((_, i) => blockChecks[i]));
    setReschedBlockedDates(blocked);
    setReschedLoading(false);
  };
  const buildReschedDates = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i);
      const dayName = DAY_NAMES[d.getDay()];
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const daySlots = reschedSchedules.filter(s => s.schedule_type !== 'one-time' && s.day === dayName);
      const oneTime  = reschedSchedules.filter(s => s.schedule_type === 'one-time' && s.specific_date === dateStr);
      const allSlots = [...daySlots, ...oneTime];
      const totalLeft = allSlots.reduce((sum, s) => sum + Math.max(0, s.max_slots - (s.filled || 0)), 0);
      const isBlocked = reschedBlockedDates.has(dateStr);
      return { d, dayName, dateStr, allSlots, totalLeft, hasSlots: allSlots.length > 0, isToday: i === 0, isBlocked };
    });
  };
  const executeResched = async () => {
    const cells = buildReschedDates();
    const cell = cells[reschedDateIdx];
    const slot = cell.allSlots[reschedSlotIdx];
    if (!slot) { toast.error('Please select a time slot.'); return; }
    const { app } = reschedModal;
    const targetDate = cell.dateStr;
    const block = await isDateBlocked(app.faculty_id || app.avatarSeed, targetDate);
    if (block) {
      toast.error(block.reason === 'Out of office'
        ? 'The faculty is out of office on that date.'
        : block.reason ? `That date is blocked (${block.reason}).` : 'That date is blocked.');
      return;
    }
    const slotTaken = await checkActiveRequestForSlot(user.id, slot.id);
    if (slotTaken) { toast.error('You already have an active request for that slot.'); return; }
    setReschedModal(null);
    const studentName = user?.user_metadata?.full_name || 'A student';
    await updateRequestStatus(app.id, 'Cancelled', 'Rescheduled by student', null, null,
      { facultyId: app.avatarSeed, studentName, day: app.day, time: app.time });
    const notifCtx = {
      facultyId: app.faculty_id || app.avatarSeed, studentId: user.id, studentName,
      day: slot.schedule_type === 'one-time'
        ? new Date(targetDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long' })
        : (slot.day || ''),
      time: slot.start_time && slot.end_time
        ? `${String(slot.start_time).slice(0,5)} - ${String(slot.end_time).slice(0,5)}` : '',
    };
    const result = await submitRequest({
      student_id: user.id, faculty_id: app.faculty_id || app.avatarSeed,
      schedule_id: slot.id, subject: app.subject, details: app.details,
      status: 'Pending', request_date: targetDate,
    }, notifCtx);
    if (result?.error === 'SLOT_FULL') { toast.error('Sorry, this slot was just taken by another student.'); }
    else if (result?.error) { toast.error('Failed to reschedule. Please try again.'); }
    else if (result?.data) { setRequests(prev => prev.map(r => r.id === app.id ? { ...r, status: 'Cancelled' } : r)); toast.success('Rescheduled! New request is pending.'); }
    setSelectedId(null);
  };

  const EVAL_CRITERIA = [
    { key: 'preparedness',    label: 'Preparedness',    desc: 'Faculty was prepared and knowledgeable about the subject matter' },
    { key: 'communication',   label: 'Communication',   desc: 'Faculty communicated clearly and listened actively' },
    { key: 'helpfulness',     label: 'Helpfulness',     desc: 'Faculty provided useful guidance and addressed your concern' },
    { key: 'professionalism', label: 'Professionalism', desc: 'Faculty was respectful, punctual, and professional' },
  ];
  const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  // ── Rating ──
  const openRating = (app) => {
    let initial = { preparedness: 0, communication: 0, helpfulness: 0, professionalism: 0 };
    if (app.feedbackNotes) {
      try {
        const parsed = JSON.parse(app.feedbackNotes);
        if (parsed && typeof parsed === 'object' && 'preparedness' in parsed) {
          initial = { preparedness: parsed.preparedness || 0, communication: parsed.communication || 0, helpfulness: parsed.helpfulness || 0, professionalism: parsed.professionalism || 0 };
          setRatingNotes(parsed.comments || '');
        } else { setRatingNotes(app.feedbackNotes || ''); }
      } catch { setRatingNotes(app.feedbackNotes || ''); }
    } else { setRatingNotes(''); }
    setRatingCriteria(initial);
    setRatingHover({ preparedness: 0, communication: 0, helpfulness: 0, professionalism: 0 });
    setRatingModal(app);
  };
  const executeRating = async () => {
    const allFilled = EVAL_CRITERIA.every(c => ratingCriteria[c.key] > 0);
    if (!allFilled) { toast.error('Please rate all criteria before submitting.'); return; }
    setRatingSubmitting(true);
    const app = ratingModal;
    const values = EVAL_CRITERIA.map(c => ratingCriteria[c.key]);
    const overall = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 2) / 2;
    const breakdown = JSON.stringify({ preparedness: ratingCriteria.preparedness, communication: ratingCriteria.communication, helpfulness: ratingCriteria.helpfulness, professionalism: ratingCriteria.professionalism, comments: ratingNotes || null, overall });
    const ok = await submitRating(app.id, Math.round(overall), breakdown);
    setRatingSubmitting(false);
    if (ok) {
      setRatingModal(null);
      setRequests(prev => prev.map(r => r.id === app.id ? { ...r, satisfactionRating: Math.round(overall), feedbackNotes: breakdown } : r));
      toast.success('Evaluation submitted. Thank you!');
    } else { toast.error('Failed to submit evaluation.'); }
  };

  // ── Archive ──
  const executeArchive = async () => {
    const app = deleteModal; setDeleteModal(null);
    await optimistic(setRequests, requests, requests.filter(r => r.id !== app.id),
      () => deleteRequest(app.id, 'student'), { success: 'Record archived', error: 'Failed to archive' });
    setSelectedId(null);
  };

  const dateCells = reschedModal ? buildReschedDates() : [];
  const selectedCell = dateCells[reschedDateIdx];

  const renderDetailPanel = (app) => {
    const idx = requests.findIndex(r => r.id === app.id);
    const ref = idx >= 0 ? `REF${String(idx + 1).padStart(4, '0')}` : '';
    const canCancel = ['Pending','Approved'].includes(app.status);
    const canResched = app.status === 'Pending';
    const isCompleted = app.status === 'Completed';
    const hasRated = isCompleted && app.satisfactionRating;
    return (
      <div className="ac-detail" key={app.id}>
        <div className="ac-detail-ref">{ref}</div>
        <p className="ac-detail-subject">{app.subject || 'Consultation'}</p>
        <p className="ac-detail-faculty">with {app.name || app.facultyName}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_BAR[app.status] || '#78909c', flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: STATUS_BAR[app.status] || '#78909c' }}>{app.status}</span>
        </div>
        <div className="ac-detail-info">
          <div className="ac-detail-info-row"><Calendar size={14} style={{ color: '#1a2d5a', flexShrink: 0 }} /><span>{formatDate(app.date)}</span></div>
          <div className="ac-detail-info-row"><Clock size={14} style={{ color: '#1a2d5a', flexShrink: 0 }} /><span>{getDividedTime(app)}</span></div>
          {app.room && <div className="ac-detail-info-row"><MapPin size={14} style={{ color: '#1a2d5a', flexShrink: 0 }} /><span>Room {app.room}</span></div>}
          {app.day  && <div className="ac-detail-info-row"><User size={14} style={{ color: '#1a2d5a', flexShrink: 0 }} /><span>{app.day}</span></div>}
        </div>
        {app.facultyNote && <div className="ac-detail-note"><strong>Faculty Note:</strong> "{app.facultyNote}"</div>}
        {app.status === 'Declined' && app.declineReason && <div className="ac-detail-decline"><strong>Decline Reason:</strong> "{app.declineReason}"</div>}
        {hasRated && (() => {
          let breakdown = null;
          if (app.feedbackNotes) {
            try { breakdown = JSON.parse(app.feedbackNotes); } catch {}
          }
          const criteriaKeys = [
            { key: 'preparedness',    label: 'Preparedness' },
            { key: 'communication',   label: 'Communication' },
            { key: 'helpfulness',     label: 'Helpfulness' },
            { key: 'professionalism', label: 'Professionalism' },
          ];
          return (
            <div style={{ marginBottom: '0.8rem', padding: '0.65rem 0.75rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: breakdown ? '0.6rem' : 0 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= app.satisfactionRating ? '#f59e0b' : 'none'} stroke={s <= app.satisfactionRating ? '#f59e0b' : '#d1d5db'} />)}
                <span style={{ fontSize: '0.76rem', color: '#78350f', fontWeight: 600, marginLeft: 4 }}>Overall {app.satisfactionRating}/5</span>
              </div>
              {breakdown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {criteriaKeys.map(c => breakdown[c.key] ? (
                    <div key={c.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.72rem', color: '#92400e' }}>{c.label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= breakdown[c.key] ? '#f59e0b' : 'none'} stroke={s <= breakdown[c.key] ? '#f59e0b' : '#d1d5db'} />)}
                        <span style={{ fontSize: '0.68rem', color: '#78350f', fontWeight: 600, minWidth: 18, textAlign: 'right' }}>{breakdown[c.key]}/5</span>
                      </div>
                    </div>
                  ) : null)}
                  {breakdown.comments && (
                    <p style={{ fontSize: '0.72rem', color: '#78350f', margin: '0.3rem 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>"{breakdown.comments}"</p>
                  )}
                </div>
              )}
            </div>
          );
        })()}
        <p className="ac-detail-hint">{canResched ? 'You can reschedule or cancel pending requests. Approved appointments can only be cancelled.' : isCompleted ? 'Session completed. Submit your faculty evaluation below.' : 'You can cancel this appointment at any time before it starts.'}</p>
        <div className="ac-detail-actions">
          {canCancel && <button className="ac-action-btn" onClick={() => openCancel(app)} style={{ border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#ef4444' }}>Cancel Request</button>}
          {canResched && <button className="ac-action-btn" onClick={() => openResched(app)} style={{ border: 'none', background: '#1a2d5a', color: '#fff' }}>Reschedule</button>}
          {isCompleted && (
            <button className="ac-action-btn" onClick={() => openRating(app)} style={{ border: hasRated ? '1.5px solid #86efac' : 'none', background: hasRated ? '#f0fdf4' : '#1a2d5a', color: hasRated ? '#15803d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <ClipboardCheck size={14} /> {hasRated ? 'View / Update Evaluation' : 'Evaluate Faculty'}
            </button>
          )}
          {['Completed','Cancelled','Declined'].includes(app.status) && (
            <button className="ac-action-btn" onClick={() => setDeleteModal(app)} style={{ border: '1.5px solid #e5e8f0', background: '#fff', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Archive size={14} /> Archive Record
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <style>{STYLES}</style>

      {/* Filter chips */}
      <div className="ac-filter-row">
        {[
          { key: 'All', label: 'All' },
          { key: 'Pending', label: 'Pending' },
          { key: 'Approved', label: 'Approved' },
          { key: 'History', label: 'History' },
        ].map(({ key, label }) => (
          <button key={key} className={`ac-chip${activeFilter === key ? ' active' : ''}`} onClick={() => handleFilterClick(key)}>{label}</button>
        ))}
      </div>

      {/* Split layout */}
      <div className="ac-split" style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>

        {/* ── LEFT: Card list ── */}
        <div className="ac-list-col" style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column' }}>
          {loading ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="ac-card" style={{ marginBottom: 8, opacity: 1 - i * 0.18, pointerEvents: 'none' }}>
                <div className="ac-bar" style={{ background: '#e5e8f0' }} />
                <div className="ac-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="ac-head">
                    <span className="appt-skel" style={{ height: 14, width: 140 }} />
                    <span className="appt-skel" style={{ height: 18, width: 64, borderRadius: 20 }} />
                  </div>
                  <span className="appt-skel" style={{ height: 11, width: '70%' }} />
                  <span className="appt-skel" style={{ height: 11, width: '50%' }} />
                </div>
              </div>
            ))
          ) : filteredData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#9ca3af', background: '#ffffff', borderRadius: 14, border: '1.5px solid #e5e8f0', boxShadow: '0 2px 12px rgba(26,45,90,0.07)' }}>
              <ClipboardList size={36} strokeWidth={1.5} style={{ marginBottom: '0.7rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.3rem' }}>No appointments found</p>
              <p style={{ fontSize: '0.84rem', margin: 0 }}>
                Your {activeFilter === 'All' ? '' : activeFilter.toLowerCase()} records will appear here.
              </p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.key}>
                <div className="ac-group-label">{group.label}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '0.5rem' }}>
                  {group.items.map((app, idx) => {
                    const bar = STATUS_BAR[app.status] || '#78909c';
                    const bdg = STATUS_BADGE[app.status] || STATUS_BADGE.Cancelled;
                    const isSelected = selectedId === app.id;
                    return (
                      <React.Fragment key={app.id}>
                        <div
                          id={`ac-card-${app.id}`}
                          className={`ac-card${isSelected ? ' selected' : ''}`}
                          onClick={() => setSelectedId(isSelected ? null : app.id)}
                        >
                          <div className="ac-bar" style={{ background: bar }} />
                          <div className="ac-body">
                            <div className="ac-head">
                              <span className="ac-name">{app.name?.split('(')[0]?.trim() || '—'}</span>
                              <span className="ac-badge" style={{ background: bdg.bg, color: bdg.color }}>{app.status}</span>
                            </div>
                            <div className="ac-meta">
                              <Calendar size={11} />
                              <span>{formatDate(app.date)}</span>
                              <Clock size={11} style={{ marginLeft: 2 }} />
                              <span>{getDividedTime(app)}</span>
                            </div>
                            {app.subject && <div className="ac-subject">{app.subject}</div>}
                            {app.status === 'Completed' && app.satisfactionRating ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= app.satisfactionRating ? '#f59e0b' : 'none'} stroke={s <= app.satisfactionRating ? '#f59e0b' : '#d1d5db'} />)}
                                <span style={{ fontSize: '0.68rem', color: '#92400e', fontWeight: 600 }}>{app.satisfactionRating}/5</span>
                              </div>
                            ) : app.status === 'Completed' ? (
                              <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 600, marginTop: '0.25rem' }}>Pending evaluation</div>
                            ) : null}
                          </div>
                          <div className="ac-chevron"><ChevronRight size={16} /></div>
                        </div>
                        {isSelected && (
                          <div className="ac-inline-detail">
                            {renderDetailPanel(app)}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── RIGHT: Detail panel (desktop only) ── */}
        <div className="ac-detail-col" style={{ flex: 1, position: 'sticky', top: '1rem' }}>
          {!selectedApp ? (
            <div className="ac-empty-panel">
              <ClipboardList size={36} strokeWidth={1.3} />
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600 }}>Select an appointment</p>
              <p style={{ margin: 0, fontSize: '0.78rem' }}>Tap any card on the left to see the details here.</p>
            </div>
          ) : renderDetailPanel(selectedApp)}
        </div>
      </div>

      {/* ── Faculty Evaluation Modal ── */}
      {ratingModal && (
        <div style={OVERLAY} onClick={() => setRatingModal(null)}>
          <div className="appt-modal" style={{ width: 'clamp(300px, 70vw, 450px)', height: 'clamp(400px, 80vh, 85vh)', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={PAD}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                <ClipboardCheck size={20} style={{ color: '#1a2d5a', flexShrink: 0 }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Faculty Evaluation</h2>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                Evaluate your consultation with <strong style={{ color: '#1a2d5a' }}>{ratingModal.name || ratingModal.facultyName}</strong> on {(() => { const d = ratingModal.date; if (!d) return '—'; const [y,mo,dy] = d.split('-').map(Number); return new Date(y, mo-1, dy).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); })()}.
              </p>

              {/* Rating scale legend */}
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: 4 }}>{n}</span>
                    <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{RATING_LABELS[n]}</span>
                    {n < 5 && <span style={{ color: '#e5e7eb', marginLeft: '0.15rem' }}>·</span>}
                  </div>
                ))}
              </div>

              {/* Criteria rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.2rem' }}>
                {EVAL_CRITERIA.map(criterion => {
                  const val = ratingCriteria[criterion.key];
                  const hov = ratingHover[criterion.key];
                  const active = hov || val;
                  return (
                    <div key={criterion.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1f2937' }}>{criterion.label}</div>
                          <div style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4 }}>{criterion.desc}</div>
                        </div>
                        {val > 0 && (
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1a2d5a', whiteSpace: 'nowrap', marginLeft: '0.5rem', marginTop: '0.1rem' }}>
                            {RATING_LABELS[val]}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {[1,2,3,4,5].map(s => (
                          <button key={s} type="button"
                            onMouseEnter={() => setRatingHover(prev => ({ ...prev, [criterion.key]: s }))}
                            onMouseLeave={() => setRatingHover(prev => ({ ...prev, [criterion.key]: 0 }))}
                            onClick={() => setRatingCriteria(prev => ({ ...prev, [criterion.key]: s }))}
                            style={{ flex: 1, padding: '0.5rem 0', border: active === s ? '1.5px solid #f59e0b' : '1.5px solid #e5e8f0', borderRadius: 7, background: active === s ? '#fffbeb' : '#f8fafc', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 800, color: active === s ? '#92400e' : '#94a3b8', transition: 'all 0.1s' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall preview */}
              {EVAL_CRITERIA.every(c => ratingCriteria[c.key] > 0) && (() => {
                const avg = EVAL_CRITERIA.reduce((s, c) => s + ratingCriteria[c.key], 0) / EVAL_CRITERIA.length;
                const overall = Math.round(avg * 2) / 2;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.65rem 0.9rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 9, marginBottom: '1.1rem' }}>
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= overall ? '#f59e0b' : 'none'} stroke={s <= overall ? '#f59e0b' : '#d1d5db'} />)}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0369a1' }}>Overall: {overall}/5 — {RATING_LABELS[Math.round(overall)]}</span>
                  </div>
                );
              })()}

              {/* Comments */}
              <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.4rem' }}>Additional Comments (optional)</div>
              <textarea
                value={ratingNotes}
                onChange={e => setRatingNotes(e.target.value)}
                placeholder="Any additional comments about the consultation..."
                rows={3}
                style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: 9, border: '1.5px solid #e5e8f0', fontFamily: 'inherit', fontSize: '0.84rem', resize: 'none', boxSizing: 'border-box', marginBottom: '1.2rem', outline: 'none', color: '#1f2937' }}
              />

              {/* Footer */}
              <div style={{ display: 'flex', gap: '0.7rem' }}>
                <button onClick={() => setRatingModal(null)} disabled={ratingSubmitting} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: '1.5px solid #e5e8f0', background: '#fff', color: '#1f2937', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={executeRating} disabled={ratingSubmitting} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: 'none', background: '#1a2d5a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', opacity: ratingSubmitting ? 0.6 : 1 }}>{ratingSubmitting ? 'Submitting…' : 'Submit Evaluation'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {cancelModal && (() => {
        const { app } = cancelModal;
        return (
          <div style={OVERLAY} onClick={() => setCancelModal(null)}>
            <div className="appt-modal" style={{ width: 'clamp(300px, 70vw, 450px)', height: 'clamp(300px, 70vh, 80vh)' }} onClick={e => e.stopPropagation()}>
              <div style={PAD}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.8rem 0' }}>Cancel this request?</h2>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  You are about to cancel <strong style={{ color: '#1f2937' }}>{app.subject}</strong> with{' '}
                  <strong style={{ color: '#1a2d5a' }}>{app.name || app.facultyName}</strong> on {formatDate(app.date)}, {getDividedTime(app)}.
                </p>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Reason for cancelling</div>
                <div className="appt-dd-wrap">
                  <button type="button" onClick={() => setCancelDropOpen(v => !v)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e5e8f0', background: '#fff', color: cancelReason ? '#1f2937' : '#9ca3af', fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                    <span>{cancelReason || 'Select a reason'}</span><span>▾</span>
                  </button>
                  {cancelDropOpen && (
                    <div className="appt-dd-menu">
                      {CANCEL_REASONS.map(r => (
                        <button key={r} type="button" className={`appt-dd-item${cancelReason === r ? ' sel' : ''}`}
                          onClick={() => { setCancelReason(r); setCancelDropOpen(false); }}>{r}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.7rem' }}>
                  <button onClick={() => setCancelModal(null)} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: '1.5px solid #e5e8f0', background: '#fff', color: '#1f2937', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Keep appointment</button>
                  <button onClick={executeCancel} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Yes, cancel it</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Reschedule Modal ── */}
      {reschedModal && (() => {
        const { app } = reschedModal;
        return (
          <div style={OVERLAY} onClick={() => setReschedModal(null)}>
            <div className="appt-modal" style={{ width: 'clamp(300px, 70vw, 450px)', height: 'clamp(400px, 80vh, 90vh)' }} onClick={e => e.stopPropagation()}>
              <div style={PAD}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.6rem 0' }}>Re-schedule appointment</h2>
                <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '1.1rem', lineHeight: 1.5 }}>
                  Pick a new date and time for <strong style={{ color: '#1a2d5a' }}>{app.subject}</strong>. The request goes back to pending until {app.name || app.facultyName} approves it.
                </p>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Select Date</div>
                {reschedLoading ? (
                  <div style={{ fontSize: '0.83rem', color: '#9ca3af', padding: '0.5rem 0' }}>Loading schedules…</div>
                ) : (
                  <>
                    <div className="rs-date-strip">
                      {dateCells.map((cell, i) => {
                        const unavailable = !cell.hasSlots || cell.isBlocked;
                        const sub = cell.isBlocked ? 'Blocked' : !cell.hasSlots ? 'No Hours' : cell.totalLeft === 0 ? 'Full' : `${cell.totalLeft} Left`;
                        return (
                          <button key={i} className={`rs-date-cell${i === reschedDateIdx ? ' sel' : ''}${unavailable ? ' nohours' : ''}`}
                            onClick={() => { if (!unavailable) { setReschedDateIdx(i); setReschedSlotIdx(null); } }}>
                            <span style={{ fontSize: '0.58rem', fontWeight: 600, opacity: 0.75 }}>{cell.isToday ? 'Today' : cell.dayName.slice(0,3)}</span>
                            <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>{cell.d.getDate()}</span>
                            <span style={{ fontSize: '0.56rem', fontWeight: 700, opacity: 0.75 }}>{sub}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedCell && selectedCell.allSlots.length > 0 && (
                      <>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9ca3af', margin: '1rem 0 0.5rem' }}>Select Time Slot</div>
                        <div className="rs-chips">
                          {selectedCell.allSlots.map((slot, i) => {
                            const isFull = (slot.filled || 0) >= slot.max_slots;
                            return (
                              <button key={i} type="button" className={`rs-chip${reschedSlotIdx === i ? ' sel' : ''}`}
                                disabled={isFull} onClick={() => !isFull && setReschedSlotIdx(i)}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937' }}>{formatTimeRange(slot.start_time, slot.end_time)}</span>
                                {slot.room && <span style={{ fontSize: '0.67rem', color: '#9ca3af' }}>Rm. {slot.room}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </>
                )}
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0.8rem 0 1.1rem' }}>You can reschedule or cancel as long as it has not started yet.</p>
                <div style={{ display: 'flex', gap: '0.7rem' }}>
                  <button onClick={executeResched} disabled={reschedSlotIdx === null}
                    style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: 'none', background: '#1a2d5a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: reschedSlotIdx === null ? 'not-allowed' : 'pointer', opacity: reschedSlotIdx === null ? 0.5 : 1, fontFamily: 'inherit' }}>
                    Confirm new schedule
                  </button>
                  <button onClick={() => setReschedModal(null)}
                    style={{ padding: '0.72rem 1.2rem', borderRadius: 9, border: '1.5px solid #e5e8f0', background: '#fff', color: '#6b7280', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Archive Modal ── */}
      {deleteModal && (
        <div style={OVERLAY} onClick={() => setDeleteModal(null)}>
          <div className="appt-modal" style={{ width: 'clamp(300px, 70vw, 450px)', height: 'clamp(250px, 60vh, 75vh)' }} onClick={e => e.stopPropagation()}>
            <div style={PAD}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.8rem' }}>
                <Archive size={22} style={{ color: '#1a2d5a' }} />
                <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1f2937' }}>Archive Record?</h2>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.4rem' }}>This will hide the record from your list but keep it in your history.</p>
              <div style={{ display: 'flex', gap: '0.7rem' }}>
                <button onClick={() => setDeleteModal(null)} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: '1.5px solid #e5e8f0', background: '#fff', color: '#1f2937', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>No, Keep it</button>
                <button onClick={executeArchive} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: 'none', background: '#1a2d5a', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem' }}>Yes, Archive</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsContent;
