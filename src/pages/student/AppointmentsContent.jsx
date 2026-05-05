import React, { useState, useEffect } from 'react';
import { User, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getStudentRequests, updateRequestDetails, updateRequestStatus, deleteRequest } from '../../supabase/api';
import { subscribeToRequests } from '../../supabase/realtime';
import { AppointmentRowSkeleton, withMinDelay, optimistic, toast } from '../../supabase/ux';

const appointmentsStyles = `
.appointments-page {
  animation: fadeIn 0.5s ease;
}

.appointments-page h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2rem;
}

.filter-tabs {
  display: flex;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: none;
}

.filter-tab {
  padding: 0.4rem 1.2rem;
  border-radius: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tab.active {
  border-color: #f97316;
  background: var(--accent-light);
  color: var(--accent-orange);
}

.filter-tab.active-all {
  border-color: #f97316;
  color: #16a34a;
}

.filter-tab:hover {
  border-color: var(--accent-orange);
}

.appointments-table-container {
  background: var(--bg-secondary);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  box-shadow: var(--shadow);
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table thead th {
  background: #f3f4f6;
  padding: 1.2rem;
  text-align: left;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.1rem;
}

.dashboard-fixed-wrapper.dark .appointments-table thead th {
  background: #2a2a2a;
  color: var(--text-primary);
}

.appointments-table tbody td {
  padding: 1.2rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.appointments-table tbody tr:last-child td {
  border-bottom: none;
}

.faculty-cell {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.faculty-avatar-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2.5px solid var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--bg-primary);
  transition: border-color 0.3s;
}

/* Status-based ring colors */
.faculty-avatar-circle.approved { border-color: #22c55e; }
.faculty-avatar-circle.pending { border-color: #eab308; }
.faculty-avatar-circle.cancelled { border-color: #ef4444; }
.faculty-avatar-circle.completed { border-color: #ea580c; }

.faculty-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.faculty-name-text {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.date-text, .time-text {
  color: var(--text-secondary);
  font-size: 1rem;
}

.status-badge-pill {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
}

.status-badge-pill.approved { background: #dcfce7; color: #16a34a; }
.status-badge-pill.pending { background: #fef9c3; color: #ca8a04; }
.status-badge-pill.cancelled { background: #fee2e2; color: #dc2626; }
.status-badge-pill.completed { background: #ffedd5; color: #ea580c; }

.dashboard-fixed-wrapper.dark .status-badge-pill.approved { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.dashboard-fixed-wrapper.dark .status-badge-pill.pending { background: rgba(234, 179, 8, 0.2); color: #facc15; }
.dashboard-fixed-wrapper.dark .status-badge-pill.cancelled { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.dashboard-fixed-wrapper.dark .status-badge-pill.completed { background: rgba(234, 88, 12, 0.2); color: #fb923c; }

.desktop-only-cell { display: table-cell; }
.mobile-hide-on-desktop { display: none; }

@media (max-width: 900px) {
  .desktop-only-cell { display: none !important; }
  .mobile-hide-on-desktop { display: block !important; }
  
  .appointments-page h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .filter-tabs {
    gap: 0.6rem;
    padding-bottom: 0.8rem;
  }

  .filter-tab {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    border-radius: 12px;
  }

  .appointments-table thead {
    display: none;
  }

  .appointments-table-container {
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .appointments-table tbody tr {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 16px;
    border: 1px solid var(--card-border);
    margin-bottom: 1rem;
    box-shadow: var(--shadow);
  }

  .appointments-table tbody td {
    display: block;
    width: 100%;
    padding: 0;
    border-bottom: none;
  }

  .faculty-cell {
    gap: 0.8rem;
    margin-bottom: 0.8rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.8rem;
  }

  .faculty-avatar-circle {
    width: 40px;
    height: 40px;
    border-width: 2px;
  }

  .faculty-name-text {
    font-size: 0.95rem;
    font-weight: 700;
  }

  .date-time-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
    padding: 0.5rem;
    background: var(--bg-primary);
    border-radius: 10px;
  }

  .date-text, .time-text {
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .status-badge-pill {
    margin: 0;
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
    border-radius: 8px;
    width: fit-content;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }
}
`;

