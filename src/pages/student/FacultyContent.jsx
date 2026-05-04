import React, { useState, useEffect } from 'react';
import { User, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAllFaculty, getSchedulesForFaculty, submitRequest, checkActiveRequest } from '../../supabase/api';
import { subscribeToFacultyStatus } from '../../supabase/realtime';
import { FacultyCardSkeleton, toast, withMinDelay } from '../../supabase/ux';

const facultyStyles = `
.faculty-header h1 {
  font-size: 2rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.3rem;
  letter-spacing: -0.5px;
}

.faculty-header p {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.status-legend {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.8rem 1.5rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.status-legend span {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.status-legend-label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.status-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  margin-right: 2px;
}

.status-dot.green { background: #22c55e; }
.status-dot.yellow { background: #eab308; }
.status-dot.red { background: #ef4444; }

.faculty-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.faculty-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.faculty-card-top {
  background: var(--bg-secondary);
  padding: 1.2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.faculty-card-bottom {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.status-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  flex-shrink: 0;
}

.green-pill { background: #dcfce7; color: #16a34a; }
.yellow-pill { background: #fef9c3; color: #ca8a04; }
.red-pill { background: #fee2e2; color: #dc2626; }

.faculty-card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  flex: 1;
  min-width: 0;
}

.faculty-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--border-color);
  flex-shrink: 0;
  overflow: hidden;
  transition: border-color 0.3s ease;
  background: transparent;
}

.faculty-avatar.green { border-color: #22c55e; animation: pulse-green 2s infinite; }
.faculty-avatar.yellow { border-color: #eab308; animation: pulse-yellow 2s infinite; }
.faculty-avatar.red { border-color: #ef4444; }

@keyframes pulse-green {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes pulse-yellow {
  0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
  70% { box-shadow: 0 0 0 8px rgba(234, 179, 8, 0); }
  100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
}

.faculty-info {
  flex: 1;
  min-width: 0;
}

.faculty-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.1rem;
}

.faculty-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.faculty-dept {
  font-size: 0.7rem;
  color: var(--accent-orange);
  margin: 0;
  line-height: 1.2;
}

.consult-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.8rem 0;
}

.consult-table {
  width: 100%;
  margin-bottom: 1rem;
}

.consult-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
  margin-bottom: 0.4rem;
}

.consult-day { width: 35%; font-weight: 500; }
.consult-time { width: 45%; }
.consult-slots { width: 20%; text-align: right; color: var(--text-muted); }

.request-btn {
  width: 100%;
  padding: 0.6rem;
  border: none;
  border-radius: 25px;
  background: #059669;
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
}

.request-btn:hover {
  background: #047857;
  transform: translateY(-1px);
}

.request-btn:disabled {
  background: var(--card-border);
  color: var(--text-muted);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Booking Table */
.booking-back-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.booking-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.booking-table thead th {
  background: #6b7280;
  color: #fff;
  padding: 0.8rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.dashboard-fixed-wrapper.dark .booking-table thead th {
  background: #374151;
}

.booking-table tbody td {
  padding: 0.8rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.booking-table tbody tr:last-child td {
  border-bottom: none;
}

.booking-table tbody tr:nth-child(4n-3),
.booking-table tbody tr:nth-child(4n-2) {
  background: var(--bg-primary);
}

.booking-notes-row td {
  padding: 0.5rem 1rem 0.8rem 1rem !important;
  text-align: left !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.booking-notes {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #22c55e;
  font-style: italic;
  display: inline-block;
  width: 100%;
}

.book-slot-btn {
  padding: 0.4rem 1.2rem;
  border: none;
  border-radius: 6px;
  background: #22c55e;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.book-slot-btn:hover {
  background: #16a34a;
}

/* Confirmation Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--card-border);
}

.details-modal-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 450px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--card-border);
}

.form-group {
  text-align: left;
  margin-bottom: 1.2rem;
}

.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
}

.modal-icon {
  color: #22c55e;
  margin-bottom: 0.8rem;
}

.modal-card h2 {
  font-size: 1.4rem;
  color: var(--text-primary);
  font-weight: 700;
  margin: 0 0 0.8rem 0;
}

.modal-card .modal-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 1.2rem;
  line-height: 1.5;
}

.modal-details {
  text-align: left;
  margin-bottom: 1.5rem;
}

.modal-details h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.modal-details ul {
  list-style: disc;
  padding-left: 1.2rem;
  margin: 0;
}

.modal-details li {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 0.2rem;
}

.modal-done-btn {
  padding: 0.7rem 2.5rem;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-done-btn:hover {
  background: var(--card-border);
}

@media (max-width: 600px) {
  .faculty-header h1 {
    font-size: 1.5rem;
  }
  
  .status-legend {
    flex-wrap: wrap;
    gap: 0.8rem;
    padding: 0.6rem 1rem;
  }

  .faculty-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .faculty-card-top {
    padding: 0.8rem;
  }

  .faculty-card-bottom {
    padding: 0.8rem;
  }

  .faculty-avatar {
    width: 40px;
    height: 40px;
  }

  .faculty-name {
    font-size: 0.85rem;
  }

  .faculty-dept {
    font-size: 0.65rem;
  }

  .consult-row {
    padding: 0.3rem 0.5rem;
    font-size: 0.65rem;
  }

  .booking-table thead th, .booking-table tbody td {
    padding: 0.5rem 0.3rem;
    font-size: 0.75rem;
  }

  .details-modal-card {
    padding: 1.2rem;
    border-radius: 16px;
  }

  .details-modal-card h2 {
    font-size: 1.2rem;
  }

  .form-input, .form-textarea {
    padding: 0.7rem;
    font-size: 0.85rem;
  }

  .cancel-btn, .submit-btn {
    padding: 0.7rem;
    font-size: 0.9rem;
  }
}

.submit-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.2);
}
`;

