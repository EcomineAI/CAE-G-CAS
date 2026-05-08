import React, { useState, useEffect } from 'react';
import { Check, X, User, Search, Filter, Trash2, Eye, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultyRequests, updateRequestStatus, deleteRequest } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { RequestCardSkeleton, optimistic, withMinDelay } from '../../supabase/ux';
import { calculateStudentSlot } from '../../utils/dateUtils';
import { STATUS_LABELS } from '../../utils/constants';

const requestStyles = `
.requests-container {
  animation: fadeIn 0.4s ease;
}

.requests-header {
  margin-bottom: 2rem;
}

.requests-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.requests-header p {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0.3rem 0 0 0;
}

.filter-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
}

.filter-row::-webkit-scrollbar { display: none; }

.filter-chip {
  padding: 0.4rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-chip.active {
  background: var(--accent-light);
  border-color: var(--accent-orange);
  color: var(--accent-orange);
}

.request-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.request-main-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.student-avatar-box {
  width: 50px;
  height: 50px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.student-text-info {
  display: flex;
  flex-direction: column;
}

.student-name-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.student-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.status-pill-small {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.8rem;
  border-radius: 20px;
  text-transform: uppercase;
}

.status-pill-small.approved {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #16a34a;
}

.status-pill-small.completed {
  background: #fff7ed;
  color: #ea580c;
  border: 1px solid #ea580c;
}

.status-pill-small.declined {
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.status-pill-small.cancelled {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #64748b;
}

.request-meta {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 0.2rem;
}

.action-buttons {
  display: flex;
  gap: 0.8rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-approve {
  background: #dcfce7;
  color: #16a34a;
  border-color: #bbf7d0;
}

.btn-approve:hover {
  background: #bbf7d0;
}

.btn-decline {
  background: #fee2e2;
  color: #ef4444;
  border-color: #fecaca;
}

.btn-decline:hover {
  background: #fecaca;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #94a3b8;
  font-size: 0.8rem;
}

.divided-tag {
  background: var(--accent-light);
  color: var(--accent-orange);
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

/* Dark mode overrides for buttons */
.dark .btn-approve { background: #064e3b; color: #34d399; border-color: #065f46; }
.dark .btn-decline { background: #7f1d1d; color: #f87171; border-color: #991b1b; }

@media (max-width: 600px) {
  .request-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .request-main-info {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }
  
  .action-btn {
    justify-content: center;
    padding: 0.8rem;
  }
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.status-filters {
  display: flex;
  gap: 0.8rem;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 4px;
}

.status-filters::-webkit-scrollbar { display: none; }

.search-box {
  position: relative;
  flex: 1;
  min-width: 280px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.8rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px var(--accent-light);
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    min-width: 100%;
  }
}
`;

