import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, Clock, MapPin, Plus, Ban, Activity, ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getFacultyRequests, getFacultySchedules, createSchedule, deleteSchedule } from '../../supabase/api';
import { subscribeToRequests, subscribeToSchedules } from '../../supabase/realtime';
import { withMinDelay } from '../../supabase/ux';
import { STATUS_STYLES, WEEKDAYS, MONTH_NAMES, fmt12 } from '../../components/SharedCalendarGrid';

/* ── Extra styles for the redesigned faculty calendar ── */
const facultyCalStyles = `
.fcp-wrapper { height: 100%; animation: scFadeIn 0.35s ease; }

.fcp-layout {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  height: calc(100vh - 110px);
  min-height: 480px;
}

/* Left panel */
.fcp-left {
  flex: 1 1 0;
  min-width: 0;
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: var(--card-shadow, 0 1px 8px rgba(0,0,0,0.06));
}

/* Header row */
.fcp-header {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid var(--card-border, #e5e8f0);
  flex-shrink: 0;
  background: var(--card-bg, #fff);
  gap: 0.5rem;
  flex-wrap: wrap;
}
.fcp-month-label {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  margin-right: 0.2rem;
}
.fcp-nav-group { display: flex; align-items: center; gap: 0.35rem; }
.fcp-today-chip {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.28rem 0.65rem;
  border-radius: 7px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: inherit;
}
.fcp-today-chip:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fcp-nav-btn {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 26px; height: 26px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: border-color 0.15s;
}
.fcp-nav-btn:hover { border-color: #1a2d5a; }

/* Action buttons */
.fcp-actions { display: flex; gap: 0.4rem; margin-left: auto; }
.fcp-action-btn {
  display: flex; align-items: center; gap: 0.3rem;
  padding: 0.32rem 0.75rem;
  border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.72rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: all 0.15s;
}
.fcp-action-btn:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fcp-action-btn.active { background: #1a2d5a; color: #fff; border-color: #1a2d5a; }

/* Filter bar */
.fcp-filter-bar {
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 1.2rem;
  border-bottom: 1px solid rgba(199,210,254,0.6);
  flex-shrink: 0;
  background: var(--card-bg, #fff);
}
.fcp-filter-chip {
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-secondary);
  font-size: 0.71rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
}
.fcp-filter-chip:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fcp-filter-chip.active { background: #1a2d5a; color: #fff; border-color: #1a2d5a; }

/* Grid */
.fcp-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  align-content: start;
}
.fcp-grid::-webkit-scrollbar { display: none; }
.fcp-weekday {
  background: rgba(238,240,251,0.9);
  padding: 0.5rem 0;
  text-align: center;
  font-size: 0.66rem; font-weight: 800;
  color: #6366f1;
  text-transform: uppercase; letter-spacing: 0.07em;
  border-bottom: 1.5px solid rgba(199,210,254,0.6);
  position: sticky; top: 0; z-index: 1;
}

.fcp-day {
  min-height: 110px;
  padding: 0.45rem 0.45rem 0.3rem;
  display: flex; flex-direction: column; gap: 4px;
  cursor: pointer; transition: background 0.12s;
  border-right: 1px solid rgba(199,210,254,0.5);
  border-bottom: 1px solid rgba(199,210,254,0.5);
  position: relative;
}
.fcp-day:hover { background: rgba(79,70,229,0.04); }
.fcp-day:focus-visible { outline: 2px solid #1a2d5a; outline-offset: -2px; }
.fcp-day-empty {
  min-height: 110px;
  background: rgba(248,249,255,0.7);
  border-right: 1px solid rgba(199,210,254,0.5);
  border-bottom: 1px solid rgba(199,210,254,0.5);
}

/* Date number */
.fcp-day-num {
  font-size: 0.72rem; font-weight: 600;
  color: var(--text-muted); line-height: 1;
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; flex-shrink: 0; margin-bottom: 3px;
}
.fcp-day-today .fcp-day-num {
  background: #1a2d5a; color: #fff; font-weight: 800;
  box-shadow: 0 2px 8px rgba(26,45,90,0.35);
}
.fcp-day-selected {
  background: rgba(26,45,90,0.06);
  outline: 2px solid #1a2d5a;
  outline-offset: -2px;
}

/* Slot count badge */
.fcp-slot-badge {
  display: inline-flex; align-items: center;
  padding: 2px 6px; border-radius: 5px;
  font-size: 0.6rem; font-weight: 700;
  background: #dbeafe; color: #1e40af;
  border: 1px solid rgba(59,130,246,0.3);
  white-space: nowrap;
}
.fcp-slot-badge.has-pending { background: #fef3c7; color: #7c5200; border-color: rgba(217,119,6,0.3); }
.fcp-slot-badge.blocked { background: #f3f4f6; color: #374151; border-color: rgba(156,163,175,0.4); }

/* More label */
.fcp-more { font-size: 0.57rem; color: var(--text-muted); font-weight: 600; padding: 1px 2px; }

/* Legend */
.fcp-legend {
  display: flex; flex-wrap: wrap; gap: 0.75rem;
  padding: 0.6rem 1.2rem;
  border-top: 1px solid rgba(199,210,254,0.6);
  flex-shrink: 0;
  background: rgba(238,240,251,0.5);
}
.fcp-legend-item {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.68rem; color: var(--text-muted); font-weight: 500;
}
.fcp-legend-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* ── Right panel ── */
.fcp-right {
  width: 290px; flex-shrink: 0;
  display: flex; flex-direction: column; gap: 0.85rem;
  height: 100%; overflow-y: auto; scrollbar-width: none;
}
.fcp-right::-webkit-scrollbar { display: none; }

/* Day detail card */
.fcp-detail-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--card-shadow, 0 1px 6px rgba(0,0,0,0.05));
  animation: scFadeIn 0.25s ease;
}
.fcp-detail-header {
  padding: 0.85rem 1rem 0.7rem;
  border-bottom: 1px solid var(--card-border, #e5e8f0);
}
.fcp-detail-day-label {
  font-size: 0.9rem; font-weight: 800;
  color: var(--text-primary); margin: 0 0 0.15rem;
}
.fcp-detail-hours {
  font-size: 0.72rem; color: var(--text-muted); margin: 0;
  display: flex; align-items: center; gap: 0.3rem;
}

/* Slot row */
.fcp-slot-row {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--card-border, #e5e8f0);
}
.fcp-slot-bar-row {
  display: flex; align-items: center; gap: 0.6rem;
  cursor: pointer;
}
.fcp-slot-bar {
  width: 4px; border-radius: 3px;
  background: #2e4a87; align-self: stretch; flex-shrink: 0; min-height: 32px;
}
.fcp-slot-info { flex: 1; min-width: 0; }
.fcp-slot-time-label {
  font-size: 0.82rem; font-weight: 700;
  color: var(--text-primary);
}
.fcp-slot-meta-row {
  font-size: 0.68rem; color: var(--text-muted);
  margin-top: 1px; display: flex; align-items: center; gap: 0.3rem;
}

/* Student row */
.fcp-student-row {
  display: flex; align-items: center; gap: 0.55rem;
  padding: 0.55rem 1rem 0.55rem 1.65rem;
  border-bottom: 1px solid var(--card-border, #e5e8f0);
}
.fcp-student-row:last-of-type { border-bottom: none; }
.fcp-student-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #dbeafe; color: #1e3a8a;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0; overflow: hidden;
}
.fcp-student-avatar img { width: 100%; height: 100%; object-fit: cover; }
.fcp-student-name {
  flex: 1; min-width: 0;
  font-size: 0.8rem; font-weight: 600; color: var(--text-primary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.fcp-appt-badge {
  font-size: 0.6rem; font-weight: 700;
  padding: 2px 6px; border-radius: 8px; border: 1px solid; flex-shrink: 0;
}
.fcp-cancel-btn {
  font-size: 0.68rem; font-weight: 600;
  padding: 0.22rem 0.55rem;
  border-radius: 6px; border: 1px solid #f87171;
  background: transparent; color: #ef4444;
  cursor: pointer; font-family: inherit; transition: all 0.12s; flex-shrink: 0;
}
.fcp-cancel-btn:hover { background: #fee2e2; }

/* Actions at bottom of detail */
.fcp-detail-actions {
  display: flex; flex-direction: column; gap: 0.45rem;
  padding: 0.7rem 1rem;
}
.fcp-block-btn {
  width: 100%; padding: 0.5rem;
  border-radius: 8px; border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent; color: var(--text-secondary);
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-block-btn:hover { border-color: #ef4444; color: #ef4444; }
.fcp-add-slot-btn {
  width: 100%; padding: 0.5rem;
  border-radius: 8px; border: none;
  background: #1a2d5a; color: #fff;
  font-size: 0.78rem; font-weight: 700;
  cursor: pointer; font-family: inherit; transition: opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-add-slot-btn:hover { opacity: 0.88; }

/* No-day placeholder */
.fcp-no-day {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 14px;
  padding: 2rem 1.2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.82rem;
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
}

/* Activity section */
.fcp-section {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  box-shadow: var(--card-shadow, 0 1px 4px rgba(0,0,0,0.04));
}
.fcp-section-title {
  font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted); margin-bottom: 0.6rem;
}
.fcp-activity-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.45rem 0.5rem; border-radius: 7px;
  cursor: pointer; transition: background 0.12s;
  margin-bottom: 0.25rem; width: 100%;
  border: none; background: transparent; font-family: inherit; text-align: left;
}
.fcp-activity-card:hover { background: var(--bg-primary, #f0f2f8); }
.fcp-activity-card:last-child { margin-bottom: 0; }
.fcp-activity-label {
  display: flex; align-items: center; gap: 0.45rem;
  font-size: 0.8rem; font-weight: 600; color: var(--text-primary);
}
.fcp-activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.fcp-count-badge {
  font-size: 0.72rem; font-weight: 700;
  padding: 1px 8px; border-radius: 10px; min-width: 26px; text-align: center;
}

/* Popover */
.fcp-popover-overlay { position: fixed; inset: 0; z-index: 998; }
.fcp-popover {
  position: fixed; z-index: 999;
  background: var(--bg-secondary, #fff);
  border: 1px solid var(--border-color, rgba(199,210,254,0.7));
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.14);
  padding: 1rem 1.1rem;
  min-width: 220px; max-width: 280px;
  animation: scPopIn 0.16s ease;
}
@keyframes scPopIn {
  from { opacity: 0; transform: scale(0.93) translateY(-6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.fcp-popover-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem; gap: 0.5rem; }
.fcp-popover-title { font-size: 0.86rem; font-weight: 700; color: var(--text-primary); line-height: 1.3; }
.fcp-popover-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.1rem; padding: 0; line-height: 1; }
.fcp-popover-close:hover { color: var(--text-primary); }
.fcp-popover-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem; }
.fcp-popover-badge { font-size: 0.64rem; font-weight: 700; padding: 2px 7px; border-radius: 9px; border: 1px solid; }
.fcp-popover-action {
  margin-top: 0.8rem; width: 100%; padding: 0.45rem 0;
  border-radius: 8px; border: none; background: #1a2d5a; color: #fff;
  font-size: 0.76rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.fcp-popover-action:hover { opacity: 0.88; }

/* Dark mode overrides */
.faculty-dashboard-wrapper.dark .fcp-left {
  background: rgba(12,14,26,0.97);
  border-color: rgba(99,102,241,0.25);
}
.faculty-dashboard-wrapper.dark .fcp-header,
.faculty-dashboard-wrapper.dark .fcp-filter-bar {
  background: rgba(12,14,26,0.97);
  border-color: rgba(99,102,241,0.2);
}
.faculty-dashboard-wrapper.dark .fcp-weekday {
  background: rgba(15,17,48,0.9); color: #818cf8;
  border-color: rgba(99,102,241,0.2);
}
.faculty-dashboard-wrapper.dark .fcp-day { border-color: rgba(99,102,241,0.15); }
.faculty-dashboard-wrapper.dark .fcp-day-empty { background: rgba(15,17,48,0.5); border-color: rgba(99,102,241,0.15); }
.faculty-dashboard-wrapper.dark .fcp-day:hover { background: rgba(99,102,241,0.1); }
.faculty-dashboard-wrapper.dark .fcp-day-selected { background: rgba(99,102,241,0.12); }
.faculty-dashboard-wrapper.dark .fcp-legend { background: rgba(15,17,48,0.5); border-color: rgba(99,102,241,0.2); }
.faculty-dashboard-wrapper.dark .fcp-detail-card,
.faculty-dashboard-wrapper.dark .fcp-section,
.faculty-dashboard-wrapper.dark .fcp-no-day {
  background: rgba(12,14,26,0.97);
  border-color: rgba(99,102,241,0.2);
}

@media (max-width: 900px) {
  .fcp-layout { flex-direction: column; height: auto; }
  .fcp-left { height: auto; }
  .fcp-right { width: 100%; height: auto; overflow-y: visible; }
  .fcp-day { min-height: 72px; padding: 0.3rem 0.25rem; }
  .fcp-day-empty { min-height: 72px; }
}

/* ── Shared modal overlay ── */
.fcp-modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fcpOverlayIn 0.18s ease;
}
@keyframes fcpOverlayIn { from { opacity:0; } to { opacity:1; } }

.fcp-modal {
  background: var(--card-bg, #fff);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.22);
  width: 100%; max-width: 520px;
  max-height: 88vh; overflow-y: auto; scrollbar-width: none;
  animation: fcpModalIn 0.2s ease;
  font-family: 'Outfit', sans-serif;
}
.fcp-modal::-webkit-scrollbar { display: none; }
@keyframes fcpModalIn {
  from { opacity:0; transform: scale(0.96) translateY(10px); }
  to   { opacity:1; transform: scale(1)    translateY(0); }
}

.fcp-modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 1.4rem 1.5rem 0;
}
.fcp-modal-title {
  font-size: 1.1rem; font-weight: 800;
  color: var(--text-primary, #1a2d5a); margin: 0 0 0.15rem;
}
.fcp-modal-sub {
  font-size: 0.78rem; color: var(--text-muted); margin: 0;
}
.fcp-modal-close {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 0.1rem; line-height: 1;
  transition: color 0.12s; flex-shrink: 0;
}
.fcp-modal-close:hover { color: var(--text-primary); }

.fcp-modal-body { padding: 1.2rem 1.5rem; }
.fcp-modal-divider { border: none; border-top: 1px solid var(--border-color, #e5e8f0); margin: 0; }

.fcp-modal-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 0.65rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color, #e5e8f0);
}
.fcp-modal-btn-cancel {
  padding: 0.55rem 1.3rem; border-radius: 9px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: transparent; color: var(--text-secondary);
  font-size: 0.88rem; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.fcp-modal-btn-cancel:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fcp-modal-btn-primary {
  padding: 0.55rem 1.4rem; border-radius: 9px;
  border: none; background: #1a2d5a; color: #fff;
  font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.fcp-modal-btn-primary:hover { opacity: 0.88; }
.fcp-modal-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Weekly Hours modal ── */
.fcp-wh-day-row {
  display: flex; align-items: center;
  padding: 0.9rem 0;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
  gap: 0.75rem;
}
.fcp-wh-day-row:last-child { border-bottom: none; }
.fcp-wh-day-name {
  font-size: 0.88rem; font-weight: 700;
  color: var(--text-primary); min-width: 90px;
}
.fcp-wh-day-info {
  flex: 1; font-size: 0.78rem; color: var(--text-muted);
}
.fcp-wh-icon-btn {
  background: none; border: none; cursor: pointer;
  color: var(--text-muted); padding: 0.25rem;
  border-radius: 6px; transition: all 0.12s; display: flex; align-items: center;
}
.fcp-wh-icon-btn:hover { background: var(--bg-primary, #f0f2f8); color: var(--text-primary); }
.fcp-wh-icon-btn.danger:hover { color: #ef4444; background: #fee2e2; }
.fcp-wh-empty {
  text-align: center; padding: 1.5rem 0;
  color: var(--text-muted); font-size: 0.82rem;
}

/* Add hours form */
.fcp-wh-form {
  background: var(--bg-primary, #f0f2f8);
  border-radius: 10px; padding: 1rem; margin-top: 1rem;
  display: flex; flex-direction: column; gap: 0.75rem;
  border: 1px solid var(--border-color, #e5e8f0);
}
.fcp-wh-form-row { display: flex; gap: 0.6rem; flex-wrap: wrap; }
.fcp-wh-label {
  font-size: 0.72rem; font-weight: 700;
  color: var(--text-secondary); margin-bottom: 0.25rem; display: block;
}
.fcp-wh-select, .fcp-wh-input {
  width: 100%; padding: 0.5rem 0.7rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff); color: var(--text-primary);
  font-family: inherit; font-size: 0.85rem; outline: none;
  transition: border-color 0.15s; box-sizing: border-box;
}
.fcp-wh-select:focus, .fcp-wh-input:focus { border-color: #1a2d5a; }
.fcp-wh-form-field { flex: 1; min-width: 110px; }
.fcp-wh-add-btn {
  width: 100%; padding: 0.5rem; border-radius: 8px;
  border: none; background: #1a2d5a; color: #fff;
  font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-wh-add-btn:hover { opacity: 0.88; }
.fcp-wh-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.fcp-wh-show-form-btn {
  width: 100%; margin-top: 1rem; padding: 0.5rem; border-radius: 8px;
  border: 1.5px dashed var(--border-color, #d1d5db);
  background: transparent; color: var(--text-muted);
  font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit;
  transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
}
.fcp-wh-show-form-btn:hover { border-color: #1a2d5a; color: #1a2d5a; }

/* ── Block dates modal ── */
.fcp-bd-row { display: flex; gap: 1rem; flex-wrap: wrap; }
.fcp-bd-field { flex: 1; min-width: 130px; }
.fcp-bd-label {
  font-size: 0.72rem; font-weight: 700;
  color: var(--text-secondary); margin-bottom: 0.3rem; display: block;
}
.fcp-bd-input {
  width: 100%; padding: 0.55rem 0.75rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff); color: var(--text-primary);
  font-family: inherit; font-size: 0.88rem; outline: none;
  transition: border-color 0.15s; box-sizing: border-box;
}
.fcp-bd-input:focus { border-color: #1a2d5a; }
.fcp-bd-select {
  width: 100%; padding: 0.55rem 0.75rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--card-bg, #fff); color: var(--text-primary);
  font-family: inherit; font-size: 0.88rem; outline: none;
  cursor: pointer; margin-top: 0.75rem;
  transition: border-color 0.15s; box-sizing: border-box;
}
.fcp-bd-select:focus { border-color: #1a2d5a; }
.fcp-bd-info {
  margin-top: 0.85rem; padding: 0.7rem 0.9rem;
  background: #eef3fb; border-radius: 8px;
  font-size: 0.8rem; color: #2e4a87; font-weight: 500;
}
.fcp-bd-info.warning { background: #fef3c7; color: #7c5200; }

/* ── Activity log modal ── */
.fcp-al-item {
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
}
.fcp-al-item:last-child { border-bottom: none; }
.fcp-al-desc {
  font-size: 0.86rem; font-weight: 600;
  color: var(--text-primary); margin: 0 0 0.2rem;
}
.fcp-al-time {
  font-size: 0.74rem; color: var(--text-muted); margin: 0;
}
`;

