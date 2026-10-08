import React, { useState, useEffect } from 'react';
import { CheckCircle, WifiOff, Search, Users, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getAllFaculty, getSchedulesForFaculty, submitRequest, checkActiveRequest, checkActiveRequestForSlot, getActiveRequestCount, isDateBlocked } from '../../supabase/api';
import { subscribeToFacultyStatus } from '../../supabase/realtime';
import { FacultyCardSkeleton, toast, withMinDelay } from '../../supabase/ux';
import { formatTimeRange } from '../../utils/dateUtils';
import { MAX_ACTIVE_REQUESTS } from '../../utils/constants';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

const facultyStyles = `
.faculty-header {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 16px;
  padding: 1rem 1.4rem;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 12px rgba(46,74,135,0.08), 0 1px 3px rgba(0,0,0,0.05);
}

.faculty-header p.subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
}

.search-box-faculty {
  position: relative;
  margin-bottom: 1.2rem;
}

.search-icon-faculty {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-box-faculty input {
  width: 100%;
  padding: 0.65rem 1rem 0.65rem 2.6rem;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  box-shadow: var(--shadow);
}

.search-box-faculty input:focus {
  border-color: var(--accent, #2e4a87);
}

.faculty-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.faculty-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  box-shadow: var(--shadow);
  transition: box-shadow 0.15s, border-color 0.15s;
}
.faculty-card:hover {
  box-shadow: 0 4px 18px rgba(0,0,0,0.1);
  border-color: var(--accent, #2e4a87);
}

.faculty-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #2e4a87;
}

.faculty-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.faculty-info {
  flex: 1;
  min-width: 0;
}

.faculty-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.1rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.faculty-dept {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0 0 0.35rem 0;
  font-weight: 500;
}

.faculty-next-slot {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.faculty-next-slot svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.faculty-status-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-bottom: 0.2rem;
}

.faculty-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.request-btn {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--accent, #2e4a87);
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  flex-shrink: 0;
  font-family: inherit;
  white-space: nowrap;
}

.request-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.request-btn:disabled {
  background: var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
  opacity: 1;
}

/* ── Booking Modal ── */
.bk-modal {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: scPopIn 0.18s ease;
}

.bk-modal-header {
  background: #1a2d5a;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-align: center;
  padding: 1.1rem 2.5rem;
  border-radius: 16px 16px 0 0;
}

.bk-modal-body {
  padding: 1.4rem 1.6rem 1.8rem;
}

.bk-date-label {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  margin-bottom: 0.8rem;
  text-transform: uppercase;
}

.bk-date-strip {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.2rem;
  overflow-x: auto;
  scrollbar-width: none;
}
.bk-date-strip::-webkit-scrollbar { display: none; }

.bk-date-cell {
  flex: 1;
  min-width: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.6rem 0.4rem;
  border-radius: 10px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.bk-date-cell:hover { border-color: #3d5fa8; background: #eef2fb; }
.bk-date-cell.selected {
  background: #1a2d5a;
  border-color: #1a2d5a;
  color: #fff;
  font-weight: 800;
}
.bk-date-cell.selected .bk-date-cell-day,
.bk-date-cell.selected .bk-date-cell-num,
.bk-date-cell.selected .bk-date-cell-sub { font-weight: 800 !important; }
.bk-date-cell.no-hours { opacity: 0.55; }

.bk-date-cell-day {
  font-size: 0.62rem;
  font-weight: 600;
  color: inherit;
  opacity: 0.7;
}
.bk-date-cell.selected .bk-date-cell-day { opacity: 0.85; }

.bk-date-cell-num {
  font-size: 1.1rem;
  font-weight: 800;
  color: inherit;
  line-height: 1;
}

.bk-date-cell-sub {
  font-size: 0.58rem;
  font-weight: 700;
  color: inherit;
  opacity: 0.7;
}
.bk-date-cell.selected .bk-date-cell-sub { opacity: 0.85; }

.bk-day-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1a2d5a;
  margin-bottom: 0.8rem;
}

.bk-empty {
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 0.5rem 0;
}

.bk-slot-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.6rem;
  transition: border-color 0.15s;
}
.bk-slot-row:hover { border-color: #1a2d5a; }
.bk-slot-row.full { opacity: 0.55; }
.bk-slot-row:last-child { margin-bottom: 0; }

.bk-slot-info { flex: 1; min-width: 0; }
.bk-slot-time { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); }
.bk-slot-meta { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; display: flex; gap: 0.4rem; flex-wrap: wrap; }
.bk-slot-tag { background: var(--accent-light); color: #1a2d5a; font-size: 0.6rem; font-weight: 700; padding: 1px 6px; border-radius: 5px; }
.bk-slot-notes { font-size: 0.7rem; color: var(--text-muted); font-style: italic; margin-top: 3px; }

.bk-slot-cap { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; min-width: 60px; }
.bk-slot-cap-text { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); }
.bk-cap-bar { width: 60px; height: 4px; border-radius: 4px; background: var(--border-color); overflow: hidden; }
.bk-cap-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }

.bk-slot-btn {
  padding: 0.45rem 1rem;
  border: none;
  border-radius: 8px;
  background: #1a2d5a;
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.bk-slot-btn:hover { opacity: 0.85; }
.bk-slot-btn:disabled { background: var(--border-color); color: var(--text-muted); cursor: not-allowed; }

.bk-close-btn {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
}
.bk-close-btn:hover { color: #fff; }

.bk-day-sub {
  font-size: 0.75rem;
  color: #1a2d5a;
  font-weight: 600;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
}

.bk-section-label {
  font-size: 0.63rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.55rem;
  margin-top: 1rem;
}

.bk-time-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.bk-time-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  text-align: center;
}
.bk-time-chip:hover:not(:disabled) { border-color: #3d5fa8; background: #eef2fb; }
.bk-time-chip.selected {
  background: #e0e8f7;
  border-color: #1a2d5a;
}
.bk-time-chip.selected .bk-chip-time,
.bk-time-chip.selected .bk-chip-room { font-weight: 800 !important; color: #1a2d5a !important; }
.bk-time-chip.full { opacity: 0.45; cursor: not-allowed; }
.bk-chip-time { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); }
.bk-chip-room { font-size: 0.68rem; color: var(--text-muted); }

.bk-dropdown-wrap { position: relative; margin-bottom: 0.4rem; }
.bk-dropdown-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-primary, #f0f2f8);
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
  color: var(--text-primary);
}
.bk-dropdown-trigger:hover { border-color: #1a2d5a; }
.bk-dropdown-arrow { font-size: 0.8rem; color: var(--text-muted); }
.bk-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: var(--card-bg, #fff);
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  z-index: 10;
  overflow: hidden;
}
.bk-dropdown-item {
  width: 100%;
  padding: 0.65rem 0.9rem;
  text-align: left;
  background: none;
  border: none;
  font-size: 0.85rem;
  font-family: inherit;
  color: var(--text-primary);
  cursor: pointer;
  transition: background 0.12s;
}
.bk-dropdown-item:hover { background: var(--bg-primary, #f0f2f8); }
.bk-dropdown-item.active { font-weight: 700; color: #1a2d5a; }

.bk-textarea {
  width: 100%;
  min-height: 80px;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
  margin-bottom: 1rem;
}
.bk-textarea:focus { border-color: #1a2d5a; }

.bk-actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 0.5rem;
}
.bk-submit-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: #1a2d5a;
  color: #fff;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s;
}
.bk-submit-btn:hover { opacity: 0.88; }
.bk-cancel-btn {
  padding: 0.75rem 1.4rem;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
}
.bk-cancel-btn:hover { border-color: #1a2d5a; color: #1a2d5a; }

/* Booking view */
.booking-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1.5px solid var(--accent, #2e4a87);
  color: var(--accent, #2e4a87);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  margin-bottom: 1.2rem;
  font-family: inherit;
  transition: background 0.18s;
}
.booking-back-btn:hover { background: var(--accent-light); }

.booking-faculty-hero {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1.4rem 1.6rem;
  margin-bottom: 1.4rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  box-shadow: var(--shadow);
}
.booking-faculty-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent, #2e4a87);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  flex-shrink: 0;
  overflow: hidden;
  border: 2.5px solid var(--border-color);
}
.booking-faculty-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.booking-faculty-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.15rem 0;
}
.booking-faculty-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.booking-slots-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.booking-slot-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  margin-bottom: 0.75rem;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.booking-slot-card:hover { border-color: var(--accent, #2e4a87); box-shadow: 0 4px 16px rgba(79,70,229,0.1); }
.booking-slot-card.full { opacity: 0.6; }

.booking-slot-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--accent, #2e4a87);
}
.booking-slot-card.full .booking-slot-dot { background: #9ca3af; }

.booking-slot-info { flex: 1; min-width: 0; }
.booking-slot-day {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}
.booking-slot-time {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.booking-slot-tag {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--accent-light);
  color: var(--accent, #2e4a87);
}

.booking-slot-cap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 70px;
}
.booking-slot-cap-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
}
.booking-cap-bar {
  width: 70px;
  height: 5px;
  border-radius: 4px;
  background: var(--border-color);
  overflow: hidden;
}
.booking-cap-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.book-slot-btn {
  padding: 0.5rem 1.1rem;
  border: none;
  border-radius: 9px;
  background: var(--accent, #2e4a87);
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s, transform 0.1s;
  flex-shrink: 0;
  white-space: nowrap;
}
.book-slot-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.book-slot-btn:disabled {
  background: var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
  transform: none;
}

.booking-slot-notes {
  margin-top: 0.6rem;
  font-size: 0.76rem;
  color: var(--text-secondary);
  background: var(--bg-primary, #f0f2f8);
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  border-left: 3px solid var(--accent, #2e4a87);
  font-style: italic;
}

@keyframes checkPop {
  0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
  60%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  80%  { transform: scale(0.92) rotate(-2deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
.check-success-icon {
  animation: checkPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both;
  display: inline-flex;
}

/* Confirmation Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  border: 1px solid var(--card-border);
}

.details-modal-card {
  background: var(--card-bg, #fff);
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
  background: var(--bg-primary, #f0f2f8);
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

.details-modal-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.details-modal-card .subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  background: var(--bg-primary, #f0f2f8);
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

.details-info-box {
  background: var(--accent-light);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
  text-align: center;
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.cancel-btn {
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
}

.cancel-btn:hover {
  background: var(--border-color);
}

.submit-btn {
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  background: var(--accent, #2e4a87);
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #4338ca;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
}
`;

