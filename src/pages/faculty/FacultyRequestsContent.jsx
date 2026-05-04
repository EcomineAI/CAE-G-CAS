import React, { useState, useEffect } from 'react';
import { Check, X, User, Search, Filter } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultyRequests, updateRequestStatus } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { RequestCardSkeleton, optimistic, withMinDelay } from '../../supabase/ux';

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
  padding: 0.6rem 1.4rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-chip.active {
  background: var(--bg-primary);
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
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
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

/* Dark mode overrides for buttons */
.dark .btn-approve { background: #064e3b; color: #34d399; border-color: #065f46; }
.dark .btn-decline { background: #7f1d1d; color: #f87171; border-color: #991b1b; }
`;

const FacultyRequestsContent = ({ initialFilter = 'Pending' }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState(initialFilter);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, reqId: null, newStatus: null, actionText: '' });

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

    // Real-time subscription
    const unsub = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    return () => unsub();
  }, [user]);

  const handleAction = async (id, newStatus) => {
    if (newStatus === 'Declined') {
      setConfirmModal({ isOpen: true, reqId: id, newStatus, actionText: 'decline this student request' });
      return;
    }
    if (newStatus === 'Completed') {
      setConfirmModal({ isOpen: true, reqId: id, newStatus, actionText: 'mark this appointment as completed' });
      return;
    }
    await executeAction(id, newStatus);
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

  const filteredRequests = requests.filter(req => {
    if (filter === 'All') return true;
    if (filter === 'History') return ['Completed', 'Cancelled', 'Declined'].includes(req.status);
    return req.status === filter;
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

      <div className="filter-row">
        {['All', 'Pending', 'Approved', 'History'].map(f => (
          <div 
            key={f} 
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f} {f !== 'All' ? `(${getCount(f)})` : ''}
          </div>
        ))}
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
                 </div>
                <div className="request-meta">
                  {req.day} • {req.time}
                </div>
                <div className="request-meta" style={{ fontSize: '0.7rem' }}>
                  {req.date}
                </div>
                
                {/* Student's request info */}
                <div style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'var(--bg-primary)', borderRadius: '12px', borderLeft: '3px solid var(--accent-orange)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{req.subject}</div>
                  <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{req.details}</div>
                </div>

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
                <button className="action-btn btn-approve" onClick={() => handleAction(req.id, 'Approved')}>
                  <Check size={16} /> Approve
                </button>
                <button className="action-btn btn-decline" onClick={() => handleAction(req.id, 'Declined')}>
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
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No {filter.toLowerCase()} requests found.
          </div>
        )}
      </div>

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
                Yes, {confirmModal.newStatus === 'Declined' ? 'Decline' : confirmModal.newStatus === 'Approved' ? 'Approve' : confirmModal.newStatus === 'Completed' ? 'Complete' : confirmModal.newStatus}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyRequestsContent;
