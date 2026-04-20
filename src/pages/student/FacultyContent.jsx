import React, { useState } from 'react';
import { User, CheckCircle } from 'lucide-react';

const facultyStyles = `
.faculty-header h1 {
  font-size: 2rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.3rem;
  letter-spacing: -0.5px;
}

.faculty-header p {
  color: #9ca3af;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.status-legend {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.8rem 1.5rem;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.status-legend span {
  font-size: 0.85rem;
  color: #4b5563;
  font-weight: 500;
}

.status-legend-label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.85rem;
}

.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
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
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  position: relative;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}

.faculty-card-top {
  background: #e5e7eb;
  padding: 1.2rem;
  border-bottom: 1px solid #d1d5db;
  position: relative;
}

.faculty-card-bottom {
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.status-pill {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
}

.green-pill { background: #dcfce7; color: #16a34a; }
.yellow-pill { background: #fef9c3; color: #ca8a04; }
.red-pill { background: #fee2e2; color: #dc2626; }

.faculty-card-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.faculty-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  flex-shrink: 0;
}

.faculty-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.faculty-dept {
  font-size: 0.65rem;
  color: #ea580c;
  margin: 0;
  line-height: 1.2;
}

/* Replaced by status-pill */

.consult-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1f2937;
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
  color: #4b5563;
  background: #f3f4f6;
  margin-bottom: 0.4rem;
}

.consult-day { width: 35%; font-weight: 500; }
.consult-time { width: 45%; }
.consult-slots { width: 20%; text-align: right; color: #9ca3af; }

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
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* Booking Table */
.booking-back-text {
  color: #4b5563;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.booking-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.booking-table thead th {
  background: #6b7280;
  color: #fff;
  padding: 0.8rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
}

.booking-table tbody td {
  padding: 0.8rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: #4b5563;
  border-bottom: 1px solid #e5e7eb;
}

.booking-table tbody tr:last-child td {
  border-bottom: none;
}

.booking-table tbody tr:nth-child(even) {
  background: #f9fafb;
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
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15);
}

.modal-icon {
  color: #22c55e;
  margin-bottom: 0.8rem;
}

.modal-card h2 {
  font-size: 1.4rem;
  color: #1f2937;
  font-weight: 700;
  margin: 0 0 0.8rem 0;
}

.modal-card .modal-desc {
  font-size: 0.85rem;
  color: #6b7280;
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
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.modal-details ul {
  list-style: disc;
  padding-left: 1.2rem;
  margin: 0;
}

.modal-details li {
  font-size: 0.82rem;
  color: #4b5563;
  margin-bottom: 0.2rem;
}

.modal-done-btn {
  padding: 0.7rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  color: #1f2937;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-done-btn:hover {
  background: #f3f4f6;
}

@media (max-width: 768px) {
  .faculty-grid {
    grid-template-columns: 1fr;
  }
}
`;

const facultyData = [
  {
    name: 'Mr. Kenneth Bautista',
    dept: 'CCS-Computer Science / coor',
    status: 'Available',
    statusColor: 'green',
    avatarBg: '#99f6e4',
    avatarColor: '#0d9488',
    schedule: [
      { day: 'Monday', time: '8:00am-8:30am', slots: '3 slots' },
      { day: 'Tuesday', time: '2:00pm-2:45pm', slots: '5 slots' },
      { day: 'Wednesday', time: '7:00am-7:30am', slots: '3 slots' },
    ],
    bookingSlots: [
      { day: 'Monday', date: '04/06/26', time: '7:00am-7:30am', slots: '3 slots' },
      { day: 'Monday', date: '04/06/26', time: '2:00pm-2:45pm', slots: '2 slots' },
      { day: 'Wednesday', date: '04/08/26', time: '2:00pm-2:45pm', slots: '2 slots' },
      { day: 'Thursday', date: '04/09/26', time: '3:00pm-3:45pm', slots: '5 slots' },
      { day: 'Friday', date: '04/10/26', time: '10:00am-11:00pm', slots: '5 slots' },
      { day: 'Friday', date: '04/10/26', time: '2:00pm-2:45pm', slots: '2 slots' },
    ],
  },
  {
    name: 'Mr. Reynaldo Bautista Jr.',
    dept: 'CCS-Information Technology/ coor',
    status: 'Busy',
    statusColor: 'yellow',
    avatarBg: '#e9d5ff',
    avatarColor: '#7c3aed',
    schedule: [
      { day: 'Monday', time: '8:00am-8:30am', slots: '3 slots' },
      { day: 'Tuesday', time: '2:00pm-2:45pm', slots: '5 slots' },
      { day: 'Wednesday', time: '7:00am-7:30am', slots: '3 slots' },
    ],
    bookingSlots: [
      { day: 'Monday', date: '04/06/26', time: '7:00am-7:30am', slots: '3 slots' },
      { day: 'Monday', date: '04/06/26', time: '2:00pm-2:45pm', slots: '2 slots' },
      { day: 'Wednesday', date: '04/08/26', time: '2:00pm-2:45pm', slots: '2 slots' },
      { day: 'Thursday', date: '04/09/26', time: '3:00pm-3:45pm', slots: '5 slots' },
      { day: 'Friday', date: '04/10/26', time: '10:00am-11:00pm', slots: '5 slots' },
      { day: 'Friday', date: '04/10/26', time: '2:00pm-2:45pm', slots: '2 slots' },
    ],
  },
  {
    name: 'Mr. Loudel Manaloto',
    dept: 'CCS-Entertainment & Multimedia Computing / coor',
    status: 'Unavailable',
    statusColor: 'red',
    avatarBg: '#bfdbfe',
    avatarColor: '#2563eb',
    schedule: [
      { day: 'Monday', time: '8:00am-8:30am', slots: '3 slots' },
      { day: 'Tuesday', time: '2:00pm-2:45pm', slots: '5 slots' },
      { day: 'Wednesday', time: '7:00am-7:30am', slots: '3 slots' },
    ],
    bookingSlots: [],
  },
];