const FacultyContent = ({ initialFacultyId = null }) => {
  const { user } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [facultyView, setFacultyView] = useState('list');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultySchedules, setFacultySchedules] = useState([]);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [subject, setSubject] = useState('');
  const [reason, setReason] = useState('');
  const [submittedReqId, setSubmittedReqId] = useState(null);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(null);
  const [topicOpen, setTopicOpen] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const fetchFaculty = async () => {
      const data = await withMinDelay(getAllFaculty(), 300);
      const DAY_ORDER = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const today = new Date();
      const todayIdx = today.getDay();

      const mapped = await Promise.all(data.map(async f => {
        const schedules = await getSchedulesForFaculty(f.id);
        let nextSlot = null;
        if (schedules.length > 0) {
          const recurring = schedules.filter(s => s.schedule_type !== 'one-time' && s.day);
          let best = null;
          let bestDiff = Infinity;
          for (const s of recurring) {
            const idx = DAY_ORDER.indexOf(s.day);
            if (idx < 0) continue;
            let diff = (idx - todayIdx + 7) % 7;
            if (diff === 0) diff = 0;
            if (diff < bestDiff) { bestDiff = diff; best = s; }
          }
          if (best) {
            const date = new Date(today);
            date.setDate(today.getDate() + bestDiff);
            const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const [h, m] = String(best.start_time || '').split(':').map(Number);
            if (!isNaN(h)) {
              const ampm = h >= 12 ? 'PM' : 'AM';
              const hour = h % 12 || 12;
              const minStr = m > 0 ? `:${String(m).padStart(2,'0')}` : '';
              nextSlot = `${dateLabel} · ${hour}${minStr} ${ampm}`;
            } else {
              nextSlot = dateLabel;
            }
          }
        }
        return {
          ...f,
          statusColor: f.status === 'Available' ? 'green' : f.status === 'Busy' ? 'red' : 'gray',
          nextSlot,
        };
      }));
      setFacultyList(mapped);
      setLoading(false);
      if (initialFacultyId) {
        const target = mapped.find(f => f.id === initialFacultyId);
        if (target && target.status !== 'Unavailable') {
          const schedules = await getSchedulesForFaculty(target.id);
          setSelectedFaculty(target);
          setFacultySchedules(schedules);
          setSelectedDateIdx(0);
          setSelectedSlotIdx(null);
          setSubject('');
          setReason('');
          setTopicOpen(false);
          setFacultyView('booking');
        }
      }
    };
    fetchFaculty();

    // Real-time: faculty status changes
    const unsub = subscribeToFacultyStatus((payload) => {
      const updatedProfile = payload.new;
      setFacultyList(prev => prev.map(f => {
        if (f.id === updatedProfile.id) {
          return {
            ...f,
            status: updatedProfile.status,
            statusColor: updatedProfile.status === 'Available' ? 'green' : updatedProfile.status === 'Busy' ? 'red' : 'gray'
          };
        }
        return f;
      }));
    });
    return () => unsub();
  }, []);

  const filteredFaculty = facultyList.filter(f => 
    (f.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (f.dept?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleRequestAppointment = async (faculty) => {
    if (faculty.status === 'Unavailable') {
      toast.error(`${faculty.name} is currently unavailable and not accepting requests.`);
      return;
    }
    
    if (faculty.status === 'Busy') {
      toast.warning(`${faculty.name} is currently busy. Your request might take longer to be approved.`);
    }

    setSelectedFaculty(faculty);
    setSelectedDateIdx(0);
    setSelectedSlotIdx(null);
    setSubject('');
    setReason('');
    setTopicOpen(false);
    setLoading(true);
    const schedules = await getSchedulesForFaculty(faculty.id);
    setFacultySchedules(schedules);
    setLoading(false);
    setFacultyView('booking');
  };

  const handleBookSlot = async (slot, chosenDate = null) => {
    if (!user || !selectedFaculty) return;

    if (!isOnline) {
      toast.error('You are offline. Please reconnect and try again.');
      return;
    }

    const activeCount = await getActiveRequestCount(user.id);
    if (activeCount >= MAX_ACTIVE_REQUESTS) {
      toast.error(`You already have ${MAX_ACTIVE_REQUESTS} active requests. Complete or cancel one before booking again.`);
      return;
    }

    const slotTaken = await checkActiveRequestForSlot(user.id, slot.id);
    if (slotTaken) {
      toast.error('You already have an active request for this specific slot.');
      return;
    }

    const hasActive = await checkActiveRequest(user.id, selectedFaculty.id);
    if (hasActive) {
      toast.error('You already have an active request with this faculty member.');
      return;
    }

    if (slot.filled >= slot.max_slots) {
      toast.error('This consultation slot is already fully booked.');
      return;
    }

    // Target date: prefer the date the student picked in the booking modal,
    // then the slot's specific_date for one-time slots, else today as a last resort.
    const targetDate =
      chosenDate ||
      (slot.schedule_type === 'one-time' && slot.specific_date) ||
      new Date().toISOString().split('T')[0];
    console.log('[booking] checking block for date:', targetDate, 'faculty:', selectedFaculty.id);
    const block = await isDateBlocked(selectedFaculty.id, targetDate);
    console.log('[booking] block result:', block);
    if (block) {
      toast.error(
        block.reason
          ? `This date is blocked by the faculty (${block.reason}).`
          : 'This date is blocked by the faculty.'
      );
      return;
    }

    const requestData = {
      student_id: user.id,
      faculty_id: selectedFaculty.id,
      schedule_id: slot.id,
      subject: subject,
      details: reason,
      status: 'Pending',
      request_date: targetDate
    };

    const notifContext = {
      facultyId: selectedFaculty.id,
      studentId: user.id,
      studentName: user?.displayName || user?.user_metadata?.full_name || 'A student',
      day: slot.day,
      time: slot.start_time && slot.end_time
        ? `${String(slot.start_time).slice(0, 5)} - ${String(slot.end_time).slice(0, 5)}`
        : '',
    };

    const result = await submitRequest(requestData, notifContext);
    if (result) {
      setSubmittedReqId(result.id);
      setSelectedSlot(slot);
      setFacultyView('list');
      setShowConfirmation(true);
      toast.success('Request sent! Awaiting faculty approval');
    } else {
      toast.error('Failed to submit request. Please try again.');
    }
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

      {/* #44: Offline banner */}
      {!isOnline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.85rem', color: '#b91c1c', fontWeight: 600 }}>
          <WifiOff size={16} /> You're offline. Bookings won't save until you reconnect.
        </div>
      )}

      <div className="faculty-header">
        <p className="subtitle">View real-time availability and book a consultation slot</p>
      </div>

      {facultyView === 'list' && (
        <>
          <div className="search-box-faculty">
            <Search size={16} className="search-icon-faculty" />
            <input
              type="text"
              placeholder="Search instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search faculty"
            />
          </div>

          <div className="faculty-grid">
            {loading ? (
              <FacultyCardSkeleton count={6} />
            ) : filteredFaculty.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '5rem 2rem',
                  color: 'var(--text-muted)',
                  background: 'var(--card-bg, #fff)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <Users size={40} strokeWidth={1.5} />
                <div>
                  <h3 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {searchTerm ? 'No matches found' : 'No Faculty Found'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>
                    {searchTerm ? `No results for "${searchTerm}"` : 'No faculty members available.'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{ marginTop: '0.8rem', background: 'transparent', border: '1.5px solid var(--accent, #2e4a87)', color: 'var(--accent, #2e4a87)', fontWeight: 600, cursor: 'pointer', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.82rem', fontFamily: 'inherit' }}
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </div>
            ) : filteredFaculty.map((faculty, idx) => {
              const isUnavailable = faculty.status === 'Unavailable';
              const isBusy = faculty.status === 'Busy';
              const statusColor = isUnavailable ? '#616161' : isBusy ? '#ff1744' : '#00c853';
              const statusLabel = isUnavailable ? 'Unavailable Today' : isBusy ? 'Busy' : null;

              return (
                <div className="faculty-card" key={idx}>
                  <div className="faculty-avatar">
                    {faculty.avatar ? (
                      <img src={faculty.avatar} alt={faculty.name}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>
                        {faculty.name?.[0] ?? '?'}
                      </span>
                    )}
                  </div>

                  <div className="faculty-info">
                    <p className="faculty-name">{faculty.name}</p>
                    <p className="faculty-dept">{faculty.dept}</p>
                    {statusLabel ? (
                      <div className="faculty-status-row" style={{ color: statusColor }}>
                        <XCircle size={12} color={statusColor} />
                        {statusLabel}
                      </div>
                    ) : null}
                    {faculty.nextSlot ? (
                      <div className="faculty-next-slot">
                        <Clock size={11} />
                        Next: {faculty.nextSlot}
                      </div>
                    ) : !statusLabel ? (
                      <div className="faculty-next-slot" style={{ color: 'var(--text-muted)' }}>
                        <Clock size={11} />
                        No schedule set
                      </div>
                    ) : (
                      <div className="faculty-next-slot" style={{ color: 'var(--text-muted)' }}>
                        No schedule set
                      </div>
                    )}
                  </div>

                  <button
                    className="request-btn"
                    onClick={() => handleRequestAppointment(faculty)}
                    disabled={isUnavailable}
                    aria-label={isUnavailable ? `${faculty.name} is currently unavailable` : `Book appointment with ${faculty.name}`}
                  >
                    Book
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {facultyView === 'booking' && selectedFaculty && (() => {
        const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const TOPICS = ['Subject concern', 'Grades concern', 'Others (specify below)'];
        const today = new Date();
        today.setHours(0,0,0,0);

        const dateCells = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dayName = DAY_NAMES[d.getDay()];
          const dateNum = d.getDate();
          const month = d.getMonth();
          const year = d.getFullYear();
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(dateNum).padStart(2,'0')}`;
          const daySlots = facultySchedules.filter(s => s.schedule_type !== 'one-time' && s.day === dayName);
          const oneTimeSlots = facultySchedules.filter(s => s.schedule_type === 'one-time' && s.specific_date === dateStr);
          const allSlots = [...daySlots, ...oneTimeSlots];
          const totalLeft = allSlots.reduce((sum, s) => sum + Math.max(0, s.max_slots - (s.filled || 0)), 0);
          return { d, dayName, dateNum, dateStr, allSlots, totalLeft, hasSlots: allSlots.length > 0, isToday: i === 0 };
        });

        const selected = dateCells[selectedDateIdx];
        const selectedLabel = selected.d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
        const availableSlots = selected.allSlots.filter(s => (s.filled || 0) < s.max_slots);
        const chosenSlot = selectedSlotIdx !== null ? selected.allSlots[selectedSlotIdx] : null;

        const handleInlineSubmit = async (e) => {
          e.preventDefault();
          if (!chosenSlot) { toast.error('Please select a time slot.'); return; }
          if (!subject) { toast.error('Please select a consultation topic.'); return; }
          await handleBookSlot(chosenSlot, selected.dateStr);
        };

        return (
          <div className="modal-overlay" onClick={() => setFacultyView('list')}>
            <div className="bk-modal" onClick={e => e.stopPropagation()}>
              <div className="bk-modal-header">
                REQUEST APPOINTMENT WITH <span style={{ color: '#7fb3ff' }}>{selectedFaculty.name?.toUpperCase()}</span>
              </div>
              <button className="bk-close-btn" onClick={() => setFacultyView('list')}>✕</button>

              <div className="bk-modal-body">
                {/* Date strip */}
                <div className="bk-date-label">SELECT DATE</div>
                <div className="bk-date-strip">
                  {dateCells.map((cell, i) => {
                    const isSelected = i === selectedDateIdx;
                    let sub = 'No Hours';
                    if (cell.hasSlots) sub = cell.totalLeft === 0 ? 'Full' : `${cell.totalLeft} Left`;
                    return (
                      <button
                        key={i}
                        className={`bk-date-cell${isSelected ? ' selected' : ''}${!cell.hasSlots ? ' no-hours' : ''}`}
                        onClick={() => { setSelectedDateIdx(i); setSelectedSlotIdx(null); }}
                      >
                        <span className="bk-date-cell-day">{cell.isToday ? 'Today' : cell.dayName.slice(0,3)}</span>
                        <span className="bk-date-cell-num">{cell.dateNum}</span>
                        <span className="bk-date-cell-sub">{sub}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Day label */}
                <div className="bk-day-label">{selected.isToday ? 'Today, ' : ''}{selectedLabel}</div>
                {selected.allSlots.length > 0 && (
                  <div className="bk-day-sub" style={{ color: availableSlots.length === 0 ? '#ff1744' : availableSlots.length <= 2 ? '#ffab00' : '#00c853' }}>
                    {availableSlots.length} available slot{availableSlots.length !== 1 ? 's' : ''} for {selected.dayName}
                  </div>
                )}

                {loading ? (
                  <div className="bk-empty">Loading schedules…</div>
                ) : selected.allSlots.length === 0 ? (
                  <div className="bk-empty">No available schedule for this day</div>
                ) : (
                  <form onSubmit={handleInlineSubmit}>
                    {/* Time slot chips */}
                    <div className="bk-section-label">SELECT TIME SLOT</div>
                    <div className="bk-time-chips">
                      {selected.allSlots.map((slot, i) => {
                        const isFull = (slot.filled || 0) >= slot.max_slots;
                        const isChosen = selectedSlotIdx === i;
                        return (
                          <button
                            key={i}
                            type="button"
                            className={`bk-time-chip${isChosen ? ' selected' : ''}${isFull ? ' full' : ''}`}
                            onClick={() => !isFull && setSelectedSlotIdx(i)}
                            disabled={isFull}
                          >
                            <span className="bk-chip-time">{formatTimeRange(slot.start_time, slot.end_time)}</span>
                            {slot.room && <span className="bk-chip-room">Rm. {slot.room}</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Topic dropdown */}
                    <div className="bk-section-label">CONSULTATION TOPIC</div>
                    <div className="bk-dropdown-wrap">
                      <button
                        type="button"
                        className="bk-dropdown-trigger"
                        onClick={() => setTopicOpen(v => !v)}
                      >
                        <span style={{ color: subject ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {subject || 'Specify topic'}
                        </span>
                        <span className="bk-dropdown-arrow">▾</span>
                      </button>
                      {topicOpen && (
                        <div className="bk-dropdown-menu">
                          {TOPICS.map(t => (
                            <button
                              key={t}
                              type="button"
                              className={`bk-dropdown-item${subject === t ? ' active' : ''}`}
                              onClick={() => { setSubject(t); setTopicOpen(false); }}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="bk-section-label">OPTIONAL MESSAGES/NOTES</div>
                    <textarea
                      className="bk-textarea"
                      placeholder="Add any additional details..."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      rows={3}
                    />

                    {!isOnline && (
                      <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.6rem' }}>
                        ⚠️ You're offline — submission will fail
                      </div>
                    )}

                    {/* Actions */}
                    <div className="bk-actions">
                      <button type="submit" className="bk-submit-btn">Submit Request</button>
                      <button type="button" className="bk-cancel-btn" onClick={() => setFacultyView('list')}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        );
      })()}


      {showConfirmation && selectedSlot && selectedFaculty && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ textAlign: 'left', maxWidth: '460px' }}>
            {/* Receipt header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ color: '#22c55e', marginBottom: '0.5rem' }}><span className="check-success-icon"><CheckCircle size={48} /></span></div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)' }}>Request Submitted!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                Your request is now pending faculty approval.
              </p>
            </div>

            {/* Receipt body */}
            <div style={{ background: 'var(--bg-primary, #f0f2f8)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', paddingBottom: '0.8rem', borderBottom: '1px dashed var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference No.</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent, #2e4a87)' }}>
                  REQ-{submittedReqId ? submittedReqId.slice(0, 8).toUpperCase() : '--------'}
                </span>
              </div>
              {[
                ['Faculty', selectedFaculty.name],
                ['Day', selectedSlot.schedule_type === 'one-time' && selectedSlot.specific_date
                  ? new Date(selectedSlot.specific_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
                  : selectedSlot.day || 'TBD'],
                ['Time', formatTimeRange(selectedSlot.start_time, selectedSlot.end_time)],
                ['Room', `Room ${selectedSlot.room || 'TBA'}`],
                ['Topic', subject],
                ['Submitted', new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                </div>
              ))}
            </div>

            <button
              className="submit-btn"
              style={{ width: '100%', padding: '0.9rem' }}
              onClick={handleDone}
            >
              View in My Appointments →
            </button>
          </div>
        </div>
      )}

    </>
  );
};

export default FacultyContent;
