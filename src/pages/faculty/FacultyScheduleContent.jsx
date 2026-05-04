import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, X, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultySchedules, createSchedule, updateSchedule, deleteSchedule } from '../../supabase/api';
import { subscribeToSchedules } from '../../supabase/realtime';
import { toast, optimistic, ScheduleCardSkeleton, withMinDelay } from '../../supabase/ux';

const scheduleStyles = `
.schedule-container {
  animation: fadeIn 0.4s ease;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.header-title h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.header-title p {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin: 0.1rem 0 0 0;
}

.add-schedule-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-orange);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-schedule-btn:hover {
  background: #f97316;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(234, 88, 12, 0.35);
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.schedule-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  position: relative;
  transition: all 0.2s;
}

.schedule-card:hover {
  border-color: var(--accent-orange);
  box-shadow: var(--shadow);
}

.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.8rem;
}

.action-icon-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-btn:hover {
  background: var(--accent-light);
  color: var(--accent-orange);
}

.card-day {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.1rem;
}

.card-time {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.6rem;
}

.card-notes {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-primary);
  padding: 0.6rem;
  border-radius: 8px;
  border-left: 3px solid var(--accent-orange);
  margin-bottom: 1.5rem;
  font-style: italic;
}

.slots-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
}

.slots-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  width: 40px;
}

.progress-container {
  flex: 1;
  height: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #16a34a;
  transition: width 0.4s ease;
}

.slots-ratio {
  font-size: 0.8rem;
  color: var(--text-muted);
  width: 40px;
  text-align: right;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: var(--bg-secondary);
  width: 100%;
  max-width: 400px;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: var(--shadow);
  animation: slideUp 0.3s ease;
}

.modal-content h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 0.4rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus, .form-select:focus {
  border-color: var(--accent-orange);
}

.time-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.time-input-wrapper {
  position: relative;
}

.time-input-wrapper .clock-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.modal-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-btn {
  padding: 0.8rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  border: none;
}

.btn-cancel {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-submit {
  background: var(--accent-orange);
  color: white;
}

.btn-submit:hover {
  filter: brightness(1.1);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@media (max-width: 800px) {
  .schedule-grid { grid-template-columns: 1fr; }
}
`;

const FacultyScheduleContent = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    day: 'Monday',
    startTime: '07:00',
    endTime: '07:30',
    total: 5,
    room: '',
    notes: ''
  });

  // Fetch schedules from Supabase
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const data = await withMinDelay(getFacultySchedules(user.id), 300);
      setSchedules(data);
      setLoading(false);
    };
    load();

    // Subscribe to real-time changes
    const unsub = subscribeToSchedules(user.id, setSchedules, () => getFacultySchedules(user.id));
    return () => unsub();
  }, [user]);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ day: 'Monday', startTime: '07:00', endTime: '07:30', total: 5, room: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      day: item.day,
      startTime: String(item.start_time).slice(0, 5),
      endTime: String(item.end_time).slice(0, 5),
      total: item.max_slots,
      room: item.room || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const executeDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;
    setDeleteModal({ isOpen: false, id: null });

    await optimistic(
      setSchedules,
      schedules,
      schedules.filter(s => s.id !== id),
      () => deleteSchedule(id),
      { success: 'Schedule removed', error: 'Failed to delete schedule' }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start_time = formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime;
    const end_time = formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime;

    if (editingItem) {
      // EDIT — optimistic update
      const updates = {
        day: formData.day,
        start_time,
        end_time,
        room: formData.room || 'TBA',
        max_slots: parseInt(formData.total),
        notes: formData.notes
      };

      const optimisticList = schedules.map(s =>
        s.id === editingItem.id ? { ...s, ...updates } : s
      );

      setIsModalOpen(false);
      await optimistic(
        setSchedules,
        schedules,
        optimisticList,
        () => updateSchedule(editingItem.id, updates),
        { success: 'Schedule updated', error: 'Failed to update schedule' }
      );
    } else {
      // ADD — optimistic insert
      const scheduleData = {
        faculty_id: user.id,
        day: formData.day,
        start_time,
        end_time,
        room: formData.room || 'TBA',
        max_slots: parseInt(formData.total),
        notes: formData.notes
      };

      // Use a temporary ID for optimistic rendering
      const tempId = `temp-${Date.now()}`;
      const optimisticItem = { ...scheduleData, id: tempId, filled: 0 };
      const optimisticList = [...schedules, optimisticItem];

      setIsModalOpen(false);

      const success = await optimistic(
        setSchedules,
        schedules,
        optimisticList,
        async () => {
          const result = await createSchedule(scheduleData);
          if (!result) throw new Error('Create failed');
          // Replace temp item with real one from server
          setSchedules(prev => prev.map(s => s.id === tempId ? { ...result, filled: 0 } : s));
          return result;
        },
        { success: 'Schedule added successfully', error: 'Failed to add schedule' }
      );
    }
  };

  return (
    <div className="schedule-container">
      <style>{scheduleStyles}</style>

      <div className="schedule-header">
        <div className="header-title">
          <h2>My Consultation Schedule</h2>
          <p>Add, edit, or remove your consultation slots</p>
        </div>
        <button className="add-schedule-btn" onClick={handleAdd}>
          <Plus size={20} /> Add Schedule
        </button>
      </div>

      <div className="schedule-grid">
        {loading ? <ScheduleCardSkeleton count={4} /> : schedules.map((item) => (
          <div className="schedule-card" key={item.id}>
            <div className="card-actions">
              <button className="action-icon-btn" onClick={() => handleEdit(item)} title="Edit">
                <Edit2 size={16} />
              </button>
              <button className="action-icon-btn" onClick={() => confirmDelete(item.id)} title="Delete">
                <Trash2 size={16} />
              </button>
            </div>

            <div className="card-day">{item.day}</div>
            <div className="card-time">{String(item.start_time).slice(0, 5)} - {String(item.end_time).slice(0, 5)}</div>
            
            {item.notes && <div className="card-notes">"{item.notes}"</div>}

            <div className="slots-info">
              <span className="slots-label">Slots</span>
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${((item.filled || 0) / item.max_slots) * 100}%` }}
                ></div>
              </div>
              <span className="slots-ratio">{item.filled || 0}/{item.max_slots}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingItem ? 'Edit Schedule' : 'Add Schedule'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Day</label>
                <select 
                  className="form-select"
                  value={formData.day}
                  onChange={(e) => setFormData({...formData, day: e.target.value})}
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="time-inputs">
                <div className="form-group">
                  <label>Start Time</label>
                  <div className="time-input-wrapper">
                    <input 
                      type="time" 
                      className="form-input"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <div className="time-input-wrapper">
                    <input 
                      type="time" 
                      className="form-input"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Max slot</label>
                <input 
                  type="number" 
                  className="form-input"
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: e.target.value})}
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Room</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={formData.room}
                  onChange={(e) => setFormData({...formData, room: e.target.value})}
                  placeholder="e.g. 521"
                />
              </div>

              <div className="form-group">
                <label>Notes for Students (Optional)</label>
                <textarea 
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="e.g. Please bring your draft proposal."
                  style={{ minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn btn-submit">{editingItem ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '2.5rem', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h2 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1.4rem' }}>Delete Schedule?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Are you sure you want to remove this consultation slot? Students will no longer be able to book it.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
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

export default FacultyScheduleContent;