const FacultyContent = () => {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyView, setFacultyView] = useState('list');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultySchedules, setFacultySchedules] = useState([]);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchFaculty = async () => {
      const data = await withMinDelay(getAllFaculty(), 300);
      const mapped = data.map(f => ({
        ...f,
        statusColor: f.status === 'Available' ? 'green' : f.status === 'Busy' ? 'yellow' : 'red'
      }));
      setFacultyList(mapped);
      setLoading(false);
    };
    fetchFaculty();

    // Real-time: faculty status changes
    const unsub = subscribeToFacultyStatus(
      (updatedList) => {
        const mapped = updatedList.map(f => ({
          ...f,
          statusColor: f.status === 'Available' ? 'green' : f.status === 'Busy' ? 'yellow' : 'red'
        }));
        setFacultyList(mapped);
      },
      () => getAllFaculty()
    );
    return () => unsub();
  }, []);

  const handleRequestAppointment = async (faculty) => {
    if (faculty.status === 'Unavailable') {
      toast.error(`${faculty.name} is currently unavailable and not accepting requests.`);
      return;
    }
    
    if (faculty.status === 'Busy') {
      toast.warning(`${faculty.name} is currently busy. Your request might take longer to be approved.`);
    }

    setSelectedFaculty(faculty);
    setLoading(true);
    const schedules = await getSchedulesForFaculty(faculty.id);
    setFacultySchedules(schedules);
    setLoading(false);
    setFacultyView('booking');
  };

  const handleBookSlot = async (slot) => {
    if (!user || !selectedFaculty) return;
    
    // Check for active request
    const hasActive = await checkActiveRequest(user.id, selectedFaculty.id);
    if (hasActive) {
      toast.error('You already have an active request with this faculty member.');
      return;
    }

    setSelectedSlot(slot);
    setShowDetailsModal(true);
  };

  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!user || !selectedSlot) return;

    const requestData = {
      student_id: user.id,
      faculty_id: selectedFaculty.id,
      schedule_id: selectedSlot.id,
      subject: subject,
      details: reason,
      status: 'Pending',
      request_date: new Date().toISOString().split('T')[0]
    };

    const result = await submitRequest(requestData);
    if (result) {
      setShowDetailsModal(false);
      setShowConfirmation(true);
      toast.success('Request sent! Awaiting faculty approval');
    } else {
      toast.error('Failed to submit request. Please try again.');
    }
  };

  const handleCancelDetails = () => {
    setShowDetailsModal(false);
    setSubject('');
    setReason('');
  };

  const handleDone = () => {
    setShowConfirmation(false);
    setShowDetailsModal(false);
    setSelectedSlot(null);
    setSelectedFaculty(null);
    setSubject('');
    setReason('');
    setFacultyView('list');
  };

  return (
    <>
      <style>{facultyStyles}</style>

      <div className="faculty-header">
        <h1>Faculty Directory</h1>
        <p>View real-time availability of CCS faculty members</p>
      </div>

      {facultyView === 'list' && (
        <>
          <div className="status-legend">
            <span className="status-legend-label">Status:</span>
            <span><span className="status-dot green"></span>Available</span>
            <span><span className="status-dot yellow"></span>Busy</span>
            <span><span className="status-dot red"></span>Unavailable</span>
          </div>

          <div className="faculty-grid">
            {loading ? (
              <FacultyCardSkeleton count={3} />
            ) : facultyList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No faculty found.</p>
            ) : facultyList.map((faculty, idx) => (
              <div className="faculty-card" key={idx}>
                <div className="faculty-card-top">
                  <div className="faculty-card-header">
                    <div className={`faculty-avatar ${faculty.statusColor}`}>
                      <img src={faculty.avatar} alt={faculty.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div className="faculty-info">
                      <div className="faculty-name-row">
                        <h4 className="faculty-name">{faculty.name}</h4>
                        <div className={`status-pill ${faculty.statusColor}-pill`}>
                          <span className={`status-dot ${faculty.statusColor}`}></span>
                          {faculty.status}
                        </div>
                      </div>
                      <p className="faculty-dept">{faculty.dept}</p>
                    </div>
                  </div>
                </div>

                <div className="faculty-card-bottom">
                  <button
                    className="request-btn"
                    onClick={() => handleRequestAppointment(faculty)}
                    disabled={faculty.status === 'Unavailable'}
                    style={faculty.status === 'Unavailable' ? { background: 'var(--card-border)', cursor: 'not-allowed', color: 'var(--text-muted)' } : {}}
                  >
                    {faculty.status === 'Unavailable' ? 'Currently Unavailable' : 'View Schedules & Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {facultyView === 'booking' && selectedFaculty && (
        <>
          <button 
            onClick={() => setFacultyView('list')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-orange)', 
              cursor: 'pointer',
              marginBottom: '1rem',
              fontWeight: 600
            }}
          >
            &larr; Back to Directory
          </button>
          <p className="booking-back-text">Available schedules for <strong>{selectedFaculty.name}</strong></p>
          
          <div className="booking-table-container">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Time & Room</th>
                  <th>Slots Left</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4">Loading schedules...</td></tr>
                ) : facultySchedules.length === 0 ? (
                  <tr><td colSpan="4">No available schedules for this faculty.</td></tr>
                ) : facultySchedules.map((slot, i) => (
                  <React.Fragment key={i}>
                    <tr>
                      <td style={slot.notes ? { borderBottom: 'none' } : {}}><strong>{slot.day}</strong></td>
                      <td style={slot.notes ? { borderBottom: 'none' } : {}}>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}<br/>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room {slot.room || 'TBA'}</span>
                      </td>
                      <td style={slot.notes ? { borderBottom: 'none' } : {}}>{slot.max_slots - (slot.filled || 0)} / {slot.max_slots}</td>
                      <td style={slot.notes ? { borderBottom: 'none' } : {}}>
                        <button className="book-slot-btn" onClick={() => handleBookSlot(slot)}>
                          Request Slot
                        </button>
                      </td>
                    </tr>
                    {slot.notes && (
                      <tr className="booking-notes-row">
                        <td colSpan="4">
                          <div className="booking-notes">
                            <strong>Note from Faculty:</strong> "{slot.notes}"
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showDetailsModal && selectedSlot && selectedFaculty && (
        <div className="modal-overlay">
          <div className="details-modal-card">
            <h2>Consultation Details</h2>
            <p className="subtitle">Provide details for your appointment</p>
            
            <div className="details-info-box" style={{ background: 'var(--accent-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <strong>{selectedFaculty.name}</strong> • {selectedSlot.day} • {selectedSlot.start_time.slice(0, 5)} - {selectedSlot.end_time.slice(0, 5)}
            </div>

            <form onSubmit={handleSubmitDetails}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g Discrete Structure"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason/ Details</label>
                <textarea 
                  className="form-textarea"
                  style={{ width: '100%', minHeight: '100px', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  placeholder="Describe what you need help with...."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="cancel-btn" style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer' }} onClick={handleCancelDetails}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmation && selectedSlot && selectedFaculty && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">
              <CheckCircle size={50} />
            </div>
            <h2>Appointment Request Sent!</h2>
            <p className="modal-desc">
              Your request has been submitted. It will stay in "Pending" until the Faculty member approves it.
            </p>
            <div className="modal-details">
              <h4>Request Summary:</h4>
              <ul style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <li>Faculty: {selectedFaculty.name}</li>
                <li>Time: {selectedSlot.day}, {selectedSlot.start_time.slice(0, 5)} - {selectedSlot.end_time.slice(0, 5)}</li>
              </ul>
            </div>
            <button className="modal-done-btn" style={{ marginTop: '1.5rem', width: '100%' }} onClick={handleDone}>Return to Directory</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyContent;