const FacultyRequestsContent = ({ initialFilter = 'Pending' }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState(initialFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reqId: null, newStatus: null, actionText: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reqId: null });
  const [declineModal, setDeclineModal] = useState({ isOpen: false, reqId: null, reason: '' });
  const [approveModal, setApproveModal] = useState({ isOpen: false, reqId: null, note: '' });

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const data = await withMinDelay(getFacultyRequests(user.id), 300);
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();

    const unsub = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    return () => unsub();
  }, [user]);

  const handleAction = async (id, newStatus) => {
    if (newStatus === 'Declined') {
      setDeclineModal({ isOpen: true, reqId: id, reason: '' });
      return;
    }
    if (newStatus === 'Approved') {
      setApproveModal({ isOpen: true, reqId: id, note: '' });
      return;
    }
    if (newStatus === 'Completed') {
      setConfirmModal({ isOpen: true, reqId: id, newStatus, actionText: 'mark this appointment as completed' });
      return;
    }
    await executeAction(id, newStatus);
  };

  const executeApprove = async () => {
    const { reqId, note } = approveModal;
    if (!reqId) return;
    setApproveModal({ isOpen: false, reqId: null, note: '' });
    await optimistic(
      setRequests, requests,
      requests.map(req => req.id === reqId ? { ...req, status: 'Approved', faculty_note: note } : req),
      () => updateRequestStatus(reqId, 'Approved', null, null, note),
      { success: 'Request approved!', error: 'Failed to approve request' }
    );
  };

  const executeDecline = async () => {
    const { reqId, reason } = declineModal;
    if (!reqId) return;
    if (!reason.trim()) return;
    setDeclineModal({ isOpen: false, reqId: null, reason: '' });
    await optimistic(
      setRequests, requests,
      requests.map(req => req.id === reqId ? { ...req, status: 'Declined', declineReason: reason } : req),
      () => updateRequestStatus(reqId, 'Declined', null, reason),
      { success: 'Request declined', error: 'Failed to decline request' }
    );
  };

  const executeAction = async (id, newStatus) => {
    await optimistic(
      setRequests,
      requests,
      requests.map(req => req.id === id ? { ...req, status: newStatus } : req),
      () => updateRequestStatus(id, newStatus),
      { success: `Request ${newStatus.toLowerCase()}`, error: `Failed to ${newStatus.toLowerCase()} request` }
    );
    setConfirmModal({ isOpen: false, reqId: null, newStatus: null, actionText: '' });
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, reqId: id });
  };

  const executeArchive = async () => {
    const { reqId } = deleteModal;
    if (!reqId) return;
    
    setDeleteModal({ isOpen: false, reqId: null });

    await optimistic(
      setRequests,
      requests,
      requests.filter(req => req.id !== reqId),
      () => deleteRequest(reqId, 'faculty'),
      { success: 'Request moved to archive', error: 'Failed to archive request' }
    );
  };

  const getDividedTime = (req) => {
    if (req.status !== 'Approved') return req.time;
    const slotRequests = requests
      .filter(r => r.schedule_id === req.schedule_id && r.date === req.date && r.status === 'Approved')
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    const index = slotRequests.findIndex(r => r.id === req.id);
    if (index === -1) return req.time;

    const [start, end] = req.time.split(' - ');
    return calculateStudentSlot(start, end, req.max_slots || 5, index);
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'All' 
      ? true 
      : filter === 'History' 
        ? ['Completed', 'Cancelled', 'Declined'].includes(req.status)
        : req.status === filter;
        
    const matchesSearch = (req.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                         (req.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (req.details?.toLowerCase() || '').includes(searchTerm.toLowerCase());
                         
    return matchesFilter && matchesSearch;
  });

  const getCount = (status) => {
    if (status === 'History') return requests.filter(req => ['Completed', 'Cancelled', 'Declined'].includes(req.status)).length;
    return requests.filter(req => req.status === status).length;
  };

  return (
    <div className="requests-container">
      <style>{requestStyles}</style>

      <div className="requests-header">
        <h2>Appointment Requests</h2>
        <p>Review and manage student consultation requests</p>
      </div>

      <div className="filter-row" role="tablist" aria-label="Filter requests by status">
        <div className="status-filters">
          {['All', 'Pending', 'Approved', 'History'].map(f => (
            <button 
              key={f} 
              role="tab"
              aria-selected={filter === f}
              aria-label={`${f} requests, ${getCount(f)} items`}
              className={`filter-chip ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'All' ? 'All' : `${f} (${getCount(f)})`}
            </button>
          ))}
        </div>

        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search student or subject..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search requests"
          />
        </div>
      </div>

      <div className="requests-list">
        {loading ? <RequestCardSkeleton count={3} /> : filteredRequests.map(req => (
          <div className="request-card" key={req.id}>
            <div className="request-main-info">
              <div className="student-avatar-box">
                <img src={req.avatar} alt={req.name} style={{ width: '100%', height: '100%' }} />
              </div>
              <div className="student-text-info">
                <div className="student-name-row">
                   <span className="student-name">{req.name}</span>
                   {req.status !== 'Pending' && (
                     <span className={`status-pill-small ${req.status.toLowerCase()}`}>{req.status}</span>
                   )}
                   {req.status === 'Pending' && req.facultySeen && (
                     <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '2px' }}>
                       <Eye size={10} /> Seen
                     </span>
                   )}
                 </div>
                <div className="request-meta">
                  {req.day} • {req.date}
                </div>
                <div className="detail-item">
                  <Clock size={14} />
                  <span>{getDividedTime(req)}</span>
                  {req.status === 'Approved' && req.max_slots > 1 && (
                    <span className="divided-tag">Divided Slot</span>
                  )}
                </div>
                
                <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'var(--bg-primary)', borderRadius: '12px', borderLeft: '3px solid var(--accent-orange)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    {req.subject}
                    {req.consultationType && req.consultationType !== 'General' && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'var(--accent-light)', color: 'var(--accent-orange)', borderRadius: '4px', fontWeight: 600 }}>
                        {req.consultationType}
                      </span>
                    )}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{req.details}</div>
                </div>

                {req.declineReason && (
                  <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: '#fee2e2', borderRadius: '8px', borderLeft: '3px solid #ef4444', fontSize: '0.8rem', color: '#b91c1c' }}>
                    <strong>Decline Reason:</strong> "{req.declineReason}"
                  </div>
                )}

                {req.status === 'Cancelled' && req.cancel_reason && (
                  <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: '#fee2e2', borderRadius: '8px', borderLeft: '3px solid #ef4444', fontSize: '0.8rem', color: '#b91c1c' }}>
                    <strong>Student's Cancellation Note:</strong><br />
                    "{req.cancel_reason}"
                  </div>
                )}
              </div>
            </div>

            {req.status === 'Pending' && (
              <div className="action-buttons">
                <button 
                  className="action-btn btn-approve" 
                  onClick={() => handleAction(req.id, 'Approved')}
                  aria-label={`Approve request from ${req.name}`}
                >
                  <Check size={16} /> Approve
                </button>
                <button 
                  className="action-btn btn-decline" 
                  onClick={() => handleAction(req.id, 'Declined')}
                  aria-label={`Decline request from ${req.name}`}
                >
                  <X size={16} /> Decline
                </button>
              </div>
            )}

            {req.status === 'Approved' && (
              <div className="action-buttons">
                <button 
                  className="action-btn btn-approve" 
                  onClick={() => handleAction(req.id, 'Completed')}
                  style={{ background: 'var(--accent-light)', color: 'var(--accent-orange)', borderColor: '#fed7aa' }}
                >
                  <Check size={16} /> Mark Completed
                </button>
              </div>
            )}

            {(req.status === 'Completed' || req.status === 'Declined' || req.status === 'Cancelled') && (
              <div className="action-buttons">
                <button 
                  className="action-btn" 
                  style={{ background: 'transparent', border: '1px solid var(--accent-orange)', color: 'var(--accent-orange)' }}
                  onClick={() => confirmDelete(req.id)}
                >
                  <Trash2 size={16} /> <span>Archive Request</span>
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div 
            className="empty-state-card"
            style={{ 
              textAlign: 'center', 
              padding: '4rem 2rem', 
              color: 'var(--text-muted)', 
              background: 'var(--bg-secondary)', 
              borderRadius: '24px', 
              border: '1px solid var(--border-color)', 
              marginTop: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '50%', color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
              <Inbox size={48} strokeWidth={1.5} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                {searchTerm ? 'No matches found' : 'All Caught Up!'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '300px' }}>
                {searchTerm ? `We couldn't find anything matching "${searchTerm}"` : `No ${filter === 'All' ? '' : filter.toLowerCase()} requests found at the moment.`}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-orange)', fontWeight: 600, marginTop: '1rem', cursor: 'pointer' }}
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* #31: Decline Reason Modal */}
      {declineModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '420px', width: '90%', textAlign: 'left', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ef4444', marginBottom: '1rem' }}>
              <X size={22} />
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>Decline Request</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Please provide a reason. This will be shown to the student so they know what to do next.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Reason for declining <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={declineModal.reason}
                onChange={e => setDeclineModal({ ...declineModal, reason: e.target.value })}
                placeholder="e.g. Schedule conflict. Please rebook next week during my Tuesday slot."
                rows={3}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: `1px solid ${declineModal.reason.trim() ? 'var(--border-color)' : '#ef4444'}`, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
              {!declineModal.reason.trim() && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.3rem' }}>A reason is required before declining.</p>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setDeclineModal({ isOpen: false, reqId: null, reason: '' })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={executeDecline}
                disabled={!declineModal.reason.trim()}
                style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: declineModal.reason.trim() ? '#ef4444' : '#d1d5db', color: 'white', cursor: declineModal.reason.trim() ? 'pointer' : 'not-allowed', fontWeight: 600 }}
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.4rem' }}>Are you sure?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Do you really want to <strong>{confirmModal.actionText}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, reqId: null, newStatus: null, actionText: '' })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={() => executeAction(confirmModal.reqId, confirmModal.newStatus)}
                style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Yes, {confirmModal.newStatus === 'Completed' ? 'Mark Complete' : confirmModal.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* #21: Approve with Note Modal */}
      {approveModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '420px', width: '90%', textAlign: 'left', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent-orange)', marginBottom: '1rem' }}>
              <Check size={22} />
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>Approve Request</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              Add a note for the student? (e.g., "Please bring your student ID.")
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Note for Student (Optional)
              </label>
              <textarea
                value={approveModal.note}
                onChange={e => setApproveModal({ ...approveModal, note: e.target.value })}
                placeholder="No special instructions needed."
                rows={3}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={() => setApproveModal({ isOpen: false, reqId: null, note: '' })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={executeApprove}
                style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Approve Now
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'left', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent-orange)', marginBottom: '1rem' }}>
              <Trash2 size={24} />
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>Archive Request?</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Moving this to archive will hide it from your main list but keep it for your permanent records.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button onClick={() => setDeleteModal({ isOpen: false, reqId: null })} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={executeArchive} style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Yes, Archive</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default FacultyRequestsContent;


