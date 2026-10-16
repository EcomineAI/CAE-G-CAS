import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fmt12 } from '../utils/dateUtils';

export { fmt12 };

export const STATUS_STYLES = {
  Approved:  { bg: '#dcfce7', color: '#14532d', border: '#00c853' },
  Pending:   { bg: '#fef3c7', color: '#7c5200', border: '#d97706' },
  Declined:  { bg: '#fee2e2', color: '#b91c1c', border: '#f87171' },
  Cancelled: { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' },
  Completed: { bg: '#e0f2fe', color: '#0369a1', border: '#38bdf8' },
};

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const calendarSharedStyles = `
/* ── Shared calendar layout ── */
.sc-wrapper {
  height: 100%;
  animation: scFadeIn 0.35s ease;
}
@keyframes scFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scSlideIn {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.sc-layout {
  display: flex;
  gap: calc(1.5rem + 10px);
  align-items: flex-start;
  width: fit-content;
  margin: 0 auto;
}

/* ── Left panel ── */
.sc-left {
  flex: 0 0 820px;
  min-width: 0;
  background: #ffffff;
  border: 2px solid #64748b;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(26,45,90,0.12);
}

.sc-cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.4rem;
  border-bottom: 2px solid #94a3b8;
  flex-shrink: 0;
  background: #ffffff;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.sc-month-label {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1a2d5a;
  letter-spacing: -0.3px;
}

.sc-nav-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sc-today-btn {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 7px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  font-family: inherit;
}
.sc-today-btn:hover { border-color: var(--accent, #2e4a87); color: var(--accent, #2e4a87); }

.sc-nav-btn {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 28px;
  height: 28px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s;
}
.sc-nav-btn:hover { border-color: var(--accent, #2e4a87); }

/* ── Filter bar ── */
.sc-filter-bar {
  display: flex;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-bottom: 2px solid #94a3b8;
  flex-shrink: 0;
  background: #f8f9fc;
}

.sc-filter-chip {
  padding: 0.35rem 1rem;
  border-radius: 20px;
  border: 1.5px solid #94a3b8;
  background: #ffffff;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.sc-filter-chip:hover { border-color: #1a2d5a; color: #1a2d5a; background: #eef2fb; }
.sc-filter-chip.active {
  background: #1a2d5a;
  color: #fff;
  border-color: #1a2d5a;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(26,45,90,0.25);
}

/* ── Grid ── */
.sc-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  align-content: start;
  scrollbar-width: none;
}
.sc-grid > .sc-day:nth-child(7n),
.sc-grid > .sc-day-empty:nth-child(7n) {
  border-right: none;
}
.sc-grid::-webkit-scrollbar { display: none; }

.sc-weekday {
  background: #dfe6f5;
  padding: 0.6rem 0;
  text-align: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: #1a2d5a;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  border-bottom: 2px solid #64748b;
  border-right: 1.5px solid #94a3b8;
  position: sticky;
  top: 0;
  z-index: 1;
}
.sc-weekday:last-child { border-right: none; }

.sc-day {
  min-height: 90px;
  padding: 0.5rem 0.45rem 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 3px;
  cursor: pointer;
  transition: background 0.12s;
  border-right: 1.5px solid #94a3b8;
  border-bottom: 1.5px solid #94a3b8;
  position: relative;
  overflow: hidden;
}
.sc-day:hover { background: #eef2fb; }
.sc-day:focus-visible { outline: 2px solid #1a2d5a; outline-offset: -2px; }
.sc-day-past { opacity: 0.38; pointer-events: none; }
.sc-day-past .sc-day-num { color: #94a3b8; }
.sc-day-past-history { opacity: 0.6; cursor: pointer; }
.sc-day-past-history:hover { background: #f1f3f8; }
.sc-day-past-history .sc-day-num { color: #64748b; }

.sc-day-empty {
  min-height: 90px;
  background: #f1f3f8;
  cursor: default;
  border-right: 1.5px solid #94a3b8;
  border-bottom: 1.5px solid #94a3b8;
}

.sc-day-num {
  font-size: 0.82rem;
  font-weight: 800;
  color: #1a2d5a;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.sc-day-today .sc-day-num {
  background: #1a2d5a;
  color: #fff;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(26,45,90,0.4);
}
.sc-day-selected {
  background: #eef2fb;
  outline: 2px solid #1a2d5a;
  outline-offset: -2px;
}

.sc-pill {
  font-size: 0.61rem;
  padding: 3px 7px 3px 6px;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  border: 1px solid transparent;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: filter 0.12s, transform 0.1s;
}
.sc-pill:hover { filter: brightness(0.96); transform: translateY(-1px); }
.sc-pill::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--pill-dot, currentColor);
  flex-shrink: 0;
}

.sc-pill-detailed {
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: 4px 7px;
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
}
.sc-pill-detailed::before { display: none; }
.sc-pill-name {
  font-size: 0.63rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  line-height: 1.3;
}
.sc-pill-time {
  font-size: 0.58rem;
  font-weight: 600;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}
.sc-pill-subject {
  font-size: 0.57rem;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  font-style: italic;
}
.sc-pill-schedule {
  background: #dbeafe;
  color: #1e40af;
  border-color: rgba(59,130,246,0.25);
  --pill-dot: #3b82f6;
  cursor: default;
}
.sc-pill-schedule:hover { filter: none; transform: none; }

.sc-more {
  font-size: 0.58rem;
  color: var(--text-muted);
  font-weight: 600;
  padding: 1px 3px;
}

/* Multi-event count badge (shown when day has 2+ events) */
.sc-multi-badge {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 6px;
  padding: 2px 5px;
  width: 100%;
  box-sizing: border-box;
  cursor: pointer;
  transition: filter 0.12s;
}
.sc-multi-badge:hover { filter: brightness(0.96); }
.sc-multi-count {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-primary, #1a2d5a);
  line-height: 1;
}
.sc-multi-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1;
}
.sc-multi-dots {
  display: flex;
  gap: 2px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}
.sc-multi-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Legend ── */
.sc-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  padding: 0.65rem 1.4rem;
  border-top: 1.5px solid rgba(199,210,254,0.6);
  flex-shrink: 0;
  background: rgba(238,240,251,0.5);
}
.sc-legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}
.sc-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Right panel ── */
.sc-right {
  flex: 0 0 280px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  scrollbar-width: none;
}
.sc-right::-webkit-scrollbar { display: none; }

.sc-cta-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--accent, #2e4a87);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
  flex-shrink: 0;
  font-family: inherit;
}
.sc-cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.sc-cta-btn:active { transform: translateY(0); }

.sc-section {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  box-shadow: var(--shadow);
}
.sc-section-title {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.45rem;
}

/* Activity */
.sc-activity-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.32rem 0.5rem;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 0.1rem;
  width: 100%;
  border: none;
  background: transparent;
  font-family: inherit;
  text-align: left;
}
.sc-activity-card:hover { background: var(--bg-primary, #f0f2f8); }
.sc-activity-card:last-child { margin-bottom: 0; }
.sc-activity-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
}
.sc-activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sc-count-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 10px;
  min-width: 28px;
  text-align: center;
}
.sc-activity-loading { font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 0.5rem 0; }

@media (max-width: 768px) {
  .sc-section { border-radius: 10px; padding: 0.65rem 0.75rem; }
  .sc-section-title { font-size: 0.6rem; margin-bottom: 0.4rem; }
  .sc-activity-card { padding: 0.3rem 0.4rem; margin-bottom: 0.15rem; border-radius: 6px; }
  .sc-activity-label { gap: 0.4rem; font-size: 0.7rem; }
  .sc-activity-dot { width: 6px; height: 6px; }
  .sc-count-badge { font-size: 0.65rem; padding: 1px 7px; border-radius: 8px; min-width: 22px; }
  .sc-activity-loading { font-size: 0.7rem; }
}

/* Upcoming */
.sc-upcoming-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.4rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  margin-bottom: 0.2rem;
}
.sc-upcoming-item:hover { background: var(--bg-primary, #f0f2f8); }
.sc-upcoming-item:last-child { margin-bottom: 0; }
.sc-upcoming-date-badge {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--accent, #2e4a87);
  background: var(--accent-light);
  padding: 2px 7px;
  border-radius: 6px;
  flex-shrink: 0;
  min-width: 44px;
  text-align: center;
}
.sc-upcoming-info { flex: 1; min-width: 0; }
.sc-upcoming-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sc-upcoming-time { font-size: 0.68rem; color: var(--text-muted); }
.sc-upcoming-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Detail / appointment cards */
.sc-details-section {
  animation: scFadeIn 0.25s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sc-detail-sub {
  font-size: 0.63rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin: 0.5rem 0 0.35rem 0;
}
.sc-detail-sub:first-of-type { margin-top: 0; }

.sc-appt-card {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.8rem;
  margin-bottom: 0.6rem;
  animation: scSlideIn 0.2s ease;
}
.sc-appt-card:last-child { margin-bottom: 0; }
.sc-appt-card-highlight {
  background: #eef2fb !important;
  border-color: #1a2d5a !important;
  animation: scHighlightPulse 0.9s ease-in-out 3, scHighlightFade 0.5s ease 2.7s forwards;
}
@keyframes scHighlightPulse {
  0%   { box-shadow: 0 0 0 2px #1a2d5a, 0 4px 16px rgba(26,45,90,0.18); }
  50%  { box-shadow: 0 0 0 4px #1a2d5a, 0 6px 24px rgba(26,45,90,0.32); }
  100% { box-shadow: 0 0 0 2px #1a2d5a, 0 4px 16px rgba(26,45,90,0.18); }
}
@keyframes scHighlightFade {
  from { box-shadow: 0 0 0 2px #1a2d5a, 0 4px 16px rgba(26,45,90,0.18); border-color: #1a2d5a; }
  to   { box-shadow: none; border-color: var(--border-color); }
}
.sc-appt-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}
.sc-appt-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--accent-light);
  color: var(--accent, #2e4a87);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  border: 2px solid var(--accent, #2e4a87);
}
.sc-appt-avatar img { width: 100%; height: 100%; object-fit: cover; }
.sc-appt-info { flex: 1; min-width: 0; }
.sc-appt-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sc-appt-time { font-size: 0.72rem; color: var(--text-muted); margin-top: 1px; }
.sc-appt-badge {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 10px;
  border: 1px solid;
  flex-shrink: 0;
  white-space: nowrap;
}
.sc-appt-subject {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.6rem;
  padding: 0.3rem 0.6rem;
  background: var(--card-bg, #fff);
  border-radius: 6px;
  border-left: 2px solid var(--accent, #2e4a87);
}
.sc-appt-action {
  width: 100%;
  padding: 0.45rem;
  border-radius: 7px;
  border: 1.5px solid var(--accent, #2e4a87);
  background: transparent;
  color: var(--accent, #2e4a87);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.sc-appt-action:hover { background: var(--accent, #2e4a87); color: #fff; }

/* Slot items (faculty) */
.sc-slot-item {
  display: flex;
  gap: 0.6rem;
  padding: 0.55rem 0.7rem;
  background: var(--bg-primary, #f0f2f8);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 0.4rem;
  align-items: flex-start;
  animation: scSlideIn 0.2s ease;
}
.sc-slot-item:last-child { margin-bottom: 0; }
.sc-slot-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; margin-top: 4px; flex-shrink: 0; }
.sc-slot-info { flex: 1; min-width: 0; }
.sc-slot-time { font-size: 0.83rem; font-weight: 700; color: var(--text-primary); }
.sc-slot-meta { font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; margin-top: 2px; }

.sc-detail-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 1rem 0;
  color: var(--text-muted);
  text-align: center;
}
.sc-detail-empty p { margin: 0; font-size: 0.82rem; }

/* Google Calendar widget */
.sc-gcal-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.32rem 0.8rem;
  border-radius: 7px;
  border: none;
  background: #4285F4;
  color: white;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
}
.sc-gcal-btn:hover { opacity: 0.88; }
.sc-gcal-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.sc-gcal-sm-btn {
  background: none;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.28rem 0.6rem;
  font-size: 0.73rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
}
.sc-gcal-sm-btn:hover { border-color: var(--accent, #2e4a87); color: var(--accent, #2e4a87); }
.sc-gcal-empty {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.8rem;
  background: var(--bg-primary, #f0f2f8);
  border-radius: 8px;
  border: 1px dashed var(--border-color);
}
.sc-gcal-empty p { margin: 0; font-size: 0.78rem; color: var(--text-muted); }
.sc-gcal-event {
  display: flex;
  gap: 0.5rem;
  padding: 0.45rem 0.6rem;
  background: var(--bg-primary, #f0f2f8);
  border-radius: 7px;
  border: 1px solid var(--border-color);
  margin-bottom: 0.3rem;
  align-items: flex-start;
}
.sc-gcal-event:last-child { margin-bottom: 0; }
.sc-gcal-bar { width: 3px; border-radius: 3px; align-self: stretch; flex-shrink: 0; }
.sc-gcal-event-title { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sc-gcal-event-time { font-size: 0.68rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem; margin-top: 1px; }
.sc-gcal-day-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--accent, #2e4a87); margin: 0.4rem 0 0.25rem 0; }
.sc-gcal-day-label:first-child { margin-top: 0; }

/* ── Dark mode ── */
.dashboard-fixed-wrapper.dark .sc-left,
.faculty-dashboard-wrapper.dark .sc-left {
  background: rgba(12,14,26,0.97);
  border-color: rgba(99,102,241,0.25);
  box-shadow: 0 4px 24px rgba(0,0,0,0.4);
}
.dashboard-fixed-wrapper.dark .sc-cal-header,
.dashboard-fixed-wrapper.dark .sc-filter-bar,
.faculty-dashboard-wrapper.dark .sc-cal-header,
.faculty-dashboard-wrapper.dark .sc-filter-bar {
  background: rgba(12,14,26,0.97);
  border-color: rgba(99,102,241,0.2);
}
.dashboard-fixed-wrapper.dark .sc-weekday,
.faculty-dashboard-wrapper.dark .sc-weekday {
  background: rgba(15,17,48,0.9);
  color: #818cf8;
  border-color: rgba(99,102,241,0.2);
}
.dashboard-fixed-wrapper.dark .sc-month-label,
.faculty-dashboard-wrapper.dark .sc-month-label { color: #e0e7ff; }
.dashboard-fixed-wrapper.dark .sc-day,
.faculty-dashboard-wrapper.dark .sc-day { border-color: rgba(99,102,241,0.15); }
.dashboard-fixed-wrapper.dark .sc-day-empty,
.faculty-dashboard-wrapper.dark .sc-day-empty {
  background: rgba(15,17,48,0.5);
  border-color: rgba(99,102,241,0.15);
}
.dashboard-fixed-wrapper.dark .sc-day:hover,
.faculty-dashboard-wrapper.dark .sc-day:hover { background: rgba(99,102,241,0.1); }
.dashboard-fixed-wrapper.dark .sc-day-selected,
.faculty-dashboard-wrapper.dark .sc-day-selected { background: rgba(99,102,241,0.12); }
.dashboard-fixed-wrapper.dark .sc-legend,
.faculty-dashboard-wrapper.dark .sc-legend {
  background: rgba(15,17,48,0.5);
  border-color: rgba(99,102,241,0.2);
}

/* ── Popover ── */
.sc-popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 998;
}
.sc-popover {
  position: fixed;
  z-index: 999;
  background: var(--bg-secondary, #fff);
  border: 1px solid var(--border-color, rgba(199,210,254,0.7));
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.14), 0 2px 10px rgba(79,70,229,0.08);
  padding: 1.1rem 1.2rem;
  min-width: 230px;
  max-width: 290px;
  animation: scPopIn 0.16s ease;
}
@keyframes scPopIn {
  from { opacity: 0; transform: scale(0.93) translateY(-6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.sc-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.7rem;
  gap: 0.5rem;
}
.sc-popover-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary, #1a1744);
  line-height: 1.3;
}
.sc-popover-close {
  background: none;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  font-size: 1.1rem;
  flex-shrink: 0;
}
.sc-popover-close:hover { color: var(--text-primary, #1a1744); }
.sc-popover-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.76rem;
  color: var(--text-secondary, #374151);
  margin-bottom: 0.35rem;
}
.sc-popover-badge {
  font-size: 0.66rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
}
.sc-popover-action {
  margin-top: 0.9rem;
  width: 100%;
  padding: 0.5rem 0;
  border-radius: 9px;
  border: none;
  background: var(--accent-orange, #4338ca);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.15s, transform 0.1s;
}
.sc-popover-action:hover { opacity: 0.9; transform: translateY(-1px); }

/* ── Skeleton shimmer ── */
@keyframes sc-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.sc-skel {
  background: linear-gradient(90deg, #eef0f6 25%, #dde1ec 50%, #eef0f6 75%);
  background-size: 200% 100%;
  animation: sc-shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}
.dark .sc-skel {
  background: linear-gradient(90deg, #1e2440 25%, #252d4a 50%, #1e2440 75%);
  background-size: 200% 100%;
}

/* Calendar cell shimmer */
.sc-day-skel {
  min-height: 90px;
  border-right: 1.5px solid #94a3b8;
  border-bottom: 1.5px solid #94a3b8;
  padding: 0.5rem 0.45rem;
}
.sc-day-skel-num {
  width: 22px; height: 22px; border-radius: 50%;
}
@media (max-width: 600px) {
  .sc-day-skel { min-height: 46px; padding: 0.25rem 0.2rem; }
  .sc-day-skel-num { width: 16px; height: 16px; }
}
@media (max-width: 430px) {
  .sc-day-skel { min-height: 38px; padding: 0.2rem 0.15rem; }
  .sc-day-skel-num { width: 14px; height: 14px; }
}

/* Activity row shimmer */
.sc-skel-activity-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.sc-skel-dot  { width: 8px;  height: 8px;  border-radius: 50%; flex-shrink: 0; }
.sc-skel-label{ flex: 1;     height: 13px; }
.sc-skel-badge{ width: 30px; height: 20px; border-radius: 20px; flex-shrink: 0; }

/* Upcoming row shimmer */
.sc-skel-upcoming-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.sc-skel-date  { width: 44px; height: 38px; border-radius: 8px; flex-shrink: 0; }
.sc-skel-info  { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.sc-skel-name  { height: 13px; width: 80%; }
.sc-skel-time  { height: 10px; width: 50%; }

/* ── Responsive ── */

/* iPad landscape: stack calendar + panel */
@media (max-width: 1100px) {
  .sc-layout { flex-direction: column; height: auto; width: 100%; }
  .sc-left  { flex: none !important; width: 100% !important; height: auto; }
  .sc-right { flex: none !important; width: 100% !important; height: auto; overflow-y: visible; }
}

/* iPad portrait */
@media (max-width: 900px) {
  .sc-day { padding: 0.3rem 0.25rem; min-height: 70px; }
  .sc-day-empty { min-height: 70px; }
  .sc-weekday { padding: 0.35rem 0; font-size: 0.58rem; }
  .sc-pill { font-size: 0.52rem; padding: 2px 5px; }
}

/* Large phones / small tablets */
@media (max-width: 600px) {
  .sc-multi-label { display: none; }
  .sc-layout { gap: 0.8rem; }
  .sc-cal-header { padding: 0.6rem 0.9rem; gap: 0.4rem; }
  .sc-month-label { font-size: 0.92rem; }
  .sc-today-btn { font-size: 0.7rem; padding: 0.22rem 0.55rem; }
  .sc-nav-btn { width: 24px; height: 24px; }
  .sc-filter-bar { padding: 0.45rem 0.9rem; gap: 0.3rem; }
  .sc-filter-chip { padding: 0.24rem 0.65rem; font-size: 0.7rem; }
  .sc-day { padding: 0.25rem 0.2rem; min-height: 54px; }
  .sc-day-empty { min-height: 54px; }
  .sc-day-num { width: 20px; height: 20px; font-size: 0.72rem; }
  .sc-popover {
    position: fixed;
    left: 0.75rem !important; right: 0.75rem !important;
    bottom: 5.5rem !important; top: auto !important;
    max-width: unset; width: auto; border-radius: 18px;
  }
}

/* iPhone (375–430px) */
@media (max-width: 430px) {
  .sc-cal-header { padding: 0.5rem 0.75rem; }
  .sc-month-label { font-size: 0.85rem; }
  .sc-today-btn { font-size: 0.65rem; padding: 0.18rem 0.45rem; }
  .sc-nav-btn { width: 22px; height: 22px; }
  .sc-filter-bar { padding: 0.4rem 0.75rem; }
  .sc-filter-chip { padding: 0.2rem 0.55rem; font-size: 0.65rem; }
  .sc-day { min-height: 46px; padding: 0.2rem 0.15rem; }
  .sc-day-empty { min-height: 46px; }
  .sc-day-num { width: 18px; height: 18px; font-size: 0.65rem; }
  .sc-weekday { font-size: 0.52rem; }
  .sc-pill { font-size: 0.48rem; padding: 1px 4px; }
  .sc-legend { gap: 0.5rem; padding: 0.5rem 0.75rem; }
  .sc-legend-item { font-size: 0.68rem; }
}

/* Large monitors: give calendar more breathing room */
@media (min-width: 1440px) {
  .sc-layout { gap: 2rem; }
}
`;

/**
 * SharedCalendarGrid — the left calendar panel.
 * Props:
 *   year, month, todayStr, selectedDate, statusFilter, filterOptions,
 *   cells (pre-built array of day elements),
 *   legendItems [{ color, label }],
 *   headerExtra (optional JSX slotted into the header, e.g. Google button),
 *   onPrev, onNext, onToday, onFilterChange
 */
const SharedCalendarGrid = ({
  year,
  month,
  todayStr,
  selectedDate,
  statusFilter,
  filterOptions = ['All', 'Approved', 'Pending'],
  cells,
  legendItems,
  headerExtra,
  onPrev,
  onNext,
  onToday,
  onFilterChange,
}) => (
  <div className="sc-left">
    <div className="sc-cal-header">
      <span className="sc-month-label">{MONTH_NAMES[month]} {year}</span>
      <div className="sc-nav-group">
        <button className="sc-today-btn" onClick={onToday}>Today</button>
        <button className="sc-nav-btn" onClick={onPrev} aria-label="Previous month"><ChevronLeft size={15} /></button>
        <button className="sc-nav-btn" onClick={onNext} aria-label="Next month"><ChevronRight size={15} /></button>
      </div>
      {headerExtra}
    </div>

    <div className="sc-filter-bar">
      {filterOptions.map(f => (
        <button
          key={f}
          className={`sc-filter-chip ${statusFilter === f ? 'active' : ''}`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>

    <div className="sc-grid">
      {WEEKDAYS.map(d => <div key={d} className="sc-weekday">{d}</div>)}
      {cells}
    </div>

    <div className="sc-legend">
      {legendItems.map(({ color, label }) => (
        <div key={label} className="sc-legend-item">
          <span className="sc-legend-dot" style={{ background: color }} />
          {label}
        </div>
      ))}
    </div>
  </div>
);

export default SharedCalendarGrid;
