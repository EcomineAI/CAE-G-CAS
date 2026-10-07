const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const TOKEN_KEY = 'gcas_gcal_token';
const TOKEN_EXPIRY_KEY = 'gcas_gcal_token_expiry';

let tokenClient = null;

export const storeToken = (token, expiresIn) => {
  sessionStorage.setItem(TOKEN_KEY, token);
  const expiry = Date.now() + (expiresIn - 60) * 1000; // expire 1 min early
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(expiry));
};

export const getToken = () => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = parseInt(sessionStorage.getItem(TOKEN_EXPIRY_KEY) || '0', 10);
  if (!token || Date.now() > expiry) return null;
  return token;
};

export const clearToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
};

export const requestGoogleToken = (onSuccess, onError) => {
  if (!CLIENT_ID) {
    onError('VITE_GOOGLE_CLIENT_ID is not set in .env');
    return;
  }

  const init = () => {
    if (!window.google?.accounts?.oauth2) {
      onError('Google Identity Services failed to load.');
      return;
    }
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: (response) => {
        if (response.error) {
          onError(response.error);
          return;
        }
        storeToken(response.access_token, response.expires_in);
        onSuccess(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  };

  // GIS may load async — wait up to 3s
  if (window.google?.accounts?.oauth2) {
    init();
  } else {
    let attempts = 0;
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        init();
      } else if (++attempts > 30) {
        clearInterval(interval);
        onError('Google Sign-In library did not load. Check your internet connection.');
      }
    }, 100);
  }
};

/**
 * Create an event in the faculty's primary Google Calendar.
 */
export const createCalendarEvent = async (accessToken, { title, date, startTime, endTime, details, location }) => {
  const toDateTime = (d, t) => {
    const [h, m] = (t || '00:00').split(':');
    return `${d}T${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}:00`;
  };
  const body = {
    summary: title,
    location: location || '',
    description: details || '',
    start: { dateTime: toDateTime(date, startTime), timeZone: 'Asia/Manila' },
    end:   { dateTime: toDateTime(date, endTime),   timeZone: 'Asia/Manila' },
  };
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(res.status === 401 ? 'TOKEN_EXPIRED' : 'CREATE_FAILED');
  return await res.json();
};

/**
 * Fetch events from the primary Google Calendar for the next 7 days.
 */
export const fetchCalendarEvents = async (accessToken) => {
  const now = new Date();
  const weekLater = new Date(now);
  weekLater.setDate(now.getDate() + 7);

  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: weekLater.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('TOKEN_EXPIRED');
    throw new Error(`Calendar API error: ${res.status}`);
  }

  const data = await res.json();
  return (data.items || []).map(ev => ({
    id: ev.id,
    title: ev.summary || '(No title)',
    start: ev.start?.dateTime || ev.start?.date,
    end: ev.end?.dateTime || ev.end?.date,
    allDay: !ev.start?.dateTime,
    location: ev.location || '',
    description: ev.description || '',
    color: ev.colorId ? `#${ev.colorId}` : null,
  }));
};

/**
 * Group events by date label for display.
 * Returns array of { label, dateStr, events[] }
 */
export const groupEventsByDay = (events) => {
  const groups = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  events.forEach(ev => {
    const dateStr = ev.start.split('T')[0];
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(ev);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, evs]) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      date.setHours(0, 0, 0, 0);
      const diffDays = Math.round((date - today) / 86400000);
      let label;
      if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-PH', { weekday: 'long', month: 'short', day: 'numeric' });
      return { label, dateStr, events: evs };
    });
};

export const formatEventTime = (ev) => {
  if (ev.allDay) return 'All day';
  const fmt = (iso) =>
    new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${fmt(ev.start)} – ${fmt(ev.end)}`;
};