const AppointmentsContent = ({ initialFilter = 'All', onResetFilter }) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState({ isOpen: false, reqId: null, reason: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, reqId: null, subject: '', details: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, reqId: null });

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      const data = await withMinDelay(getStudentRequests(user.id), 300);
      setRequests(data);
      setLoading(false);
    };
    fetchRequests();

    // Real-time: auto-update when faculty changes status
    const unsub = subscribeToRequests(user.id, 'student', setRequests, () => getStudentRequests(user.id));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (initialFilter) {
      setActiveFilter(initialFilter);
    }
  }, [initialFilter]);

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (onResetFilter) onResetFilter();
  };

  const confirmCancel = (id) => {
    setCancelModal({ isOpen: true, reqId: id, reason: '' });
  };

  const handleEdit = (app) => {
    setEditModal({ 
      isOpen: true, 
      reqId: app.id, 
      subject: app.subject || '', 
      details: app.details || '' 
    });
  };

  const executeUpdate = async () => {
    const { reqId, subject, details } = editModal;
    if (!reqId) return;

    setEditModal({ ...editModal, isOpen: false });

    await optimistic(
      setRequests,
      requests,
      requests.map(req => req.id === reqId ? { ...req, subject, details } : req),
      () => updateRequestDetails(reqId, subject, details),
      { success: 'Appointment updated', error: 'Failed to update appointment' }
    );
  };

  const executeCancel = async () => {
    const { reqId, reason } = cancelModal;
    if (!reqId) return;
    
    if (reason.trim().length === 0) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }

    setCancelModal({ isOpen: false, reqId: null, reason: '' });

    await optimistic(
      setRequests,
      requests,
      requests.map(req => req.id === reqId ? { ...req, status: 'Cancelled' } : req),
      () => updateRequestStatus(reqId, 'Cancelled', reason),
      { success: 'Appointment cancelled', error: 'Failed to cancel appointment' }
    );
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, reqId: id });
  };

  const executeDelete = async () => {
    const { reqId } = deleteModal;
    if (!reqId) return;

    setDeleteModal({ isOpen: false, reqId: null });

    await optimistic(
      setRequests,
      requests,
      requests.filter(req => req.id !== reqId),
      () => deleteRequest(reqId, 'student'),
      { success: 'Record deleted', error: 'Failed to delete record' }
    );
  };

  const filteredData = activeFilter === 'All' 
    ? requests 
    : activeFilter === 'History'
      ? requests.filter(app => ['Completed', 'Cancelled', 'Declined'].includes(app.status))
      : requests.filter(app => app.status === activeFilter);

  const getHistoryCount = () => requests.filter(r => ['Completed', 'Cancelled', 'Declined'].includes(r.status)).length;

  const counts = {
    Approved: requests.filter(r => r.status === 'Approved').length,
    Pending: requests.filter(r => r.status === 'Pending').length,
    Completed: requests.filter(r => r.status === 'Completed').length,
    Cancelled: requests.filter(r => r.status === 'Cancelled').length,
  };

  const filters = [
    { label: 'All', value: 'All' },
    { label: `Pending (${counts.Pending})`, value: 'Pending' },
    { label: `Approved (${counts.Approved})`, value: 'Approved' },
    { label: `History (${getHistoryCount()})`, value: 'History' },
  ];

  return (
    <div className="appointments-page">
      <style>{appointmentsStyles}</style>
      <h2>My Appointment Overview</h2>

      <div className="filter-tabs">
        {filters.map((filter) => (
          <div 
            key={filter.value}
            className={`filter-tab ${activeFilter === filter.value ? (filter.value === 'All' ? 'active-all' : 'active') : ''}`}
            onClick={() => handleFilterClick(filter.value)}
          >
            {filter.label}
          </div>
        ))}
      </div>

      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Faculty Name</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Date</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Time Slot</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Status</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <AppointmentRowSkeleton count={4} />
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No appointments found.</td></tr>
            ) : filteredData.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="faculty-cell">
                    <div className={`faculty-avatar-circle ${app.status.toLowerCase()}`}>
                      <img src={app.avatar} alt={app.name} className="faculty-avatar-img" />
                    </div>
                    <div className="faculty-name-info" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="faculty-name-text">{app.name}</span>
                      <div style={{ marginTop: '0.3rem', padding: '0.3rem 0.5rem', background: 'var(--bg-primary)', borderRadius: '6px', fontSize: '0.7rem', borderLeft: '2px solid var(--accent-orange)', maxWidth: '200px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{app.subject}</div>
                        <div style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.details}</div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="mobile-hide-on-desktop" style={{ padding: 0 }}>
                  <div className="date-time-group">
                    <span className="date-text">{app.date}</span>
                    <span className="time-text">{app.time}</span>
                  </div>
                </td>
                <td className="mobile-hide-on-desktop" style={{ padding: 0 }}>
                  <div className="card-footer">
                    <div className={`status-badge-pill ${app.status.toLowerCase()}`}>
                      {app.status}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {app.status === 'Pending' && (
                        <button 
                          onClick={() => handleEdit(app)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                      )}
                      {(app.status === 'Pending' || app.status === 'Approved') && (
                        <button 
                          onClick={() => confirmCancel(app.id)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid #fecaca', background: '#fee2e2', color: '#ef4444', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      )}
                      {(app.status === 'Completed' || app.status === 'Cancelled' || app.status === 'Declined') && (
                        app.is_faculty_deleted ? (
                          <button 
                            onClick={() => confirmDelete(app.id)}
                            style={{ padding: '0.3rem', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, padding: '0.3rem 0.6rem', background: 'var(--accent-light)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <span style={{ opacity: 0.7 }}>🔒</span> Faculty Pending
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </td>
                
                {/* Desktop columns (hidden on mobile via the display: flex overhaul) */}
                <td className="desktop-only-cell" style={{ textAlign: 'center' }}>
                  <span className="date-text">{app.date}</span>
                </td>
                <td className="desktop-only-cell" style={{ textAlign: 'center' }}>
                  <span className="time-text">{app.time}</span>
                </td>
                <td className="desktop-only-cell" style={{ textAlign: 'center' }}>
                  <div className={`status-badge-pill ${app.status.toLowerCase()}`}>
                    {app.status}
                  </div>
                </td>
                <td className="desktop-only-cell" style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {app.status === 'Pending' && (
                      <button 
                        onClick={() => handleEdit(app)}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    )}
                    {(app.status === 'Pending' || app.status === 'Approved') && (
                      <button 
                        onClick={() => confirmCancel(app.id)}
                        style={{ padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1px solid #fecaca', background: '#fee2e2', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    )}
                    {(app.status === 'Completed' || app.status === 'Cancelled' || app.status === 'Declined') && (
                      app.is_faculty_deleted ? (
                        <button 
                          onClick={() => confirmDelete(app.id)}
                          style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                          title="Delete Record"
                        >
                          <Trash2 size={16} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Delete</span>
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0.4rem 0.8rem', background: 'var(--accent-light)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem' }} title="This record can only be cleared once the faculty member has removed it from their history.">
                          <span style={{ fontSize: '1rem' }}>🔒</span> 
                          <span>Faculty History Lock</span>
                        </div>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cancelModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'left', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.4rem' }}>Cancel Appointment?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to cancel this appointment request? This action cannot be undone.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Reason for cancellation <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea 
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                placeholder="Please tell the faculty member why you are cancelling..."
                style={{ width: '100%', minHeight: '80px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setCancelModal({ isOpen: false, reqId: null, reason: '' })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                No, Keep it
              </button>
              <button 
                onClick={executeCancel}
                style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Yes, Cancel it
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '450px', width: '95%', textAlign: 'left', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-primary)', fontSize: '1.4rem' }}>Edit Appointment Info</h2>
            
            <div style={{ marginBottom: '1.2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Subject</label>
              <input 
                type="text"
                value={editModal.subject}
                onChange={(e) => setEditModal({ ...editModal, subject: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                placeholder="What is this about?"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Details / Reason</label>
              <textarea 
                value={editModal.details}
                onChange={(e) => setEditModal({ ...editModal, details: e.target.value })}
                style={{ width: '100%', minHeight: '120px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }}
                placeholder="Provide more context for the faculty..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setEditModal({ ...editModal, isOpen: false })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button 
                onClick={executeUpdate}
                style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'left', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#ef4444', marginBottom: '1rem' }}>
              <Trash2 size={24} />
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>Delete Record?</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Are you sure you want to remove this appointment record from your history? This action is permanent and cannot be undone.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, reqId: null })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                No, Keep it
              </button>
              <button 
                onClick={executeDelete}
                style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsContent;