const FacultyContent = () => {
  const [facultyView, setFacultyView] = useState('list');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleRequestAppointment = (faculty) => {
    setSelectedFaculty(faculty);
    setFacultyView('booking');
  };

  const handleBookSlot = (slot) => {
    setSelectedSlot(slot);
    setShowConfirmation(true);
  };

  const handleDone = () => {
    setShowConfirmation(false);
    setSelectedSlot(null);
    setSelectedFaculty(null);
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
            {facultyData.map((faculty, idx) => (
              <div className="faculty-card" key={idx}>
                <div className="faculty-card-top">
                  <div className={`status-pill ${faculty.statusColor}-pill`}>
                    <span className={`status-dot ${faculty.statusColor}`}></span>
                    {faculty.status}
                  </div>
                  <div className="faculty-card-header">
                    <div className="faculty-avatar" style={{ background: faculty.avatarBg }}>
                      <User size={26} style={{ color: faculty.avatarColor }} />
                    </div>
                    <div>
                      <h4 className="faculty-name">{faculty.name}</h4>
                      <p className="faculty-dept">{faculty.dept}</p>
                    </div>
                  </div>
                </div>

                <div className="faculty-card-bottom">
                  <h5 className="consult-title">Consultation Availability</h5>
                  <div className="consult-table">
                    {faculty.schedule.map((row, i) => (
                      <div className="consult-row" key={i}>
                        <span className="consult-day">{row.day}</span>
                        <span className="consult-time">{row.time}</span>
                        <span className="consult-slots">{row.slots}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="request-btn"
                    disabled={faculty.status === 'Unavailable'}
                    onClick={() => handleRequestAppointment(faculty)}
                  >
                    Request an Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {facultyView === 'booking' && selectedFaculty && (
        <>
          <p className="booking-back-text">Book an appointment for <strong>{selectedFaculty.name}</strong></p>
          <table className="booking-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Time</th>
                <th>Available Slot</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedFaculty.bookingSlots.map((slot, i) => (
                <tr key={i}>
                  <td>{slot.day}</td>
                  <td>{slot.date}</td>
                  <td>{slot.time}</td>
                  <td>{slot.slots}</td>
                  <td>
                    <button className="book-slot-btn" onClick={() => handleBookSlot(slot)}>
                      Book Slot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showConfirmation && selectedSlot && selectedFaculty && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">
              <CheckCircle size={50} />
            </div>
            <h2>Appointment Request Sent!</h2>
            <p className="modal-desc">
              A consultation request has been submitted. This will remain in pending status until the Faculty approves or adjusts.
            </p>
            <div className="modal-details">
              <h4>Request Details:</h4>
              <ul>
                <li>Faculty: {selectedFaculty.name}</li>
                <li>Date: {selectedSlot.day}, {selectedSlot.date}</li>
                <li>Time: {selectedSlot.time}</li>
              </ul>
            </div>
            <button className="modal-done-btn" onClick={handleDone}>Done</button>
          </div>
        </div>
      )}
    </>
  );
};

export default FacultyContent;
