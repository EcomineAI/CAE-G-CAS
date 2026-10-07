import React, { useState, useEffect } from 'react';
import { User, Archive, ClipboardList, Calendar, Clock, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRequests, updateRequestDetails, updateRequestStatus, deleteRequest, getSchedulesForFaculty, submitRequest } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { withMinDelay, optimistic, toast } from '../../supabase/ux';
import { calculateStudentSlot, formatTimeRange } from '../../utils/dateUtils';

const CANCEL_REASONS = [
  'Schedule conflict',
  'Concern already resolved',
  'Book the wrong date or time',
  'Not feeling well/ Emergency',
];

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const BADGE = {
  approved:  { background: '#00c853', color: '#fff' },
  pending:   { background: '#ffab00', color: '#fff' },
  declined:  { background: '#ff1744', color: '#fff' },
  cancelled: { background: '#78909c', color: '#fff' },
  completed: { background: '#00b0ff', color: '#fff' },
};

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1000, backdropFilter: 'blur(3px)', padding: '1rem',
};
const PAD = { padding: '1.6rem 1.8rem' };

const STYLES = `
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
.rs-date-cell:hover { border-color: #5bc8c8; }
.rs-date-cell.sel { background: #5bc8c8; border-color: #5bc8c8; color: #fff; }
.rs-date-cell.nohours { opacity: 0.45; cursor: default; }
.rs-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
.rs-chip {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 0.45rem 0.8rem; border-radius: 9px;
  border: 1.5px solid #e5e8f0; background: #f0f2f8;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.rs-chip:hover:not([disabled]) { border-color: #5bc8c8; }
.rs-chip.sel { background: #e0f7f7; border-color: #5bc8c8; }
.rs-chip[disabled] { opacity: 0.4; cursor: not-allowed; }
`;

