import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Users, GraduationCap, CalendarClock, CheckCircle, XCircle, Clock, X, BarChart2, Download, Search, ListFilter } from 'lucide-react';
import { getAllProfiles, getAllRequestsAdmin } from '../../supabase/api';
import { getInitials, fmt12 } from '../../utils/dateUtils';

const REQ_STATUS_STYLE = {
  Pending:   { bg: '#fef3c7', color: '#7c5200',  border: '#d97706' },
  Approved:  { bg: '#dbeafe', color: '#1e3a8a',  border: '#3b82f6' },
  Declined:  { bg: '#fee2e2', color: '#b91c1c',  border: '#f87171' },
  Completed: { bg: '#dcfce7', color: '#14532d',  border: '#22c55e' },
  Cancelled: { bg: '#f3f4f6', color: '#374151',  border: '#9ca3af' },
};

const STATUS_COLORS = {
  Pending:   '#eab308',
  Approved:  '#3b82f6',
  Declined:  '#ef4444',
  Completed: '#22c55e',
  Cancelled: '#9ca3af',
};

const STATUS_DOT_COLOR = {
  Available:   '#22c55e',
  Busy:        '#ff1744',
  Unavailable: '#ef4444',
};

const AVATAR_COLORS = ['#5bc8c8','#2e4a87','#7c3aed','#0891b2','#0d9488','#6366f1'];
const nameToColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

const ALL_STATUSES = ['Pending','Approved','Declined','Completed','Cancelled'];

// ── Pure-SVG donut chart ──────────────────────────────────────────────────────
const DonutChart = ({ data, size = 160 }) => {
  const r = 52, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>No data</div>;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circumference;
        const gap  = circumference - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={d.color} strokeWidth={22}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.4s ease' }}
          />
        );
        offset += dash;
        return el;
      })}
      <circle cx={cx} cy={cy} r={r - 11} fill="var(--card-bg, #fff)" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text-primary)">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontWeight="600">TOTAL</text>
    </svg>
  );
};

// ── Pure-CSS bar chart ────────────────────────────────────────────────────────
const BarChart = ({ weeks }) => {
  if (!weeks || weeks.length === 0) return <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', padding: '2rem 0', textAlign: 'center' }}>No data for this period.</div>;
  const max = Math.max(...weeks.map(w => w.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, padding: '0 4px' }}>
      {weeks.map((w, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700 }}>{w.count || ''}</span>
          <div style={{ width: '100%', height: Math.max(4, (w.count / max) * 90), background: '#3b82f6', borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease', minHeight: 4 }} />
          <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>{w.label}</span>
        </div>
      ))}
    </div>
  );
};

// ── Date range helpers ────────────────────────────────────────────────────────
const isoDate = (d) => d.toISOString().split('T')[0];

const getRangeStart = (range, customFrom) => {
  const now = new Date();
  if (range === 'week')  { const d = new Date(now); d.setDate(now.getDate() - 6); return isoDate(d); }
  if (range === 'month') { const d = new Date(now); d.setDate(now.getDate() - 29); return isoDate(d); }
  if (range === 'quarter') { const d = new Date(now); d.setDate(now.getDate() - 89); return isoDate(d); }
  return customFrom || isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
};

const buildWeekBuckets = (requests, from, to) => {
  const start = new Date(from + 'T00:00:00');
  const end   = new Date(to   + 'T23:59:59');
  const days  = Math.round((end - start) / 86400000) + 1;
  if (days <= 14) {
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const ds = isoDate(d);
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: requests.filter(r => r.createdAt?.startsWith(ds)).length,
      };
    });
  }
  const weeks = Math.ceil(days / 7);
  return Array.from({ length: weeks }, (_, i) => {
    const ws = new Date(start); ws.setDate(start.getDate() + i * 7);
    const we = new Date(ws);    we.setDate(ws.getDate() + 6);
    return {
      label: ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: requests.filter(r => {
        const d = r.createdAt?.split('T')[0];
        return d >= isoDate(ws) && d <= isoDate(we);
      }).length,
    };
  });
};

