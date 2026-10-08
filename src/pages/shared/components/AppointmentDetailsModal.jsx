import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatDate } from '../../../utils/dateUtils';

// Shared "View Details" modal used by both student and faculty sides.
// Edit here → both sides reflect the change.
//
// Props:
//   app       — the appointment object (from getStudentRequests / getFacultyRequests)
//   refId     — reference display id (e.g. "REF0001")
//   role      — 'student' | 'faculty' (controls who the "with X" line names)
//   timeStr   — formatted time range to display
//   onClose   — close handler
//   actions   — optional array of { label, variant, onClick } to render as footer buttons
//               variant: 'danger' | 'secondary' | 'primary' (defaults to 'primary')

const OVERLAY = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const CARD = {
  background: '#fff', borderRadius: 14, maxWidth: 480, width: '92%',
  maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
};
const PAD = { padding: '1.5rem 1.6rem 1.4rem' };

const badge = (status) => {
  const styles = {
    Pending:   { bg: '#fef3c7', fg: '#92400e' },
    Approved:  { bg: '#dcfce7', fg: '#166534' },
    Declined:  { bg: '#fee2e2', fg: '#b91c1c' },
    Completed: { bg: '#dbeafe', fg: '#1e3a8a' },
    Cancelled: { bg: '#f3f4f6', fg: '#4b5563' },
  }[status] || { bg: '#f3f4f6', fg: '#4b5563' };
  return {
    fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px',
    borderRadius: 999, background: styles.bg, color: styles.fg,
    textTransform: 'uppercase', letterSpacing: '0.04em',
  };
};

const btnStyle = (variant) => {
  const base = {
    flex: 1, padding: '0.72rem', borderRadius: 9, fontWeight: 700,
    fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
  };
  if (variant === 'danger') {
    return { ...base, border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#ef4444' };
  }
  if (variant === 'secondary') {
    return { ...base, border: '1.5px solid #e5e8f0', background: '#fff', color: '#1f2937' };
  }
  return { ...base, border: 'none', background: '#1a2d5a', color: '#fff' };
};

const AppointmentDetailsModal = ({ app, refId, role = 'student', timeStr, onClose, actions = [] }) => {
  if (!app) return null;
  const otherParty = role === 'student'
    ? app.name || app.facultyName
    : app.name || app.studentName;

  return (
    <div style={OVERLAY} onClick={onClose}>
      <div style={CARD} onClick={e => e.stopPropagation()}>
        <div style={PAD}>
          {refId && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.3rem' }}>
              {refId}
            </div>
          )}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1f2937', margin: '0 0 0.8rem 0' }}>
            Appointment Details
          </h2>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.2rem' }}>
                {app.subject || 'Consultation'}
              </div>
              <div style={{ fontSize: '0.83rem', color: '#6b7280' }}>
                {role === 'student' ? 'with' : 'from'} {otherParty}
              </div>
            </div>
            <span style={{ ...badge(app.status), flexShrink: 0, marginTop: 2 }}>{app.status}</span>
          </div>

          <div style={{
            background: '#f0f7ff', border: '1px solid #c7dff7', borderRadius: 12,
            padding: '1rem 1.2rem', marginBottom: '1.1rem',
            display: 'flex', flexDirection: 'column', gap: '0.55rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1f2937', fontWeight: 500 }}>
              <Calendar size={15} style={{ color: '#1a2d5a', flexShrink: 0 }} />
              <span>{formatDate(app.date)}</span>
              <Clock size={15} style={{ color: '#1a2d5a', flexShrink: 0, marginLeft: '0.8rem' }} />
              <span>{timeStr || app.time}</span>
            </div>
            {app.room && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1f2937', fontWeight: 500 }}>
                <MapPin size={15} style={{ color: '#1a2d5a', flexShrink: 0 }} />
                <span>Room {app.room}</span>
              </div>
            )}
          </div>

          {app.details && (
            <div style={{ background: '#fafbff', border: '1px solid #e5e8f0', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.82rem', color: '#374151', marginBottom: '0.8rem' }}>
              <strong style={{ color: '#1f2937' }}>Notes:</strong> {app.details}
            </div>
          )}

          {app.facultyNote && (
            <div style={{ background: '#f0f7ff', border: '1px solid #c7dff7', borderLeft: '3px solid #1a2d5a', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.82rem', marginBottom: '0.8rem' }}>
              <strong>Faculty Note:</strong> "{app.facultyNote}"
            </div>
          )}

          {app.status === 'Declined' && app.declineReason && (
            <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderLeft: '3px solid #ef4444', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.82rem', marginBottom: '0.8rem', color: '#b91c1c' }}>
              <strong>Decline Reason:</strong> "{app.declineReason}"
            </div>
          )}

          {app.status === 'Cancelled' && app.cancelReason && (
            <div style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderLeft: '3px solid #6b7280', borderRadius: 8, padding: '0.7rem 0.9rem', fontSize: '0.82rem', marginBottom: '0.8rem', color: '#4b5563' }}>
              <strong>Cancel Reason:</strong> "{app.cancelReason}"
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.7rem' }}>
            {actions.map((a, i) => (
              <button key={i} onClick={a.onClick} style={btnStyle(a.variant)}>
                {a.label}
              </button>
            ))}
            <button onClick={onClose} style={btnStyle(actions.length === 0 ? 'primary' : 'secondary')}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsModal;