const FacultyCalendarPage = ({ onTabChange }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [popover, setPopover] = useState(null);
  const [modal, setModal] = useState(null); // 'weekly' | 'block' | 'activity'
  const detailsRef = useRef(null);

  // Weekly Hours modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [whSaving, setWhSaving] = useState(false);
  const [whForm, setWhForm] = useState({
    day: 'Monday', start_time: '08:00', end_time: '09:00',
    max_slots: 3, duration: 30, room: '',
  });

  // Block dates modal state
  const today2 = new Date();
  const todayIso = `${today2.getFullYear()}-${String(today2.getMonth()+1).padStart(2,'0')}-${String(today2.getDate()).padStart(2,'0')}`;
  const [bdFrom, setBdFrom] = useState(todayIso);
  const [bdTo,   setBdTo]   = useState(todayIso);
  const [bdReason, setBdReason] = useState('');
  const [bdSaving, setBdSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [reqs, scheds] = await withMinDelay(
        Promise.all([getFacultyRequests(user.id), getFacultySchedules(user.id)]),
        300
      );
      setRequests(reqs);
      setSchedules(scheds);
      setLoading(false);
    };
    fetchData();

    const unsubReqs = subscribeToRequests(user.id, 'faculty', setRequests, () => getFacultyRequests(user.id));
    const unsubScheds = subscribeToSchedules(user.id, setSchedules, () => getFacultySchedules(user.id));
    return () => { unsubReqs(); unsubScheds(); };
  }, [user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday  = () => { setCurrentDate(new Date()); setSelectedDate(null); };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const counts = {
    Approved:  requests.filter(r => r.status === 'Approved').length,
    Pending:   requests.filter(r => r.status === 'Pending').length,
    Declined:  requests.filter(r => r.status === 'Declined').length,
    Cancelled: requests.filter(r => ['Cancelled', 'Completed'].includes(r.status)).length,
  };

  const filteredRequests = statusFilter === 'All'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const getEventsForDate = (dateStr) => {
    const dayName = new Date(...dateStr.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)))
      .toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedules = schedules.filter(s =>
      (s.schedule_type === 'recurring' && s.day === dayName) ||
      (s.schedule_type === 'one-time' && s.specific_date === dateStr)
    );
    const dayRequests = filteredRequests.filter(r => r.date === dateStr);
    return { daySchedules, dayRequests };
  };

  const getDetailForDate = (dateStr) => {
    const dayName = new Date(...dateStr.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v)))
      .toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedules = schedules.filter(s =>
      (s.schedule_type === 'recurring' && s.day === dayName) ||
      (s.schedule_type === 'one-time' && s.specific_date === dateStr)
    );
    const dayRequests = requests
      .filter(r => r.date === dateStr)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    return { daySchedules, dayRequests };
  };

  const selectedDayLabel = selectedDate
    ? (() => {
        const [y, m, d] = selectedDate.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      })()
    : '';

  const handleDayClick = (dateStr) => {
    setSelectedDate(prev => {
      const next = prev === dateStr ? null : dateStr;
      if (next && window.innerWidth < 900) {
        setTimeout(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
      }
      return next;
    });
  };

  const getReqFilter = (status) => {
    if (status === 'Pending') return 'Pending';
    if (status === 'Approved') return 'Approved';
    return 'History';
  };

  const openPopover = (e, r) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    let x = rect.left, y = rect.bottom + 8;
    if (x + 285 > window.innerWidth) x = window.innerWidth - 290;
    if (y + 260 > window.innerHeight) y = rect.top - 265;
    setPopover({ request: r, x, y });
  };
  const closePopover = () => setPopover(null);

  useEffect(() => {
    if (!popover) return;
    const handler = (e) => { if (!e.target.closest('.fcp-popover')) closePopover(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popover]);

  // Weekly Hours: add a recurring schedule slot
  const handleAddHours = async () => {
    if (!user) return;
    setWhSaving(true);
    const data = await createSchedule({
      faculty_id: user.id,
      schedule_type: 'recurring',
      day: whForm.day,
      start_time: whForm.start_time,
      end_time: whForm.end_time,
      max_slots: Number(whForm.max_slots),
      duration: Number(whForm.duration),
      room: whForm.room || null,
    });
    if (data) {
      setSchedules(prev => [...prev, { ...data, filled: 0 }]);
      setShowAddForm(false);
      setWhForm({ day: 'Monday', start_time: '08:00', end_time: '09:00', max_slots: 3, duration: 30, room: '' });
    }
    setWhSaving(false);
  };

  const handleDeleteSchedule = async (id) => {
    const ok = await deleteSchedule(id);
    if (ok) setSchedules(prev => prev.filter(s => s.id !== id));
  };

  // Group recurring schedules by day for Weekly Hours modal
  const recurringByDay = WEEKDAYS.reduce((acc, d) => {
    const full = { Sun:'Sunday',Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday' }[d];
    const slots = schedules.filter(s => s.schedule_type === 'recurring' && s.day === full);
    if (slots.length) acc[full] = slots;
    return acc;
  }, {});

  // Block dates: check if any requests fall in range (UI only for now)
  const bdRequestsInRange = bdFrom && bdTo
    ? requests.filter(r => r.date >= bdFrom && r.date <= bdTo && ['Pending','Approved'].includes(r.status))
    : [];

  // Mock activity log data (replace with DB data once table exists)
  const mockActivityLog = [
    ...requests
      .filter(r => r.status === 'Approved')
      .slice(0, 3)
      .map(r => ({
        id: `appr-${r.id}`,
        desc: `Approved ${r.name?.split('(')[0]?.trim() || 'student'} · ${r.day}, ${fmt12(r.startTime)}`,
        ts: r.date,
      })),
    ...requests
      .filter(r => r.status === 'Declined')
      .slice(0, 2)
      .map(r => ({
        id: `decl-${r.id}`,
        desc: `Declined ${r.name?.split('(')[0]?.trim() || 'student'} · ${r.day}, ${fmt12(r.startTime)}`,
        ts: r.date,
      })),
  ].sort((a, b) => (b.ts || '').localeCompare(a.ts || '')).slice(0, 10);

  // Build calendar cells
  const cells = [];
  for (let i = 0; i < startDay; i++) {
    cells.push(<div key={`e-${i}`} className="fcp-day-empty" />);
  }
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday    = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const { daySchedules, dayRequests } = getEventsForDate(dateStr);

    // Slot badge logic
    const totalSlots = daySchedules.reduce((sum, s) => sum + (s.max_slots || 0), 0);
    const filledSlots = dayRequests.filter(r => r.status === 'Approved').length;
    const hasPending  = dayRequests.some(r => r.status === 'Pending');
    const hasEvents   = daySchedules.length > 0 || dayRequests.length > 0;

    cells.push(
      <div
        key={d}
        className={`fcp-day${isToday ? ' fcp-day-today' : ''}${isSelected ? ' fcp-day-selected' : ''}`}
        onClick={() => handleDayClick(dateStr)}
        role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleDayClick(dateStr)}
        aria-label={`${MONTH_NAMES[month]} ${d}`}
      >
        <span className="fcp-day-num">{d}</span>
        {hasEvents && (
          <span className={`fcp-slot-badge${hasPending ? ' has-pending' : ''}`}>
            {totalSlots > 0
              ? `${filledSlots} of ${totalSlots}`
              : dayRequests.length > 0
                ? `${dayRequests.length} req`
                : `${daySchedules.length} slot${daySchedules.length !== 1 ? 's' : ''}`}
          </span>
        )}
        {hasPending && !hasEvents && (
          <span className="fcp-slot-badge has-pending">{dayRequests.filter(r => r.status === 'Pending').length} pending</span>
        )}
      </div>
    );
  }

  const activityItems = [
    { label: 'Approved',  key: 'Approved',  dotColor: '#3b82f6', badgeBg: '#dbeafe', badgeColor: '#1e3a8a', filter: 'Approved' },
    { label: 'Pending',   key: 'Pending',   dotColor: '#d97706', badgeBg: '#fef3c7', badgeColor: '#7c5200', filter: 'Pending' },
    { label: 'Declined',  key: 'Declined',  dotColor: '#f87171', badgeBg: '#fee2e2', badgeColor: '#b91c1c', filter: 'History' },
    { label: 'Cancelled', key: 'Cancelled', dotColor: '#9ca3af', badgeBg: '#f3f4f6', badgeColor: '#374151', filter: 'History' },
  ];

  const detailData = selectedDate ? getDetailForDate(selectedDate) : null;

  // Group requests under their schedule slot for display
  const buildSlotGroups = (daySchedules, dayRequests) => {
    return daySchedules.map(s => {
      const slotRequests = dayRequests.filter(r =>
        r.startTime && s.start_time &&
        r.startTime >= s.start_time &&
        (s.end_time ? r.startTime < s.end_time : true)
      );
      return { schedule: s, requests: slotRequests };
    });
  };

  return (
    <>
    <div className="fcp-wrapper">
      <style>{facultyCalStyles}</style>

      <div className="fcp-layout">

        {/* ── Left: Calendar ── */}
        <div className="fcp-left">

          {/* Header */}
          <div className="fcp-header">
            <span className="fcp-month-label">{MONTH_NAMES[month]} {year}</span>
            <div className="fcp-nav-group">
              <button className="fcp-today-chip" onClick={goToday}>Today</button>
              <button className="fcp-nav-btn" onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={14} /></button>
              <button className="fcp-nav-btn" onClick={nextMonth} aria-label="Next month"><ChevronRight size={14} /></button>
            </div>
            <div className="fcp-actions">
              <button className={`fcp-action-btn${modal === 'weekly' ? ' active' : ''}`} onClick={() => { setModal('weekly'); setShowAddForm(false); }}>
                <Clock size={11} /> Weekly hours
              </button>
              <button className={`fcp-action-btn${modal === 'block' ? ' active' : ''}`} onClick={() => setModal('block')}>
                <Ban size={11} /> Block dates
              </button>
              <button className={`fcp-action-btn${modal === 'activity' ? ' active' : ''}`} onClick={() => setModal('activity')}>
                <Activity size={11} /> Activity log
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="fcp-filter-bar">
            {['All', 'Approved', 'Pending'].map(f => (
              <button
                key={f}
                className={`fcp-filter-chip${statusFilter === f ? ' active' : ''}`}
                onClick={() => setStatusFilter(f)}
              >{f}</button>
            ))}
          </div>

          {/* Grid */}
          <div className="fcp-grid">
            {WEEKDAYS.map(d => <div key={d} className="fcp-weekday">{d}</div>)}
            {cells}
          </div>

          {/* Legend */}
          <div className="fcp-legend">
            <div className="fcp-legend-item"><span className="fcp-legend-dot" style={{ background: '#3b82f6' }} />Open slots</div>
            <div className="fcp-legend-item"><span className="fcp-legend-dot" style={{ background: '#d97706' }} />Has pending</div>
            <div className="fcp-legend-item"><span className="fcp-legend-dot" style={{ background: '#9ca3af' }} />Blocked</div>
          </div>
        </div>

        {/* ── Pill popover ── */}
        {popover && (() => {
          const r = popover.request;
          const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
          const name = r.studentName || r.name || '—';
          const timeLabel = r.startTime && r.endTime
            ? `${fmt12(r.startTime)} – ${fmt12(r.endTime)}`
            : r.time || 'TBD';
          return (
            <>
              <div className="fcp-popover-overlay" onClick={closePopover} />
              <div className="fcp-popover" style={{ left: popover.x, top: popover.y }}>
                <div className="fcp-popover-header">
                  <span className="fcp-popover-title">{name}</span>
                  <button className="fcp-popover-close" onClick={closePopover}>×</button>
                </div>
                <div className="fcp-popover-row">
                  <span className="fcp-popover-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{r.status}</span>
                </div>
                <div className="fcp-popover-row">{timeLabel}</div>
                {r.subject && <div className="fcp-popover-row" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{r.subject}</div>}
                <button className="fcp-popover-action" onClick={() => { closePopover(); onTabChange('Requests', getReqFilter(r.status)); }}>
                  View Details
                </button>
              </div>
            </>
          );
        })()}

        {/* ── Right panel ── */}
        <div className="fcp-right" ref={detailsRef}>

          {/* Day detail */}
          {selectedDate && detailData ? (
            <div className="fcp-detail-card">
              {/* Day header */}
              <div className="fcp-detail-header">
                <p className="fcp-detail-day-label">{selectedDayLabel}</p>
                {detailData.daySchedules.length > 0 && (() => {
                  const earliest = detailData.daySchedules.reduce((min, s) => s.start_time < min ? s.start_time : min, detailData.daySchedules[0].start_time);
                  const latest   = detailData.daySchedules.reduce((max, s) => s.end_time > max ? s.end_time : max, detailData.daySchedules[0].end_time);
                  return (
                    <p className="fcp-detail-hours">
                      <Clock size={10} />
                      Hours: {fmt12(earliest)} to {fmt12(latest)}
                    </p>
                  );
                })()}
              </div>

              {detailData.daySchedules.length === 0 && detailData.dayRequests.length === 0 ? (
                <div style={{ padding: '1.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  No events on this day.
                </div>
              ) : (
                <>
                  {/* Slot rows with nested student rows */}
                  {detailData.daySchedules.length > 0
                    ? buildSlotGroups(detailData.daySchedules, detailData.dayRequests).map((group, gi) => (
                        <React.Fragment key={gi}>
                          {/* Slot bar row */}
                          <div className="fcp-slot-row">
                            <div className="fcp-slot-bar-row">
                              <div className="fcp-slot-bar" />
                              <div className="fcp-slot-info">
                                <div className="fcp-slot-time-label">
                                  {fmt12(group.schedule.start_time)} to {fmt12(group.schedule.end_time)}
                                </div>
                                <div className="fcp-slot-meta-row">
                                  {group.schedule.filled != null && group.schedule.max_slots != null && (
                                    <span>{group.schedule.filled ?? 0} of {group.schedule.max_slots}</span>
                                  )}
                                  {group.schedule.room && (
                                    <><span>·</span><MapPin size={9} /><span>{group.schedule.room}</span></>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Student rows nested under this slot */}
                          {group.requests.map((r, ri) => {
                            const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
                            return (
                              <div key={r.id || ri} className="fcp-student-row">
                                <div className="fcp-student-avatar">
                                  {r.avatar
                                    ? <img src={r.avatar} alt={r.name} />
                                    : <span>{(r.name || r.studentName || '?')[0].toUpperCase()}</span>
                                  }
                                </div>
                                <span className="fcp-student-name">{r.name || r.studentName || '—'}</span>
                                <span className="fcp-appt-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                                  {r.status}
                                </span>
                                {r.status !== 'Cancelled' && r.status !== 'Declined' && (
                                  <button
                                    className="fcp-cancel-btn"
                                    onClick={(e) => { e.stopPropagation(); onTabChange('Requests', getReqFilter(r.status)); }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))
                    : /* No schedules, just show requests */
                      detailData.dayRequests.map((r, idx) => {
                        const st = STATUS_STYLES[r.status] || STATUS_STYLES.Cancelled;
                        return (
                          <div key={r.id || idx} className="fcp-student-row" style={{ paddingLeft: '1rem' }}>
                            <div className="fcp-student-avatar">
                              {r.avatar
                                ? <img src={r.avatar} alt={r.name} />
                                : <span>{(r.name || r.studentName || '?')[0].toUpperCase()}</span>
                              }
                            </div>
                            <span className="fcp-student-name">{r.name || r.studentName || '—'}</span>
                            <span className="fcp-appt-badge" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                              {r.status}
                            </span>
                            {r.status !== 'Cancelled' && r.status !== 'Declined' && (
                              <button
                                className="fcp-cancel-btn"
                                onClick={(e) => { e.stopPropagation(); onTabChange('Requests', getReqFilter(r.status)); }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        );
                      })
                  }

                  {/* Block / Add slot actions */}
                  <div className="fcp-detail-actions">
                    <button className="fcp-block-btn">
                      <Ban size={13} /> Block this date
                    </button>
                    <button className="fcp-add-slot-btn">
                      <Plus size={13} /> Add one-time slot
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="fcp-no-day">
              <CalendarDays size={28} strokeWidth={1.5} style={{ opacity: 0.25 }} />
              <span>Select a day to see details</span>
            </div>
          )}

          {/* Activity summary */}
          <div className="fcp-section">
            <div className="fcp-section-title">Activity</div>
            {loading ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.4rem 0' }}>Loading…</div>
            ) : (
              activityItems.map(({ label, key, dotColor, badgeBg, badgeColor, filter }) => (
                <button
                  key={key}
                  className="fcp-activity-card"
                  onClick={() => onTabChange('Requests', filter)}
                >
                  <div className="fcp-activity-label">
                    <span className="fcp-activity-dot" style={{ background: dotColor }} />
                    {label}
                  </div>
                  <span className="fcp-count-badge" style={{ background: badgeBg, color: badgeColor }}>
                    {counts[key]}
                  </span>
                </button>
              ))
            )}
          </div>

        </div>
      </div>
    </div>

    {/* ══════════════════════════════════════
        WEEKLY HOURS MODAL
    ══════════════════════════════════════ */}
    {modal === 'weekly' && (
      <div className="fcp-modal-overlay" onClick={() => setModal(null)}>
        <div className="fcp-modal" onClick={e => e.stopPropagation()}>
          <div className="fcp-modal-header">
            <div>
              <p className="fcp-modal-title">Weekly Hours</p>
              <p className="fcp-modal-sub">Your recurring consultation schedule</p>
            </div>
            <button className="fcp-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
          </div>
          <hr className="fcp-modal-divider" style={{ margin: '1rem 0 0' }} />

          <div className="fcp-modal-body">
            {Object.keys(recurringByDay).length === 0 && !showAddForm ? (
              <div className="fcp-wh-empty">No recurring hours set yet.</div>
            ) : (
              Object.entries(recurringByDay).map(([day, slots]) => (
                slots.map((s, si) => (
                  <div key={s.id || si} className="fcp-wh-day-row">
                    <div style={{ flex: 1 }}>
                      <div className="fcp-wh-day-name">{day}</div>
                      <div className="fcp-wh-day-info">
                        {fmt12(s.start_time)} to {fmt12(s.end_time)}
                        {s.duration ? ` · ${s.duration} min` : ''}
                        {s.max_slots ? ` · ${s.max_slots} per slot` : ''}
                        {s.room ? ` · ${s.room}` : ' · Room TBA'}
                      </div>
                    </div>
                    <button className="fcp-wh-icon-btn danger" title="Delete" onClick={() => handleDeleteSchedule(s.id)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ))
            )}

            {showAddForm && (
              <div className="fcp-wh-form">
                <div>
                  <label className="fcp-wh-label">Day</label>
                  <select className="fcp-wh-select" value={whForm.day} onChange={e => setWhForm(f => ({ ...f, day: e.target.value }))}>
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="fcp-wh-form-row">
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">Start time</label>
                    <input className="fcp-wh-input" type="time" value={whForm.start_time} onChange={e => setWhForm(f => ({ ...f, start_time: e.target.value }))} />
                  </div>
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">End time</label>
                    <input className="fcp-wh-input" type="time" value={whForm.end_time} onChange={e => setWhForm(f => ({ ...f, end_time: e.target.value }))} />
                  </div>
                </div>
                <div className="fcp-wh-form-row">
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">Duration (min)</label>
                    <select className="fcp-wh-select" value={whForm.duration} onChange={e => setWhForm(f => ({ ...f, duration: e.target.value }))}>
                      {[15,20,30,45,60].map(d => <option key={d} value={d}>{d} min</option>)}
                    </select>
                  </div>
                  <div className="fcp-wh-form-field">
                    <label className="fcp-wh-label">Slots per time</label>
                    <input className="fcp-wh-input" type="number" min={1} max={20} value={whForm.max_slots} onChange={e => setWhForm(f => ({ ...f, max_slots: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="fcp-wh-label">Room (optional)</label>
                  <input className="fcp-wh-input" type="text" placeholder="e.g. Room 510" value={whForm.room} onChange={e => setWhForm(f => ({ ...f, room: e.target.value }))} />
                </div>
                <button className="fcp-wh-add-btn" onClick={handleAddHours} disabled={whSaving || !whForm.start_time || !whForm.end_time}>
                  {whSaving ? 'Saving…' : <><Plus size={13} /> Save hours</>}
                </button>
              </div>
            )}

            {!showAddForm && (
              <button className="fcp-wh-show-form-btn" onClick={() => setShowAddForm(true)}>
                <Plus size={13} /> Add hours
              </button>
            )}
          </div>

          <div className="fcp-modal-footer">
            <button className="fcp-modal-btn-cancel" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      </div>
    )}

    {/* ══════════════════════════════════════
        BLOCK DATES MODAL
    ══════════════════════════════════════ */}
    {modal === 'block' && (
      <div className="fcp-modal-overlay" onClick={() => setModal(null)}>
        <div className="fcp-modal" onClick={e => e.stopPropagation()}>
          <div className="fcp-modal-header">
            <div>
              <p className="fcp-modal-title">Block dates</p>
              <p className="fcp-modal-sub">Students won't be able to book these dates.</p>
            </div>
            <button className="fcp-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
          </div>
          <hr className="fcp-modal-divider" style={{ margin: '1rem 0 0' }} />

          <div className="fcp-modal-body">
            <div className="fcp-bd-row">
              <div className="fcp-bd-field">
                <label className="fcp-bd-label">From</label>
                <input className="fcp-bd-input" type="date" value={bdFrom} onChange={e => { setBdFrom(e.target.value); if (e.target.value > bdTo) setBdTo(e.target.value); }} />
              </div>
              <div className="fcp-bd-field">
                <label className="fcp-bd-label">To</label>
                <input className="fcp-bd-input" type="date" value={bdTo} min={bdFrom} onChange={e => setBdTo(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="fcp-bd-label" style={{ marginTop: '0.85rem', display: 'block' }}>Reason (Optional)</label>
              <select className="fcp-bd-select" value={bdReason} onChange={e => setBdReason(e.target.value)}>
                <option value="">Select a reason</option>
                <option value="Out of office">Out of office</option>
                <option value="Holiday">Holiday</option>
                <option value="Personal">Personal</option>
                <option value="Conference / Event">Conference / Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {bdFrom && bdTo && (
              <div className={`fcp-bd-info${bdRequestsInRange.length > 0 ? ' warning' : ''}`}>
                {bdRequestsInRange.length > 0
                  ? `⚠ ${bdRequestsInRange.length} active booking${bdRequestsInRange.length > 1 ? 's' : ''} fall in this range.`
                  : 'No bookings fall in this range.'}
              </div>
            )}
          </div>

          <div className="fcp-modal-footer">
            <button className="fcp-modal-btn-cancel" onClick={() => setModal(null)}>Cancel</button>
            <button
              className="fcp-modal-btn-primary"
              disabled={bdSaving || !bdFrom || !bdTo}
              onClick={() => {
                // TODO: insert into blocked_dates table once it's created
                setBdSaving(true);
                setTimeout(() => { setBdSaving(false); setModal(null); }, 800);
              }}
            >
              {bdSaving ? 'Blocking…' : 'Block dates'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ══════════════════════════════════════
        ACTIVITY LOG MODAL
    ══════════════════════════════════════ */}
    {modal === 'activity' && (
      <div className="fcp-modal-overlay" onClick={() => setModal(null)}>
        <div className="fcp-modal" onClick={e => e.stopPropagation()}>
          <div className="fcp-modal-header">
            <div>
              <p className="fcp-modal-title">Activity log</p>
              <p className="fcp-modal-sub">Schedule and availability updates</p>
            </div>
            <button className="fcp-modal-close" onClick={() => setModal(null)}><X size={18} /></button>
          </div>
          <hr className="fcp-modal-divider" style={{ margin: '1rem 0 0' }} />

          <div className="fcp-modal-body">
            {mockActivityLog.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                No activity recorded yet.
              </div>
            ) : (
              mockActivityLog.map(item => (
                <div key={item.id} className="fcp-al-item">
                  <p className="fcp-al-desc">{item.desc}</p>
                  <p className="fcp-al-time">{item.ts}</p>
                </div>
              ))
            )}
          </div>

          <div className="fcp-modal-footer">
            <button className="fcp-modal-btn-cancel" onClick={() => setModal(null)}>Close</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default FacultyCalendarPage;