// ── CSV export ────────────────────────────────────────────────────────────────
const exportCSV = (requests, profiles) => {
  const nameMap = profiles.reduce((m, p) => { m[p.id] = p.full_name; return m; }, {});
  const rows = [
    ['ID','Status','Date','Student','Faculty','Department','Subject','Created At'],
    ...requests.map(r => [
      r.id, r.status, r.date || '', r.studentName || nameMap[r.studentId] || '',
      r.facultyName || nameMap[r.facultyId] || '', r.facultyDept || '',
      r.subject || '', r.createdAt || '',
    ]),
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `requests_${isoDate(new Date())}.csv`; a.click();
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────────────────────

const adminStyles = `
.admin-container { animation: fadeIn 0.4s ease; max-width: 1200px; }
@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

.admin-header {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 16px; padding: 1.5rem 1.8rem; margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}
.admin-header h2 { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -0.5px; }
.admin-header p  { color: var(--text-muted); font-size: 0.9rem; margin: 0.2rem 0 0; }
.admin-header-right { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }

.admin-tab-bar {
  display: flex; gap: 0.35rem; margin-bottom: 1.4rem;
  background: var(--bg-primary, #f0f2f8); border: 1px solid var(--border-color);
  border-radius: 11px; padding: 4px; width: fit-content;
}
.admin-tab {
  padding: 0.38rem 1.1rem; border-radius: 8px; border: none;
  background: transparent; color: var(--text-muted);
  font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.15s; white-space: nowrap;
}
.admin-tab:hover { color: var(--text-primary); }
.admin-tab.active { background: #1a2d5a; color: #fff; }

.admin-refresh-btn, .admin-export-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem; border: none; border-radius: 8px;
  font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
}
.admin-refresh-btn { background: var(--accent-orange, #2e4a87); color: white; }
.admin-refresh-btn:hover { opacity: 0.88; transform: translateY(-1px); }
.admin-refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.admin-export-btn { background: var(--bg-primary); color: var(--text-secondary); border: 1.5px solid var(--border-color); }
.admin-export-btn:hover { border-color: #1a2d5a; color: #1a2d5a; }

.admin-metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 960px) { .admin-metrics { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 700px) { .admin-metrics { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 420px) { .admin-metrics { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; } }

.admin-metric-card {
  background: var(--bg-secondary);
  border: 1.5px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem 1.1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  position: relative;
  overflow: hidden;
}
.admin-metric-card::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--active-color, transparent);
  opacity: 0;
  transition: opacity 0.15s;
  border-radius: 14px 14px 0 0;
}
.admin-metric-card-top { display: flex; align-items: center; justify-content: space-between; }
.admin-metric-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.admin-metric-value { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1; letter-spacing: -1px; }
.admin-metric-label { font-size: 0.72rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.admin-metric-card.clickable {
  cursor: pointer;
  transition: transform 0.14s ease, box-shadow 0.14s ease, border-color 0.14s ease;
  user-select: none;
}
.admin-metric-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: color-mix(in srgb, var(--active-color, #6366f1) 40%, var(--border-color));
}
.admin-metric-card.clickable:hover::after { opacity: 0.5; }
.admin-metric-card.clickable.active {
  border-color: var(--active-color, #6366f1);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--active-color, #6366f1) 18%, transparent), 0 4px 16px rgba(0,0,0,0.08);
  transform: translateY(-2px);
}
.admin-metric-card.clickable.active::after { opacity: 1; }

.admin-section {
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; padding: 1.4rem; margin-bottom: 1.5rem; box-shadow: var(--shadow);
}
.admin-section-title {
  font-size: 1rem; font-weight: 700; color: var(--text-primary);
  margin: 0 0 1rem; padding-bottom: 0.6rem; border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
}

.admin-body { display: flex; gap: 1rem; align-items: flex-start; }
.admin-left { flex: 1 1 0; min-width: 0; }

.admin-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.admin-table th {
  text-align: left; padding: 0.5rem 0.8rem;
  color: var(--text-muted); font-size: 0.72rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border-color);
}
.admin-table td { padding: 0.7rem 0.8rem; color: var(--text-primary); border-bottom: 1px solid var(--border-color); vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr.clickable { cursor: pointer; }
.admin-table tr.clickable:hover td { background: var(--bg-primary); }
.admin-table tr.row-selected td { background: rgba(99,102,241,0.07) !important; }

.admin-role-badge { font-size: 0.68rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.admin-role-badge.faculty  { background: rgba(99,102,241,0.12);  color: #3730a3; border: 1px solid rgba(99,102,241,0.3); }
.admin-role-badge.student  { background: rgba(34,197,94,0.12);   color: #166534; border: 1px solid rgba(34,197,94,0.3); }
.admin-role-badge.no-role  { background: rgba(239,68,68,0.1);    color: #b91c1c; border: 1px solid rgba(239,68,68,0.3); }

.admin-status-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 5px; }
.admin-req-count { display: inline-flex; align-items: center; justify-content: center; min-width: 22px; height: 20px; padding: 0 6px; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 10px; font-size: 0.68rem; font-weight: 700; color: var(--text-muted); }
.admin-empty { text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 2rem 0; }

.admin-detail-panel {
  width: 320px; flex-shrink: 0;
  background: var(--bg-secondary); border: 1px solid var(--border-color);
  border-radius: 14px; overflow: hidden; box-shadow: var(--shadow);
  animation: adminDetailIn 0.2s ease;
}
@keyframes adminDetailIn { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
.admin-detail-head { padding: 1.1rem 1rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: flex-start; gap: 0.7rem; }
.admin-detail-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.admin-detail-info { flex: 1; min-width: 0; }
.admin-detail-name { font-size: 0.9rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.3rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-detail-meta { font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; }
.admin-detail-close { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.25rem; border-radius: 6px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: color 0.12s, background 0.12s; }
.admin-detail-close:hover { background: var(--bg-primary); color: var(--text-primary); }
.admin-detail-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.45rem; padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-color); }
.admin-detail-stat { background: var(--bg-primary); border-radius: 8px; padding: 0.5rem 0.65rem; }
.admin-detail-stat-val { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }
.admin-detail-stat-lbl { font-size: 0.62rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
.admin-detail-history { padding: 0.85rem 1rem; max-height: 460px; overflow-y: auto; scrollbar-width: none; }
.admin-detail-history::-webkit-scrollbar { display: none; }
.admin-detail-hist-title { font-size: 0.63rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin: 0 0 0.6rem; }
.admin-req-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 9px; padding: 0.65rem 0.75rem; margin-bottom: 0.4rem; display: flex; flex-direction: column; gap: 0.25rem; }
.admin-req-card:last-child { margin-bottom: 0; }
.admin-req-card-top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.admin-req-card-name { font-size: 0.8rem; font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-req-status { font-size: 0.6rem; font-weight: 700; padding: 2px 7px; border-radius: 9px; border: 1px solid; flex-shrink: 0; white-space: nowrap; }
.admin-req-card-meta { font-size: 0.68rem; color: var(--text-muted); }
.admin-req-card-subject { font-size: 0.68rem; color: var(--text-secondary); font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-detail-empty { text-align: center; padding: 1.5rem 0; color: var(--text-muted); font-size: 0.8rem; }

/* Reports */
.admin-report-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.2rem; align-items: center; }
.admin-report-chip { padding: 0.32rem 0.9rem; border-radius: 50px; border: 1.5px solid var(--border-color); background: var(--bg-secondary); color: var(--text-muted); font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.13s; white-space: nowrap; }
.admin-report-chip:hover { border-color: #1a2d5a; color: #1a2d5a; }
.admin-report-chip.active { background: #1a2d5a; color: #fff; border-color: #1a2d5a; }
.admin-report-date-range { display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.admin-report-date-input { padding: 0.32rem 0.6rem; border: 1.5px solid var(--border-color); border-radius: 8px; font-size: 0.78rem; font-family: inherit; color: var(--text-primary); background: var(--bg-secondary); outline: none; }
.admin-report-date-input:focus { border-color: #1a2d5a; }

.admin-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.2rem; }
@media (max-width: 700px) { .admin-charts-grid { grid-template-columns: 1fr; } }
.admin-chart-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.1rem 1.2rem; box-shadow: var(--shadow); }
.admin-chart-title { font-size: 0.82rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.2rem; }
.admin-chart-sub { font-size: 0.7rem; color: var(--text-muted); margin: 0 0 1rem; }
.admin-legend { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; margin-top: 0.85rem; }
.admin-legend-item { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; }
.admin-legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }

.admin-perf-table th { font-size: 0.68rem; padding: 0.4rem 0.65rem; }
.admin-perf-table td { font-size: 0.82rem; padding: 0.6rem 0.65rem; }
.admin-perf-bar-wrap { height: 6px; background: var(--bg-primary); border-radius: 4px; overflow: hidden; min-width: 60px; }
.admin-perf-bar { height: 100%; border-radius: 4px; background: #22c55e; transition: width 0.4s ease; }

@media (max-width: 900px) {
  .admin-body { flex-direction: column; }
  .admin-detail-panel { width: 100%; }
}

/* ── Appointments tab ── */
.appt-controls {
  display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;
  margin-bottom: 1rem;
}
.appt-search-wrap {
  position: relative; flex: 1 1 200px; min-width: 160px;
}
.appt-search-wrap svg {
  position: absolute; left: 0.7rem; top: 50%; transform: translateY(-50%);
  color: var(--text-muted); pointer-events: none;
}
.appt-search {
  width: 100%; padding: 0.48rem 0.75rem 0.48rem 2.1rem;
  border: 1.5px solid var(--border-color); border-radius: 9px;
  background: var(--bg-secondary); color: var(--text-primary);
  font-size: 0.82rem; font-family: inherit; outline: none;
  transition: border-color 0.13s;
}
.appt-search:focus { border-color: #1a2d5a; }
.appt-search::placeholder { color: var(--text-muted); }

.appt-filter-row { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; }
.appt-chip {
  padding: 0.3rem 0.85rem; border-radius: 50px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-secondary); color: var(--text-muted);
  font-size: 0.75rem; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.13s; white-space: nowrap;
}
.appt-chip:hover { border-color: #1a2d5a; color: #1a2d5a; }
.appt-chip.active { background: #1a2d5a; color: #fff; border-color: #1a2d5a; }

.appt-date-range { display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; }
.appt-date-input {
  padding: 0.3rem 0.55rem; border: 1.5px solid var(--border-color);
  border-radius: 8px; font-size: 0.75rem; font-family: inherit;
  color: var(--text-primary); background: var(--bg-secondary); outline: none;
}
.appt-date-input:focus { border-color: #1a2d5a; }

.appt-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.appt-table th {
  text-align: left; padding: 0.45rem 0.75rem;
  color: var(--text-muted); font-size: 0.68rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color); white-space: nowrap;
}
.appt-table td {
  padding: 0.65rem 0.75rem; color: var(--text-primary);
  border-bottom: 1px solid var(--border-color); vertical-align: middle;
}
.appt-table tr:last-child td { border-bottom: none; }
.appt-table tr:hover td { background: var(--bg-primary); }

.appt-student-name { font-weight: 700; color: var(--text-primary); }
.appt-student-prog { font-size: 0.68rem; color: var(--text-muted); margin-top: 1px; }
.appt-faculty-name { font-weight: 600; }
.appt-faculty-dept { font-size: 0.68rem; color: var(--text-muted); }
.appt-subject     { font-weight: 600; color: var(--text-primary); }
.appt-type        { font-size: 0.68rem; color: var(--text-muted); margin-top: 1px; }
.appt-time        { font-size: 0.78rem; color: var(--text-secondary); }
.appt-created     { font-size: 0.72rem; color: var(--text-muted); }

.appt-status {
  font-size: 0.65rem; font-weight: 700; padding: 2px 8px;
  border-radius: 9px; border: 1px solid; white-space: nowrap;
}
.appt-count-label {
  font-size: 0.75rem; color: var(--text-muted); font-weight: 600;
  padding: 0.2rem 0; flex-shrink: 0;
}
`;

const AdminContent = () => {
  const [tab, setTab] = useState('overview');
  const [profiles, setProfiles] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  // Appointments tab filters
  const [apptSearch,      setApptSearch]      = useState('');
  const [apptStatus,      setApptStatus]      = useState('All');
  const [apptDatePreset,  setApptDatePreset]  = useState('all');
  const [apptCustomFrom,  setApptCustomFrom]  = useState('');
  const [apptCustomTo,    setApptCustomTo]    = useState('');

  // Reports filters
  const [rangePreset, setRangePreset] = useState('month');
  const today = isoDate(new Date());
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState(today);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, r] = await Promise.all([getAllProfiles(), getAllRequestsAdmin()]);
    setProfiles(p);
    setRequests(r);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived: overview ──────────────────────────────────────────────────────
  const faculty  = profiles.filter(p => p.role === 'faculty');
  const students = profiles.filter(p => p.role === 'student');
  const counts   = ALL_STATUSES.reduce((acc, s) => { acc[s] = requests.filter(r => r.status === s).length; return acc; }, {});

  const metrics = [
    { label: 'Faculty',        value: faculty.length,    icon: Users,         color: '#6366f1', filter: 'Faculty' },
    { label: 'Students',       value: students.length,   icon: GraduationCap, color: '#22c55e', filter: 'Students' },
    { label: 'Total Requests', value: requests.length,   icon: CalendarClock, color: '#f97316', filter: 'Total Requests' },
    { label: 'Pending',        value: counts.Pending,    icon: Clock,         color: '#eab308', filter: 'Pending' },
    { label: 'Approved',       value: counts.Approved,   icon: CheckCircle,   color: '#3b82f6', filter: 'Approved' },
    { label: 'Declined',       value: counts.Declined,   icon: XCircle,       color: '#ef4444', filter: 'Declined' },
    { label: 'Completed',      value: counts.Completed,  icon: CheckCircle,   color: '#22c55e', filter: 'Completed' },
    { label: 'Cancelled',      value: counts.Cancelled,  icon: XCircle,       color: '#9ca3af', filter: 'Cancelled' },
  ];

  // IDs of users who have at least one request with the filtered status
  const usersWithStatus = (status) => {
    const fIds = new Set(requests.filter(r => r.status === status).map(r => r.facultyId).filter(Boolean));
    const sIds = new Set(requests.filter(r => r.status === status).map(r => r.studentId).filter(Boolean));
    return { fIds, sIds };
  };

  const filteredProfiles = (() => {
    if (!activeFilter) return profiles;
    if (activeFilter === 'Faculty') return profiles.filter(p => p.role === 'faculty');
    if (activeFilter === 'Students') return profiles.filter(p => p.role === 'student');
    if (activeFilter === 'Total Requests') return profiles.filter(p =>
      requests.some(r => r.facultyId === p.id || r.studentId === p.id));
    const { fIds, sIds } = usersWithStatus(activeFilter);
    return profiles.filter(p => (p.role === 'faculty' ? fIds : sIds).has(p.id));
  })();

  const profileNameMap = profiles.reduce((acc, p) => { acc[p.id] = p.full_name; return acc; }, {});

  const userRequests = selectedUser
    ? requests.filter(r => selectedUser.role === 'faculty' ? r.facultyId === selectedUser.id : r.studentId === selectedUser.id)
    : [];

  const userStats = {
    total:     userRequests.length,
    pending:   userRequests.filter(r => r.status === 'Pending').length,
    approved:  userRequests.filter(r => r.status === 'Approved').length,
    declined:  userRequests.filter(r => r.status === 'Declined').length,
  };

  const getUserReqCount = (userId, role) =>
    role === 'faculty' ? requests.filter(r => r.facultyId === userId).length
                       : requests.filter(r => r.studentId === userId).length;

  // ── Derived: reports ───────────────────────────────────────────────────────
  const fromDate = rangePreset === 'custom' ? (customFrom || getRangeStart('month', null)) : getRangeStart(rangePreset, null);
  const toDate   = rangePreset === 'custom' ? (customTo || today) : today;

  const filteredRequests = requests.filter(r => {
    const d = r.createdAt?.split('T')[0] || r.date || '';
    return d >= fromDate && d <= toDate;
  });

  const donutData = ALL_STATUSES.map(s => ({
    label: s, value: filteredRequests.filter(r => r.status === s).length, color: STATUS_COLORS[s],
  })).filter(d => d.value > 0);

  const weekBuckets = buildWeekBuckets(filteredRequests, fromDate, toDate);

  // Faculty performance: approved + declined per faculty
  const facultyPerf = faculty.map(f => {
    const reqs = filteredRequests.filter(r => r.facultyId === f.id);
    const total    = reqs.length;
    const approved = reqs.filter(r => r.status === 'Approved').length;
    const declined = reqs.filter(r => r.status === 'Declined').length;
    const pending  = reqs.filter(r => r.status === 'Pending').length;
    const completed = reqs.filter(r => r.status === 'Completed').length;
    const responseRate = total > 0 ? Math.round(((approved + declined + completed) / total) * 100) : 0;
    return { id: f.id, name: f.full_name || '—', dept: 'CCS', total, approved, declined, pending, completed, responseRate };
  }).filter(f => f.total > 0).sort((a, b) => b.total - a.total);

  // ── Derived: appointments tab ──────────────────────────────────────────────
  const apptDateFrom = (() => {
    if (apptDatePreset === 'custom') return apptCustomFrom || null;
    if (apptDatePreset === 'today') return today;
    if (apptDatePreset === 'week')  { const d = new Date(); d.setDate(d.getDate() - 6); return isoDate(d); }
    if (apptDatePreset === 'month') { const d = new Date(); d.setDate(d.getDate() - 29); return isoDate(d); }
    return null;
  })();
  const apptDateTo = apptDatePreset === 'custom' ? (apptCustomTo || today) : today;

  const filteredAppts = requests.filter(r => {
    const q = apptSearch.trim().toLowerCase();
    if (q && !(r.studentName?.toLowerCase().includes(q) || r.facultyName?.toLowerCase().includes(q))) return false;
    if (apptStatus !== 'All' && r.status !== apptStatus) return false;
    if (apptDatePreset !== 'all') {
      const d = r.date || r.createdAt?.split('T')[0] || '';
      if (apptDateFrom && d < apptDateFrom) return false;
      if (d > apptDateTo) return false;
    }
    return true;
  });

  const exportApptsCSV = () => {
    const rows = [
      ['Student','Program','Faculty','Dept','Date','Time','Type','Subject','Status','Submitted'],
      ...filteredAppts.map(r => {
        const progAbbr = r.studentProgram ? ((r.studentProgram.match(/\(([^)]+)\)/) || [])[1] || r.studentProgram) : '—';
        const timeStr  = r.startTime ? `${fmt12(r.startTime)}${r.endTime ? ` – ${fmt12(r.endTime)}` : ''}` : '—';
        return [
          r.studentName, progAbbr, r.facultyName, r.facultyDept || 'CCS',
          r.date || '—', timeStr, r.consultationType || '—',
          r.subject || '—', r.status, r.createdAt?.split('T')[0] || '—',
        ];
      }),
    ];
    const csv  = rows.map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `appointments_${today}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-container">
      <style>{adminStyles}</style>

      {/* Header */}
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>System overview — users &amp; consultation requests</p>
        </div>
        <div className="admin-header-right">
          {tab === 'reports' && (
            <button className="admin-export-btn" onClick={() => exportCSV(filteredRequests, profiles)}>
              <Download size={14} /> Export CSV
            </button>
          )}
          {tab === 'appointments' && (
            <button className="admin-export-btn" onClick={exportApptsCSV}>
              <Download size={14} /> Export CSV
            </button>
          )}
          <button className="admin-refresh-btn" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="admin-tab-bar">
        <button className={`admin-tab${tab === 'overview'      ? ' active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`admin-tab${tab === 'appointments'  ? ' active' : ''}`} onClick={() => setTab('appointments')}><CalendarClock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Appointments</button>
        <button className={`admin-tab${tab === 'reports'       ? ' active' : ''}`} onClick={() => setTab('reports')}><BarChart2 size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />Reports</button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <>
          <div className="admin-metrics">
            {metrics.map(m => {
              const isActive = activeFilter === m.filter;
              return (
                <div
                  key={m.label}
                  className={`admin-metric-card clickable${isActive ? ' active' : ''}`}
                  style={{ '--active-color': m.color }}
                  onClick={() => setActiveFilter(prev => prev === m.filter ? null : m.filter)}
                  title={isActive ? `Clear filter: ${m.label}` : `Filter by: ${m.label}`}
                >
                  <div className="admin-metric-card-top">
                    <div className="admin-metric-label">{m.label}</div>
                    <div className="admin-metric-icon" style={{ background: `${m.color}${isActive ? '28' : '14'}`, color: m.color }}>
                      <m.icon size={17} />
                    </div>
                  </div>
                  <div className="admin-metric-value" style={{ color: isActive ? m.color : 'var(--text-primary)' }}>
                    {loading ? '…' : m.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="admin-section">
            <p className="admin-section-title">
              {activeFilter ? (
                <>
                  {activeFilter}
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.82rem' }}>— {filteredProfiles.length} user{filteredProfiles.length !== 1 ? 's' : ''}</span>
                  <button
                    onClick={() => setActiveFilter(null)}
                    style={{ marginLeft: 'auto', padding: '0.2rem 0.75rem', borderRadius: 20, border: '1.5px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.13s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a2d5a'; e.currentTarget.style.color = '#1a2d5a'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    ✕ Reset
                  </button>
                </>
              ) : (
                <>
                  User Roles ({profiles.length})
                  <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.8rem' }}>— click a card or row to filter</span>
                </>
              )}
            </p>
            <div className="admin-body">
              <div className="admin-left">
                {loading ? (
                  <div className="admin-empty">Loading…</div>
                ) : filteredProfiles.length === 0 ? (
                  <div className="admin-empty">No users match this filter.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th><th>Dept / Program</th><th>Status</th>
                          <th>Joined</th><th>Role</th><th style={{ textAlign: 'center' }}>Requests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProfiles.map(p => {
                          const dotColor = STATUS_DOT_COLOR[p.status] || '#9ca3af';
                          const isSelected = selectedUser?.id === p.id;
                          const reqCount = getUserReqCount(p.id, p.role);
                          const avatarBg = p.avatar_color || nameToColor(p.full_name || '');
                          const deptOrProgram = p.role === 'faculty'
                            ? 'CCS'
                            : (p.program ? ((p.program.match(/\(([^)]+)\)/) || [])[1] || p.program) : '—');
                          return (
                            <tr key={p.id} className={`clickable${isSelected ? ' row-selected' : ''}`} onClick={() => setSelectedUser(prev => prev?.id === p.id ? null : p)}>
                              <td style={{ fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, flexShrink: 0 }}>
                                    {getInitials(p.full_name)}
                                  </div>
                                  {p.full_name || '—'}
                                </div>
                              </td>
                              <td style={{ color: 'var(--text-muted)' }}>{deptOrProgram}</td>
                              <td><span className="admin-status-dot" style={{ background: dotColor }} />{p.status || '—'}</td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{fmtDate(p.created_at)}</td>
                              <td>
                                <span className={`admin-role-badge ${p.role === 'faculty' ? 'faculty' : p.role === 'student' ? 'student' : 'no-role'}`}>
                                  {p.role === 'faculty' ? 'Faculty' : p.role === 'student' ? 'Student' : 'No Role'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}><span className="admin-req-count">{reqCount}</span></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedUser && (
                <div className="admin-detail-panel">
                  <div className="admin-detail-head">
                    <div className="admin-detail-avatar" style={{ background: selectedUser.avatar_color || nameToColor(selectedUser.full_name || '') }}>
                      {getInitials(selectedUser.full_name)}
                    </div>
                    <div className="admin-detail-info">
                      <p className="admin-detail-name">{selectedUser.full_name || '—'}</p>
                      <div className="admin-detail-meta">
                        <span className={`admin-role-badge ${selectedUser.role === 'faculty' ? 'faculty' : selectedUser.role === 'student' ? 'student' : 'no-role'}`}>
                          {selectedUser.role === 'faculty' ? 'Faculty' : selectedUser.role === 'student' ? 'Student' : 'No Role'}
                        </span>
                        {selectedUser.role === 'faculty'
                          ? <span>CCS</span>
                          : selectedUser.program
                            ? <span>{(selectedUser.program.match(/\(([^)]+)\)/) || [])[1] || selectedUser.program}</span>
                            : null
                        }
                        {selectedUser.status && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_DOT_COLOR[selectedUser.status] || '#9ca3af', display: 'inline-block' }} />
                            {selectedUser.status}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="admin-detail-close" onClick={() => setSelectedUser(null)}><X size={15} /></button>
                  </div>

                  <div className="admin-detail-stats">
                    {[
                      { val: userStats.total,    lbl: 'Total',    color: 'var(--text-primary)' },
                      { val: userStats.pending,  lbl: 'Pending',  color: '#d97706' },
                      { val: userStats.approved, lbl: 'Approved', color: '#2563eb' },
                      { val: userStats.declined, lbl: 'Declined', color: '#dc2626' },
                    ].map(s => (
                      <div className="admin-detail-stat" key={s.lbl}>
                        <div className="admin-detail-stat-val" style={{ color: s.color }}>{s.val}</div>
                        <div className="admin-detail-stat-lbl">{s.lbl}</div>
                      </div>
                    ))}
                  </div>

                  <div className="admin-detail-history">
                    <p className="admin-detail-hist-title">
                      {selectedUser.role === 'faculty' ? 'Requests Received' : 'Requests Made'}
                    </p>
                    {userRequests.length === 0 ? (
                      <div className="admin-detail-empty">No requests found.</div>
                    ) : userRequests.map(r => {
                      const st = REQ_STATUS_STYLE[r.status] || REQ_STATUS_STYLE.Cancelled;
                      const otherParty = selectedUser.role === 'faculty'
                        ? (r.studentName || profileNameMap[r.studentId] || '—')
                        : (r.facultyName || profileNameMap[r.facultyId] || '—');
                      const timeLabel = r.startTime ? fmt12(r.startTime) + (r.endTime ? ` – ${fmt12(r.endTime)}` : '') : null;
                      return (
                        <div key={r.id} className="admin-req-card">
                          <div className="admin-req-card-top">
                            <span className="admin-req-card-name">{otherParty}</span>
                            <span className="admin-req-status" style={{ background: st.bg, color: st.color, borderColor: st.border }}>{r.status}</span>
                          </div>
                          <div className="admin-req-card-meta">{fmtDate(r.date)}{timeLabel ? ` · ${timeLabel}` : ''}</div>
                          {r.subject && <div className="admin-req-card-subject">{r.subject}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {tab === 'appointments' && (
        <div className="admin-section">
          <p className="admin-section-title" style={{ marginBottom: '1rem' }}>
            All Appointments
            <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.8rem' }}>— full audit log</span>
          </p>

          {/* Search + filters */}
          <div className="appt-controls">
            <div className="appt-search-wrap">
              <Search size={14} />
              <input
                className="appt-search"
                placeholder="Search student or faculty…"
                value={apptSearch}
                onChange={e => setApptSearch(e.target.value)}
              />
            </div>
            <div className="appt-filter-row">
              {['All', ...ALL_STATUSES].map(s => (
                <button key={s} className={`appt-chip${apptStatus === s ? ' active' : ''}`} onClick={() => setApptStatus(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="appt-controls" style={{ marginBottom: '0.75rem' }}>
            <ListFilter size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <div className="appt-filter-row">
              {[['all','All time'],['today','Today'],['week','Last 7 days'],['month','Last 30 days'],['custom','Custom']].map(([v, l]) => (
                <button key={v} className={`appt-chip${apptDatePreset === v ? ' active' : ''}`} onClick={() => setApptDatePreset(v)}>{l}</button>
              ))}
            </div>
            {apptDatePreset === 'custom' && (
              <div className="appt-date-range">
                <input type="date" className="appt-date-input" value={apptCustomFrom} max={apptCustomTo || today} onChange={e => setApptCustomFrom(e.target.value)} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>to</span>
                <input type="date" className="appt-date-input" value={apptCustomTo} min={apptCustomFrom} max={today} onChange={e => setApptCustomTo(e.target.value)} />
              </div>
            )}
            <span className="appt-count-label" style={{ marginLeft: 'auto' }}>
              {loading ? '…' : `${filteredAppts.length} record${filteredAppts.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Table */}
          {loading ? (
            <div className="admin-empty">Loading…</div>
          ) : filteredAppts.length === 0 ? (
            <div className="admin-empty">No appointments match this filter.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="appt-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Faculty</th>
                    <th>Date &amp; Time</th>
                    <th>Type / Subject</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppts.map(r => {
                    const st = REQ_STATUS_STYLE[r.status] || REQ_STATUS_STYLE.Cancelled;
                    const progRaw   = r.studentProgram || '';
                    const progAbbr  = progRaw ? ((progRaw.match(/\(([^)]+)\)/) || [])[1] || progRaw) : null;
                    const progLabel = [progAbbr, r.studentSection].filter(Boolean).join(' · ');
                    const timeLabel = r.startTime
                      ? `${fmt12(r.startTime)}${r.endTime ? ` – ${fmt12(r.endTime)}` : ''}`
                      : null;
                    return (
                      <tr key={r.id}>
                        <td>
                          <div className="appt-student-name">{r.studentName}</div>
                          {progLabel && <div className="appt-student-prog">{progLabel}</div>}
                        </td>
                        <td>
                          <div className="appt-faculty-name">{r.facultyName}</div>
                          <div className="appt-faculty-dept">{r.facultyDept || 'CCS'}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{fmtDate(r.date)}</div>
                          {timeLabel && <div className="appt-time">{timeLabel}</div>}
                          {r.room && <div className="appt-type">Room {r.room}</div>}
                        </td>
                        <td>
                          <div className="appt-subject">{r.subject || <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>—</span>}</div>
                          <div className="appt-type">{r.consultationType || 'General'}</div>
                        </td>
                        <td>
                          <span className="appt-status" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                            {r.status}
                          </span>
                          {(r.declineReason || r.cancelReason) && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 3, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={r.declineReason || r.cancelReason}>
                              {r.declineReason || r.cancelReason}
                            </div>
                          )}
                        </td>
                        <td className="appt-created">{fmtDate(r.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── REPORTS TAB ── */}
      {tab === 'reports' && (
        <>
          {/* Filters */}
          <div className="admin-section" style={{ marginBottom: '1rem' }}>
            <p className="admin-section-title" style={{ marginBottom: '0.75rem' }}>Filters</p>
            <div className="admin-report-filters">
              {[['week','This Week'],['month','This Month'],['quarter','Last 90 Days'],['custom','Custom']].map(([v, l]) => (
                <button key={v} className={`admin-report-chip${rangePreset === v ? ' active' : ''}`} onClick={() => setRangePreset(v)}>{l}</button>
              ))}
              {rangePreset === 'custom' && (
                <div className="admin-report-date-range">
                  <input type="date" className="admin-report-date-input" value={customFrom} max={customTo || today} onChange={e => setCustomFrom(e.target.value)} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>to</span>
                  <input type="date" className="admin-report-date-input" value={customTo} min={customFrom} max={today} onChange={e => setCustomTo(e.target.value)} />
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Showing <strong>{filteredRequests.length}</strong> request{filteredRequests.length !== 1 ? 's' : ''} from <strong>{fromDate}</strong> to <strong>{toDate}</strong>
            </div>
          </div>

          {/* Charts row */}
          <div className="admin-charts-grid">
            {/* Consultation volume */}
            <div className="admin-chart-card">
              <p className="admin-chart-title">Consultation Volume</p>
              <p className="admin-chart-sub">Requests over time</p>
              <BarChart weeks={weekBuckets} />
            </div>

            {/* Status breakdown */}
            <div className="admin-chart-card">
              <p className="admin-chart-title">Status Breakdown</p>
              <p className="admin-chart-sub">Proportion by status</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                <DonutChart data={donutData} size={148} />
                <div className="admin-legend">
                  {donutData.map(d => (
                    <div className="admin-legend-item" key={d.label}>
                      <span className="admin-legend-dot" style={{ background: d.color }} />
                      {d.label} <strong>{d.value}</strong>
                    </div>
                  ))}
                  {donutData.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>No requests in range.</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Faculty performance table */}
          <div className="admin-section">
            <p className="admin-section-title">Faculty Response Performance</p>
            {loading ? (
              <div className="admin-empty">Loading…</div>
            ) : facultyPerf.length === 0 ? (
              <div className="admin-empty">No faculty requests in this period.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="admin-table admin-perf-table">
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Department</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Approved</th>
                      <th style={{ textAlign: 'center' }}>Declined</th>
                      <th style={{ textAlign: 'center' }}>Completed</th>
                      <th style={{ textAlign: 'center' }}>Pending</th>
                      <th>Response Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facultyPerf.map(f => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: 700 }}>{f.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{f.dept}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{f.total}</td>
                        <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{f.approved}</td>
                        <td style={{ textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{f.declined}</td>
                        <td style={{ textAlign: 'center', color: '#7c3aed', fontWeight: 700 }}>{f.completed}</td>
                        <td style={{ textAlign: 'center', color: '#d97706', fontWeight: 700 }}>{f.pending}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="admin-perf-bar-wrap" style={{ flex: 1 }}>
                              <div className="admin-perf-bar" style={{ width: `${f.responseRate}%`, background: f.responseRate >= 80 ? '#22c55e' : f.responseRate >= 50 ? '#eab308' : '#ef4444' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', minWidth: 32 }}>{f.responseRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminContent;
