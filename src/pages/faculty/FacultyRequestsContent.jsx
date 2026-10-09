import React, { useState, useEffect } from 'react';
import { Check, X, Search, Archive, Eye, Clock, Inbox, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { AppointmentDetailsModal } from '../shared';
import { getFacultyRequests, updateRequestStatus, deleteRequest } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { RequestCardSkeleton, optimistic, withMinDelay, toast } from '../../supabase/ux';
import { calculateStudentSlot, buildGcalUrl } from '../../utils/dateUtils';
import { getToken, createCalendarEvent } from '../../utils/googleCalendar';

const requestStyles = `
.frc-wrap { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

.frc-page-title { font-size: 1.55rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
.frc-page-sub { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 1.3rem; }

/* Filter + search row */
.frc-toolbar {
  display: flex; align-items: center; gap: 0.75rem;
  margin-bottom: 1rem; flex-wrap: wrap;
}
.frc-chips { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.frc-chip {
  padding: 0.35rem 1rem; border-radius: 50px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff);
  color: var(--text-secondary); font-size: 0.82rem; font-weight: 700;
  cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap;
}
.frc-chip:hover { border-color: #3d5fa8; background: #eef2fb; color: #1a2d5a; }
.frc-chip.active { background: #1a2d5a; color: #fff; border-color: #1a2d5a; font-weight: 800; }

.frc-search {
  margin-left: auto; position: relative; min-width: 240px; flex: 1; max-width: 380px;
}
.frc-search-icon {
  position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); pointer-events: none;
}
.frc-search input {
  width: 100%; padding: 0.55rem 1rem 0.55rem 2.5rem;
  border: 1.5px solid var(--border-color, #d1d5db);
  border-radius: 10px; background: var(--card-bg, #fff);
  color: var(--text-primary); font-size: 0.88rem; font-family: inherit;
  outline: none; transition: border-color 0.15s; box-sizing: border-box;
}
.frc-search input:focus { border-color: #1a2d5a; }

/* List card wrapper */
.frc-list-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--card-shadow, 0 1px 6px rgba(0,0,0,0.05));
}

/* Individual request row */
.frc-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.9rem 1.3rem;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
  transition: background 0.12s;
}
.frc-row:last-child { border-bottom: none; }
.frc-row:hover { background: var(--bg-primary, #f0f2f8); }
.frc-row-highlight {
  background: #eef2fb !important;
  box-shadow: inset 4px 0 0 #1a2d5a;
  animation: frcFlash 2.4s ease-out;
}
@keyframes frcFlash {
  0%, 15%  { background: #d9e2f5 !important; }
  100%     { background: #eef2fb !important; }
}

/* Avatar */
.frc-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #e5e7eb; flex-shrink: 0; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted); font-weight: 700; font-size: 1rem;
}
.frc-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* Info block */
.frc-info { flex: 1; min-width: 0; }
.frc-name-row {
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.15rem;
}
.frc-name {
  font-size: 0.92rem; font-weight: 700; color: var(--text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.frc-section-badge {
  font-size: 0.68rem; font-weight: 700; padding: 1px 7px;
  border-radius: 6px; background: var(--bg-primary, #f0f2f8);
  color: var(--text-muted); border: 1px solid var(--border-color, #e5e8f0);
  white-space: nowrap; flex-shrink: 0;
}
.frc-status-badge {
  font-size: 0.68rem; font-weight: 700; padding: 2px 8px;
  border-radius: 8px; border: 1px solid; white-space: nowrap; flex-shrink: 0;
}
.frc-meta {
  font-size: 0.75rem; color: var(--text-muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.frc-note {
  font-size: 0.75rem; color: var(--text-secondary);
  font-style: italic; margin-top: 0.1rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.frc-decline-reason {
  font-size: 0.72rem; color: #b91c1c; margin-top: 0.1rem;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* Action buttons */
.frc-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
.frc-btn {
  padding: 0.4rem 1rem; border-radius: 8px;
  font-size: 0.82rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.15s; white-space: nowrap;
  display: flex; align-items: center; gap: 0.3rem;
}
.frc-btn-approve {
  background: #1a2d5a; color: #fff; border: 1.5px solid #1a2d5a;
}
.frc-btn-approve:hover { background: #152348; border-color: #152348; }
.frc-btn-decline {
  background: transparent; color: var(--text-secondary);
  border: 1.5px solid var(--border-color, #d1d5db);
}
.frc-btn-decline:hover { border-color: #ef4444; color: #ef4444; }
.frc-btn-cancel {
  background: transparent; color: var(--text-secondary);
  border: 1.5px solid var(--border-color, #d1d5db);
}
.frc-btn-cancel:hover { border-color: #ef4444; color: #ef4444; }
.frc-btn-complete {
  background: transparent; color: #1a2d5a;
  border: 1.5px solid #1a2d5a;
}
.frc-btn-complete:hover { background: #1a2d5a; color: #fff; }
.frc-btn-archive {
  background: transparent; color: var(--text-muted);
  border: 1.5px solid var(--border-color, #d1d5db); font-size: 0.75rem;
}
.frc-btn-archive:hover { border-color: #1a2d5a; color: #1a2d5a; }

/* Empty state */
.frc-empty {
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  padding: 3.5rem 1rem; text-align: center;
  color: var(--text-muted); font-size: 0.85rem;
}

/* Modal overlay */
.frc-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.45); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.frc-modal {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 16px; padding: 1.8rem 2rem;
  max-width: 420px; width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  font-family: 'Outfit', sans-serif;
}
.frc-modal-title {
  font-size: 1.15rem; font-weight: 800;
  color: var(--text-primary); margin: 0 0 0.4rem;
}
.frc-modal-sub {
  font-size: 0.85rem; color: var(--text-muted); margin: 0 0 1.2rem;
}
.frc-modal-label {
  font-size: 0.8rem; font-weight: 700;
  color: var(--text-secondary); margin-bottom: 0.35rem; display: block;
}
.frc-modal-textarea {
  width: 100%; padding: 0.75rem 0.9rem; border-radius: 9px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary); font-family: inherit; font-size: 0.88rem;
  resize: vertical; outline: none; box-sizing: border-box; transition: border-color 0.15s;
}
.frc-modal-textarea:focus { border-color: #1a2d5a; }
.frc-modal-footer {
  display: flex; gap: 0.75rem; margin-top: 1.4rem; justify-content: flex-end;
}
.frc-modal-cancel {
  padding: 0.6rem 1.2rem; border-radius: 9px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent; color: var(--text-secondary);
  font-weight: 600; font-size: 0.88rem; cursor: pointer; font-family: inherit;
}
.frc-modal-cancel:hover { border-color: #1a2d5a; color: #1a2d5a; }
.frc-modal-confirm {
  padding: 0.6rem 1.4rem; border-radius: 9px;
  border: none; background: #1a2d5a; color: #fff;
  font-weight: 700; font-size: 0.88rem; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.frc-modal-confirm:hover { opacity: 0.88; }
.frc-modal-confirm:disabled { opacity: 0.45; cursor: not-allowed; }
.frc-modal-confirm.danger { background: #ef4444; }

@media (max-width: 640px) {
  .frc-row { flex-wrap: wrap; gap: 0.75rem; }
  .frc-actions { width: 100%; }
  .frc-btn { flex: 1; justify-content: center; }
  .frc-search { max-width: 100%; }
}
`;

const STATUS_COLORS = {
  Approved:  { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  Pending:   { bg: '#fef3c7', color: '#7c5200', border: '#fde68a' },
  Declined:  { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  Cancelled: { bg: '#f1f5f9', color: '#374151', border: '#cbd5e1' },
  Completed: { bg: '#ede9fe', color: '#3730a3', border: '#c4b5fd' },
};

const fmt12 = (t) => {
  if (!t) return '';
  const [h, m] = String(t).split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const FacultyRequestsContent = ({ initialFilter = 'All', focusRequestId = null, onFocusHandled }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const [declineModal, setDeclineModal] = useState({ open: false, req: null, reason: '', note: '' });
  const [approveModal, setApproveModal] = useState({ open: false, reqId: null, note: '' });
  const [cancelModal,  setCancelModal]  = useState({ open: false, req: null, reason: '', note: '' });
  const [confirmModal, setConfirmModal] = useState({ open: false, reqId: null, newStatus: null, label: '' });
  const [deleteModal, setDeleteModal]   = useState({ open: false, reqId: null });

  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);

  // Deep-link from a notification click → open the details modal
  useEffect(() => {
    if (!focusRequestId || requests.length === 0) return;
    const target = requests.find(r => r.id === focusRequestId);
    if (!target) return;
    const idx = requests.findIndex(r => r.id === focusRequestId);
    const refId = `REQ${String(idx + 1).padStart(4, '0')}`;
    setFilter('All');
    setDetailModal({ app: target, refId });
    setHighlightedId(target.id);
    if (onFocusHandled) onFocusHandled();
    const t = setTimeout(() => setHighlightedId(null), 3000);
    return () => clearTimeout(t);
  }, [focusRequestId, requests]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const data = await withMinDelay(getFacultyRequests(user.id), 300);
      setRequests(data);
      setLoading(false);
    };
    fetch();
    const unsub = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    return () => unsub();
  }, [user]);

  const getCount = (f) => {
    if (f === 'All') return requests.length;
    if (f === 'History') return requests.filter(r => ['Completed','Cancelled','Declined'].includes(r.status)).length;
    return requests.filter(r => r.status === f).length;
  };

  const filtered = requests.filter(r => {
    const matchFilter = filter === 'All' ? true
      : filter === 'History' ? ['Completed','Cancelled','Declined'].includes(r.status)
      : r.status === filter;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || (r.name || '').toLowerCase().includes(q) || (r.subject || '').toLowerCase().includes(q) || (r.details || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const getStudentSection = (req) => {
    const email = req.avatarSeed || '';
    const studentNum = typeof email === 'string' && email.includes('@') ? email.split('@')[0] : '';
    return studentNum || '';
  };

  const getTimeLabel = (req) => {
    if (req.startTime && req.endTime) return `${fmt12(req.startTime)} to ${fmt12(req.endTime)}`;
    if (req.time) return req.time;
    return '';
  };

  const getSlotLabel = (req) => {
    if (!req.max_slots) return '';
    const slotReqs = requests
      .filter(r => r.schedule_id === req.schedule_id && r.date === req.date && r.status === 'Approved')
      .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    const idx = slotReqs.findIndex(r => r.id === req.id);
    const filled = slotReqs.length;
    return `${filled} of ${req.max_slots} slots held`;
  };

  // ── Actions ──
  const executeApprove = async () => {
    const { reqId, note } = approveModal;
    const req = requests.find(r => r.id === reqId);
    setApproveModal({ open: false, reqId: null, note: '' });
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === reqId ? { ...r, status: 'Approved', faculty_note: note } : r),
      () => updateRequestStatus(reqId, 'Approved', null, null, note, req ? { studentId: req.avatarSeed, facultyName: user?.user_metadata?.full_name || 'Faculty' } : null),
      { success: 'Request approved!', error: 'Failed to approve' }
    );
    if (req) {
      const token = getToken();
      if (token) {
        try {
          await createCalendarEvent(token, {
            title: `Consultation with ${req.name}${req.subject ? ' – ' + req.subject : ''}`,
            date: req.date, startTime: req.startTime || '08:00', endTime: req.endTime || '09:00',
            details: [req.consultationType && `Type: ${req.consultationType}`, req.subject && `Subject: ${req.subject}`].filter(Boolean).join('\n'),
            location: req.room || '',
          });
          toast.success('Added to your Google Calendar!');
        } catch {
          const url = buildGcalUrl({ title: `Consultation with ${req.name}`, date: req.date, startTime: req.startTime || '08:00', endTime: req.endTime || '09:00', details: '', location: '' });
          window.open(url, '_blank');
        }
      }
    }
  };

  const executeDecline = async () => {
    const { req, reason, note } = declineModal;
    if (!req || !reason) return;
    const fullReason = [reason, note].filter(Boolean).join(' — ');
    setDeclineModal({ open: false, req: null, reason: '', note: '' });
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === req.id ? { ...r, status: 'Declined', declineReason: fullReason } : r),
      () => updateRequestStatus(req.id, 'Declined', null, fullReason, null, { studentId: req.avatarSeed, facultyName: user?.user_metadata?.full_name || 'Faculty' }),
      { success: 'Request declined', error: 'Failed to decline' }
    );
  };

  const executeCancel = async () => {
    const { req, reason, note } = cancelModal;
    if (!req || !reason) return;
    setCancelModal({ open: false, req: null, reason: '', note: '' });
    const cancelReason = [reason, note].filter(Boolean).join(' — ');
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === req.id ? { ...r, status: 'Cancelled', cancel_reason: cancelReason } : r),
      () => updateRequestStatus(req.id, 'Cancelled', cancelReason, null, null, null),
      { success: 'Appointment cancelled', error: 'Failed to cancel' }
    );
  };

  const executeConfirm = async () => {
    const { reqId, newStatus } = confirmModal;
    setConfirmModal({ open: false, reqId: null, newStatus: null, label: '' });
    await optimistic(
      setRequests, requests,
      requests.map(r => r.id === reqId ? { ...r, status: newStatus } : r),
      () => updateRequestStatus(reqId, newStatus, null, null, null, null),
      { success: `Marked as ${newStatus}`, error: 'Action failed' }
    );
  };

  const executeArchive = async () => {
    const { reqId } = deleteModal;
    setDeleteModal({ open: false, reqId: null });
    await optimistic(
      setRequests, requests,
      requests.filter(r => r.id !== reqId),
      () => deleteRequest(reqId, 'faculty'),
      { success: 'Archived', error: 'Failed to archive' }
    );
  };

  return (
    <div className="frc-wrap">
      <style>{requestStyles}</style>

      <p className="frc-page-title">Appointment requests</p>
      <p className="frc-page-sub">Review and manage student consultation requests</p>

      {/* Toolbar */}
      <div className="frc-toolbar">
        <div className="frc-chips">
          {['All', 'Pending', 'Approved', 'History'].map(f => (
            <button
              key={f}
              className={`frc-chip${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'All' ? `All (${getCount('All')})` : `${f} (${getCount(f)})`}
            </button>
          ))}
        </div>
        <div className="frc-search">
          <Search size={15} className="frc-search-icon" />
          <input
            type="text"
            placeholder="Search student, topic, or note"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <RequestCardSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="frc-list-card">
          <div className="frc-empty">
            <Inbox size={36} strokeWidth={1.5} style={{ opacity: 0.25 }} />
            <span>{searchTerm ? `No results for "${searchTerm}"` : `No ${filter === 'All' ? '' : filter.toLowerCase()} requests.`}</span>
          </div>
        </div>
      ) : (
        <div className="frc-list-card">
          {filtered.map(req => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.Cancelled;
            const section = getStudentSection(req);
            const timeLabel = getTimeLabel(req);
            const slotLabel = getSlotLabel(req);
            const metaParts = [req.subject, timeLabel, slotLabel].filter(Boolean);

            return (
              <div
                key={req.id}
                id={`frc-row-${req.id}`}
                className={`frc-row${highlightedId === req.id ? ' frc-row-highlight' : ''}`}
              >
                {/* Avatar */}
                <div className="frc-avatar">
                  <User size={18} />
                </div>

                {/* Info */}
                <div className="frc-info">
                  <div className="frc-name-row">
                    <span className="frc-name">{req.name?.split('(')[0]?.trim() || '—'}</span>
                    {section && <span className="frc-section-badge">{section}</span>}
                    {req.status !== 'Pending' && (
                      <span className="frc-status-badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>
                        {req.status}
                      </span>
                    )}
                    {req.status === 'Pending' && req.facultySeen && (
                      <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Eye size={10} /> Seen
                      </span>
                    )}
                  </div>
                  <div className="frc-meta">{metaParts.join(' · ')}</div>
                  {req.details && (
                    <div className="frc-note">"{req.details}"</div>
                  )}
                  {req.declineReason && (
                    <div className="frc-decline-reason">Declined: "{req.declineReason}"</div>
                  )}
                  {req.status === 'Cancelled' && req.cancel_reason && (
                    <div className="frc-decline-reason">Cancelled: "{req.cancel_reason}"</div>
                  )}
                </div>

                {/* Actions */}
                <div className="frc-actions">
                  {req.status === 'Pending' && (<>
                    <button className="frc-btn frc-btn-decline" onClick={() => setDeclineModal({ open: true, req, reason: '', note: '' })}>Decline</button>
                    <button className="frc-btn frc-btn-approve" onClick={() => setApproveModal({ open: true, reqId: req.id, note: '' })}>Approve</button>
                  </>)}
                  {req.status === 'Approved' && (<>
                    <button className="frc-btn frc-btn-cancel" onClick={() => setCancelModal({ open: true, req, reason: '', note: '' })}>Cancel</button>
                    <button className="frc-btn frc-btn-complete" onClick={() => setConfirmModal({ open: true, reqId: req.id, newStatus: 'Completed', label: 'mark as completed' })}>Done</button>
                  </>)}
                  {['Completed','Declined','Cancelled'].includes(req.status) && (
                    <button className="frc-btn frc-btn-archive" onClick={() => setDeleteModal({ open: true, reqId: req.id })}>
                      <Archive size={13} /> Archive
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Decline modal ── */}
      {declineModal.open && (() => {
        const req = declineModal.req;
        const timeLabel = req?.startTime ? fmt12(req.startTime) : (req?.time?.split(' - ')[0] || '');
        const subtitle = [req?.name?.split('(')[0]?.trim(), [req?.day, req?.date].filter(Boolean).join(', '), timeLabel].filter(Boolean).join(' · ');
        return (
          <div className="frc-modal-overlay" onClick={() => setDeclineModal({ open: false, req: null, reason: '', note: '' })}>
            <div className="frc-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <div>
                  <p className="frc-modal-title">Decline request</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.3rem' }}>{subtitle}</p>
                </div>
                <button onClick={() => setDeclineModal({ open: false, req: null, reason: '', note: '' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.1rem', lineHeight: 1, marginLeft: '0.5rem' }}>
                  ✕
                </button>
              </div>

              <label className="frc-modal-label">Reason for declining request</label>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <select
                  value={declineModal.reason}
                  onChange={e => setDeclineModal(d => ({ ...d, reason: e.target.value }))}
                  style={{
                    width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.9rem',
                    borderRadius: '9px', border: '1.5px solid var(--border-color, #d1d5db)',
                    background: 'var(--card-bg, #fff)', color: declineModal.reason ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none',
                    appearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
                  }}
                >
                  <option value="" disabled>select reason</option>
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="I'm unavailable that day">I'm unavailable that day</option>
                  <option value="Room Unavailable">Room Unavailable</option>
                  <option value="Not feeling well/ Emergency">Not feeling well/ Emergency</option>
                </select>
                <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▾</span>
              </div>

              <label className="frc-modal-label">Optional notes for the student</label>
              <textarea
                className="frc-modal-textarea"
                rows={4}
                placeholder=""
                value={declineModal.note}
                onChange={e => setDeclineModal(d => ({ ...d, note: e.target.value }))}
              />

              <div className="frc-modal-footer">
                <button className="frc-modal-cancel" onClick={() => setDeclineModal({ open: false, req: null, reason: '', note: '' })}>Keep it</button>
                <button className="frc-modal-confirm danger" disabled={!declineModal.reason} onClick={executeDecline}>Decline request</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Approve modal ── */}
      {approveModal.open && (
        <div className="frc-modal-overlay" onClick={() => setApproveModal({ open: false, reqId: null, note: '' })}>
          <div className="frc-modal" onClick={e => e.stopPropagation()}>
            <p className="frc-modal-title">Approve request</p>
            <p className="frc-modal-sub">Add an optional note for the student.</p>
            <label className="frc-modal-label">Note (optional)</label>
            <textarea
              className="frc-modal-textarea"
              rows={3}
              placeholder="e.g. Please bring your student ID."
              value={approveModal.note}
              onChange={e => setApproveModal(a => ({ ...a, note: e.target.value }))}
            />
            <div className="frc-modal-footer">
              <button className="frc-modal-cancel" onClick={() => setApproveModal({ open: false, reqId: null, note: '' })}>Cancel</button>
              <button className="frc-modal-confirm" onClick={executeApprove}>Approve now</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel appointment modal ── */}
      {cancelModal.open && (() => {
        const req = cancelModal.req;
        const dayLabel = req?.day || '';
        const dateLabel = req?.date || '';
        const timeLabel = req?.startTime ? fmt12(req.startTime) : (req?.time?.split(' - ')[0] || '');
        const subtitle = [req?.name?.split('(')[0]?.trim(), [dayLabel, dateLabel].filter(Boolean).join(', '), timeLabel].filter(Boolean).join(' · ');
        return (
          <div className="frc-modal-overlay" onClick={() => setCancelModal({ open: false, req: null, reason: '', note: '' })}>
            <div className="frc-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <div>
                  <p className="frc-modal-title">Cancel appointment</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1.3rem' }}>{subtitle}</p>
                </div>
                <button onClick={() => setCancelModal({ open: false, req: null, reason: '', note: '' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.1rem', lineHeight: 1, marginLeft: '0.5rem' }}>
                  ✕
                </button>
              </div>

              {/* Reason dropdown */}
              <label className="frc-modal-label">Reason for cancelling request</label>
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <select
                  value={cancelModal.reason}
                  onChange={e => setCancelModal(m => ({ ...m, reason: e.target.value }))}
                  style={{
                    width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.9rem',
                    borderRadius: '9px', border: '1.5px solid var(--border-color, #d1d5db)',
                    background: 'var(--card-bg, #fff)', color: cancelModal.reason ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'inherit', fontSize: '0.88rem', outline: 'none',
                    appearance: 'none', cursor: 'pointer', boxSizing: 'border-box',
                  }}
                >
                  <option value="" disabled>select reason</option>
                  <option value="Schedule conflict">Schedule conflict</option>
                  <option value="I'm unavailable that day">I'm unavailable that day</option>
                  <option value="Room Unavailable">Room Unavailable</option>
                  <option value="Not feeling well/ Emergency">Not feeling well/ Emergency</option>
                </select>
                <span style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}>▾</span>
              </div>

              {/* Optional notes */}
              <label className="frc-modal-label">Optional notes for the student</label>
              <textarea
                className="frc-modal-textarea"
                rows={4}
                placeholder=""
                value={cancelModal.note}
                onChange={e => setCancelModal(m => ({ ...m, note: e.target.value }))}
              />

              <div className="frc-modal-footer">
                <button className="frc-modal-cancel" onClick={() => setCancelModal({ open: false, req: null, reason: '', note: '' })}>Keep it</button>
                <button className="frc-modal-confirm" disabled={!cancelModal.reason} onClick={executeCancel}>Cancel request</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Confirm modal (complete) ── */}
      {confirmModal.open && (
        <div className="frc-modal-overlay" onClick={() => setConfirmModal({ open: false, reqId: null, newStatus: null, label: '' })}>
          <div className="frc-modal" onClick={e => e.stopPropagation()}>
            <p className="frc-modal-title">Mark as completed?</p>
            <p className="frc-modal-sub">This will <strong>{confirmModal.label}</strong> and cannot be undone.</p>
            <div className="frc-modal-footer">
              <button className="frc-modal-cancel" onClick={() => setConfirmModal({ open: false, reqId: null, newStatus: null, label: '' })}>Go back</button>
              <button className="frc-modal-confirm" onClick={executeConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Archive modal ── */}
      {deleteModal.open && (
        <div className="frc-modal-overlay" onClick={() => setDeleteModal({ open: false, reqId: null })}>
          <div className="frc-modal" onClick={e => e.stopPropagation()}>
            <p className="frc-modal-title">Archive request?</p>
            <p className="frc-modal-sub">This will hide it from your main list but keep it in your records.</p>
            <div className="frc-modal-footer">
              <button className="frc-modal-cancel" onClick={() => setDeleteModal({ open: false, reqId: null })}>Cancel</button>
              <button className="frc-modal-confirm" onClick={executeArchive}>Yes, archive</button>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <AppointmentDetailsModal
          app={detailModal.app}
          refId={detailModal.refId}
          role="faculty"
          timeStr={detailModal.app?.time}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
};

export default FacultyRequestsContent;