const AppointmentsContent = ({ initialFilter = 'All', onResetFilter }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [detailModal, setDetailModal] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDropOpen, setCancelDropOpen] = useState(false);
  const [reschedModal, setReschedModal] = useState(null);
  const [reschedSchedules, setReschedSchedules] = useState([]);
  const [reschedDateIdx, setReschedDateIdx] = useState(0);
  const [reschedSlotIdx, setReschedSlotIdx] = useState(null);
  const [reschedLoading, setReschedLoading] = useState(false);
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

  const handleFilterClick = (f) => { setActiveFilter(f); if (onResetFilter) onResetFilter(); };

  const getDividedTime = (app) => {
    if (app.status !== 'Approved') return app.startTime ? formatTimeRange(app.startTime, app.endTime) : app.time;
    const slotReqs = requests
      .filter(r => r.schedule_id === app.schedule_id && r.date === app.date && r.status === 'Approved')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const idx = slotReqs.findIndex(r => r.id === app.id);
    if (idx === -1) return app.startTime ? formatTimeRange(app.startTime, app.endTime) : app.time;
    const timeStr = app.startTime ? formatTimeRange(app.startTime, app.endTime) : app.time;
    const [start, end] = timeStr.split(' - ');
    return calculateStudentSlot(start, end, app.max_slots || 5, idx);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const filteredData = requests.filter(app => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Declined') return ['Declined','Cancelled'].includes(app.status);
    return app.status === activeFilter;
  });

  const badge = (status) => ({
    ...(BADGE[(status||'').toLowerCase()] || BADGE.cancelled),
    display: 'inline-block', padding: '0.28rem 0.85rem',
    borderRadius: 6, fontSize: '0.76rem', fontWeight: 700,
    textAlign: 'center', whiteSpace: 'nowrap', minWidth: 82,
  });

  // ── Cancel ──
  const openCancel = (app, refId) => {
    setDetailModal(null); setCancelReason(''); setCancelDropOpen(false);
    setCancelModal({ app, refId });
  };
  const executeCancel = async () => {
    if (!cancelReason) { toast.error('Please select a reason.'); return; }
    const { app } = cancelModal;
    setCancelModal(null);
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === app.id ? { ...r, status: 'Cancelled' } : r),
      () => updateRequestStatus(app.id, 'Cancelled', cancelReason, null, null,
        { facultyId: app.avatarSeed, studentName: user?.user_metadata?.full_name || 'A student', day: app.day, time: app.time }),
      { success: 'Appointment cancelled', error: 'Failed to cancel' }
    );
  };

  // ── Reschedule ──
  const openResched = async (app, refId) => {
    setDetailModal(null); setReschedDateIdx(0); setReschedSlotIdx(null);
    setReschedLoading(true); setReschedModal({ app, refId });
    const schedules = await getSchedulesForFaculty(app.faculty_id || app.avatarSeed);
    setReschedSchedules(schedules); setReschedLoading(false);
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
      return { d, dayName, dateStr, allSlots, totalLeft, hasSlots: allSlots.length > 0, isToday: i === 0 };
    });
  };
  const executeResched = async () => {
    const cells = buildReschedDates();
    const slot = cells[reschedDateIdx].allSlots[reschedSlotIdx];
    if (!slot) { toast.error('Please select a time slot.'); return; }
    const { app } = reschedModal;
    setReschedModal(null);
    await updateRequestStatus(app.id, 'Cancelled', 'Rescheduled by student');
    const result = await submitRequest({
      student_id: user.id, faculty_id: app.faculty_id || app.avatarSeed,
      schedule_id: slot.id, subject: app.subject, details: app.details,
      status: 'Pending', request_date: new Date().toISOString().split('T')[0],
    }, null);
    if (result) {
      setRequests(prev => prev.map(r => r.id === app.id ? { ...r, status: 'Cancelled' } : r));
      toast.success('Rescheduled! New request is pending approval.');
    } else { toast.error('Failed to reschedule. Please try again.'); }
  };

  // ── Archive ──
  const executeArchive = async () => {
    const app = deleteModal; setDeleteModal(null);
    await optimistic(setRequests, requests, requests.filter(r => r.id !== app.id),
      () => deleteRequest(app.id, 'student'), { success: 'Record archived', error: 'Failed to archive' });
  };

  const dateCells = reschedModal ? buildReschedDates() : [];
  const selectedCell = dateCells[reschedDateIdx];

  // columns: fixed px widths so header & data always align
  const COL = '1fr 1.3fr 1.4fr 1.2fr 1fr 1.4fr';

  const rowStyle = (isHeader, isLast) => ({
    display: 'grid',
    gridTemplateColumns: COL,
    background: isHeader ? '#1a3a8f' : '#eef2fb',
    borderBottom: isHeader ? 'none' : isLast ? 'none' : '1.5px solid #cdd6f0',
  });

  const cellStyle = (isHeader, addBorder) => ({
    padding: '0.88rem 1rem',
    display: 'flex', alignItems: 'center',
    fontSize: isHeader ? '0.74rem' : '0.84rem',
    fontWeight: isHeader ? 700 : 600,
    color: isHeader ? '#fff' : '#1a2d5a',
    letterSpacing: isHeader ? '0.04em' : 'normal',
    textTransform: isHeader ? 'uppercase' : 'none',
    borderRight: addBorder ? (isHeader ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cdd6f0') : 'none',
    minWidth: 0,
    overflow: 'visible',
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <style>{STYLES}</style>

      {/* Subtitle */}
      <div style={{ background: '#fff', border: '1px solid #e5e8f0', borderRadius: 10, padding: '0.7rem 1.1rem', marginBottom: '1rem', fontSize: '0.83rem', color: '#6b7280', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        View real-time availability and appointments
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', marginBottom: '1.2rem', border: '1.5px solid #cdd6f0', borderRadius: 8, overflow: 'hidden', width: 'fit-content', background: '#eef2fb' }}>
        {['All','Pending','Approved','Completed','Declined'].map((f, i, arr) => (
          <button key={f} onClick={() => handleFilterClick(f)} style={{
            padding: '0.45rem 1.2rem', fontFamily: 'inherit',
            border: 'none',
            borderRight: i < arr.length - 1 ? '1.5px solid #cdd6f0' : 'none',
            background: activeFilter === f ? '#1a3a8f' : 'transparent',
            color: activeFilter === f ? '#fff' : '#1a3a8f',
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            transition: 'all 0.15s',
          }}>{f}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1.5px solid #cdd6f0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 10px rgba(26,58,143,0.08)', background: '#eef2fb' }}>

        {/* Header */}
        <div style={rowStyle(true, false)}>
          {['Reference ID','Date & Time','Faculty Member','Topic','Status','Actions'].map((col, i, arr) => (
            <div key={col} style={cellStyle(true, i < arr.length - 1)}>{col}</div>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div style={{ padding: '2rem', color: '#9ca3af', fontSize: '0.85rem' }}>Loading…</div>
        ) : filteredData.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
            <ClipboardList size={40} strokeWidth={1.5} />
            <p style={{ fontWeight: 600, color: '#374151', fontSize: '1rem', marginTop: '0.8rem', marginBottom: 0 }}>No appointments found</p>
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.88rem' }}>Your {activeFilter === 'All' ? '' : activeFilter.toLowerCase()} records will appear here.</p>
          </div>
        ) : filteredData.map((app, idx) => {
          const isLast = idx === filteredData.length - 1;
          const refId = `REF${String(idx + 1).padStart(4, '0')}`;
          return (
            <div key={app.id} style={rowStyle(false, isLast)}>
              {/* REF ID */}
              <div style={cellStyle(false, true)}>
                <span style={{ fontWeight: 700, color: '#1a2d5a' }}>{refId}</span>
              </div>
              {/* Date & Time */}
              <div style={{ ...cellStyle(false, true), flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 2 }}>
                <span style={{ fontWeight: 600, fontSize: '0.83rem' }}>{formatDate(app.date)}</span>
                <span style={{ fontSize: '0.76rem', color: '#6b7280' }}>{getDividedTime(app)}</span>
              </div>
              {/* Faculty */}
              <div style={cellStyle(false, true)}>
                <User size={14} style={{ color: '#6b7280', flexShrink: 0, marginRight: 6 }} />
                <span style={{ fontWeight: 500 }}>{app.name || app.facultyName}</span>
              </div>
              {/* Topic */}
              <div style={{ ...cellStyle(false, true), color: '#374151' }}>{app.subject || '—'}</div>
              {/* Status */}
              <div style={cellStyle(false, true)}>
                <span style={badge(app.status)}>{app.status}</span>
              </div>
              {/* Actions */}
              <div style={{ ...cellStyle(false, false), gap: '0.5rem' }}>
                <button onClick={() => setDetailModal({ app, refId })}
                  style={{ padding: '0.36rem 0.8rem', borderRadius: 6, border: 'none', background: '#1e3a8a', color: '#fff', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                  View Details
                </button>
                {['Completed','Cancelled','Declined'].includes(app.status) && (
                  <button onClick={() => setDeleteModal(app)} title="Archive"
                    style={{ padding: '0.32rem 0.45rem', borderRadius: 6, border: '1.5px solid #e5e8f0', background: 'transparent', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <Archive size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Detail Modal ── */}
      {detailModal && (() => {
        const { app, refId } = detailModal;
        const timeStr = getDividedTime(app);
        const canAct = ['Pending','Approved'].includes(app.status);
        return (
          <div style={OVERLAY} onClick={() => setDetailModal(null)}>
            <div className="appt-modal" onClick={e => e.stopPropagation()}>
              <div style={PAD}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.3rem' }}>{refId}</div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.8rem 0' }}>Appointment Details</h2>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.2rem' }}>{app.subject || 'Consultation'}</div>
                    <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>with {app.name || app.facultyName}</div>
                  </div>
                  <span style={{ ...badge(app.status), flexShrink: 0, marginTop: 2 }}>{app.status}</span>
                </div>
                <div style={{ background: '#f0f7ff', border: '1px solid #c7dff7', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1f2937', fontWeight: 500 }}>
                    <Calendar size={15} style={{ color: '#1a2d5a', flexShrink: 0 }} />
                    <span>{formatDate(app.date)}</span>
                    <Clock size={15} style={{ color: '#1a2d5a', flexShrink: 0, marginLeft: '0.8rem' }} />
                    <span>{timeStr}</span>
                  </div>
                  {app.room && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1f2937', fontWeight: 500 }}>
                      <MapPin size={15} style={{ color: '#1a2d5a', flexShrink: 0 }} />
                      <span>Room {app.room}</span>
                    </div>
                  )}
                </div>
                {app.faculty_note && (
                  <div style={{ background: '#f0f7ff', border: '1px solid #c7dff7', borderLeft: '3px solid #1a2d5a', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
                    <strong>Faculty Note:</strong> "{app.faculty_note}"
                  </div>
                )}
                {app.status === 'Declined' && app.declineReason && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderLeft: '3px solid #ef4444', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.82rem', marginBottom: '0.8rem', color: '#b91c1c' }}>
                    <strong>Decline Reason:</strong> "{app.declineReason}"
                  </div>
                )}
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.2rem' }}>You can reschedule or cancel as long as it has not started yet.</p>
                <div style={{ display: 'flex', gap: '0.7rem' }}>
                  {canAct && <button onClick={() => openCancel(app, refId)} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel Request</button>}
                  {canAct && <button onClick={() => openResched(app, refId)} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: '1.5px solid #e5e8f0', background: '#fff', color: '#1f2937', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Reschedule</button>}
                  <button onClick={() => setDetailModal(null)} style={{ flex: 1, padding: '0.72rem', borderRadius: 9, border: 'none', background: '#1a2d5a', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Cancel Modal ── */}
      {cancelModal && (() => {
        const { app, refId } = cancelModal;
        return (
          <div style={OVERLAY} onClick={() => setCancelModal(null)}>
            <div className="appt-modal" onClick={e => e.stopPropagation()}>
              <div style={PAD}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.4rem' }}>{refId}</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.8rem 0' }}>Cancel this request?</h2>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                  You are about to cancel <strong style={{ color: '#1f2937' }}>{app.subject}</strong> with{' '}
                  <strong style={{ color: '#1a2d5a' }}>{app.name || app.facultyName}</strong> on {formatDate(app.date)}, {getDividedTime(app)}.
                </p>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Reason for cancelling</div>
                <div className="appt-dd-wrap">
                  <button type="button" onClick={() => setCancelDropOpen(v => !v)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderRadius: 10, border: '1.5px solid #e5e8f0', background: '#fff', color: cancelReason ? '#1f2937' : '#9ca3af', fontSize: '0.85rem', fontFamily: 'inherit', cursor: 'pointer' }}>
                    <span>{cancelReason || 'Select a reason'}</span>
                    <span>▾</span>
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
        const { app, refId } = reschedModal;
        return (
          <div style={OVERLAY} onClick={() => setReschedModal(null)}>
            <div className="appt-modal" onClick={e => e.stopPropagation()}>
              <div style={PAD}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.3rem' }}>{refId}</div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.6rem 0' }}>Re-schedule appointment</h2>
                <p style={{ fontSize: '0.83rem', color: '#6b7280', marginBottom: '1.1rem', lineHeight: 1.5 }}>
                  Pick a new date and time for <strong style={{ color: '#1a2d5a', textDecoration: 'underline', textUnderlineOffset: 2 }}>{app.subject}</strong>. The request goes back to pending until {app.name || app.facultyName} approves it.
                </p>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '0.5rem' }}>Select Date</div>
                {reschedLoading ? (
                  <div style={{ fontSize: '0.83rem', color: '#9ca3af', padding: '0.5rem 0' }}>Loading schedules…</div>
                ) : (
                  <>
                    <div className="rs-date-strip">
                      {dateCells.map((cell, i) => {
                        const sub = !cell.hasSlots ? 'No Hours' : cell.totalLeft === 0 ? 'Full' : `${cell.totalLeft} Left`;
                        return (
                          <button key={i} className={`rs-date-cell${i === reschedDateIdx ? ' sel' : ''}${!cell.hasSlots ? ' nohours' : ''}`}
                            onClick={() => { setReschedDateIdx(i); setReschedSlotIdx(null); }}>
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
          <div className="appt-modal" onClick={e => e.stopPropagation()}>
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
