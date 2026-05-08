// ============================================================
// G-CAS Date & Time Utilities
// All time displays go through here — single source of truth.
// ============================================================

/**
 * Formats a 24-hour time string to 12-hour AM/PM.
 * "14:30:00" → "2:30 PM"
 * "07:00" → "7:00 AM"
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return 'TBD';
  const [h, m] = String(timeStr).split(':');
  const hour = parseInt(h, 10);
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

/**
 * Formats a time range as "7:00 AM – 8:00 AM"
 */
export const formatTimeRange = (startTime, endTime) => {
  return `${formatTime(startTime)} – ${formatTime(endTime)}`;
};

/**
 * Returns { time, ampm } parts for styled display.
 * Use with TimeDisplay component for color-coded AM/PM badge.
 */
export const parseTimeParts = (timeStr) => {
  if (!timeStr) return { time: 'TBD', ampm: '' };
  const [h, m] = String(timeStr).split(':');
  const hour = parseInt(h, 10);
  const ampm = hour < 12 ? 'AM' : 'PM';
  const h12 = hour % 12 || 12;
  return { time: `${h12}:${m}`, ampm };
};

/**
 * "2026-05-08" → "May 8, 2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  try {
    // Parse as local date to avoid timezone offset shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

/**
 * "2026-05-08" → "Thu, May 8"  (short version for cards)
 */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return 'TBD';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

/**
 * ISO timestamp → "May 8, 2026 · 2:30 PM"
 */
export const formatDateTime = (isoStr) => {
  if (!isoStr) return 'TBD';
  try {
    const d = new Date(isoStr);
    const date = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    const time = d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${date} · ${time}`;
  } catch {
    return isoStr;
  }
};

/**
 * Returns a relative time string: "2 min ago", "3h ago", "May 8"
 */
export const formatRelativeTime = (isoStr) => {
  if (!isoStr) return '';
  try {
    const now = new Date();
    const then = new Date(isoStr);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDateShort(isoStr.split('T')[0]);
  } catch {
    return '';
  }
};

export const formatTimeAgo = formatRelativeTime;

