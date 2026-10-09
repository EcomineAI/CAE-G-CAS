# FACS — Claude Code Guardrails

**Faculty Appointment & Consultation System** · React 19 + Vite 8 + Supabase · v0.8.x

---

## Directory Structure

```
src/
  App.jsx                   # Route definitions only — no logic here
  main.jsx                  # Entry point: global CSS tokens, BrowserRouter, SW registration

  components/               # Shared, reusable UI components
    ErrorBoundary.jsx
    LogoutConfirm.jsx
    Navbar.jsx              # Minimal public-facing nav (landing/login only)
    NotificationCenter.jsx  # Bell tray — reads notifications table via Supabase
    ProfileEditModal.jsx    # Avatar + name prefix/suffix editor
    ProtectedRoute.jsx      # Auth gate: checks useAuth role vs allowedRole
    SettingsModal.jsx       # Standalone modal shell (currently unused on student side)
    SharedCalendarGrid.jsx  # Shared calendar UI: exports STATUS_STYLES, WEEKDAYS,
                            #   MONTH_NAMES, calendarSharedStyles — re-exports fmt12
    SharedSettingsContent.jsx # Settings tab content (used by BOTH dashboards)
    TermsModal.jsx          # Terms & Conditions modal

  hooks/
    useAuth.js              # SINGLE auth hook — always use this, never read supabase.auth directly
    useNetworkStatus.js     # Online/offline detection

  pages/
    Login/
      LoginPage.jsx         # Unified login for student + faculty

    LandingPage/            # (empty — folder kept for future landing page)

    student/
      StudentDashboard.jsx  # Student shell + tab router
      DashboardContent.jsx  # Student dashboard tab
      FacultyContent.jsx    # Faculty directory + booking flow
      AppointmentsContent.jsx # My appointments list
      CalendarPage.jsx      # Student calendar view
      AboutContent.jsx      # About tab
      WelcomeContent.jsx    # Welcome tab (shown to first-time users)
      SettingsContent.jsx   # Standalone settings page (used inside StudentDashboard)

    faculty/
      FacultyDashboard.jsx  # Faculty shell + tab router
      FacultyDashboardContent.jsx  # Faculty dashboard tab (overview + pending requests)
      FacultyRequestsContent.jsx   # Requests management tab
      FacultyCalendarPage.jsx      # Calendar + schedule + OOO management tab
      FacultyAboutContent.jsx      # About tab

    admin/
      AdminContent.jsx      # Admin panel (embedded inside FacultyDashboard for Admin user)

    shared/
      index.js                           # Barrel: export { AppointmentDetailsModal }
      components/AppointmentDetailsModal.jsx  # Read-only appointment detail sheet

  supabase/
    supabase.js   # createClient + ensureProfile — ONLY place Supabase client is created
    api.js        # ALL database queries — import functions from here, never call supabase directly in components
    realtime.js   # Supabase Realtime subscription helpers
    ux.js         # toast, logError, optimistic, skeleton components, withMinDelay, prefetch

  utils/
    authUtils.js      # getUserRole, isValidRoleEmail, formatNameFromEmail
    constants.js      # APP_NAME, ROOM_NUMBERS, PH_PREFIXES, PH_SUFFIXES, CONSULTATION_TYPES,
                      #   SCHEDULE_DAYS, FACULTY_TITLES, STATUS_LABELS, MAX_ACTIVE_REQUESTS
    dateUtils.js      # formatTime, formatDate, formatDateTime, formatRelativeTime,
                      #   fmt12, getInitials, buildGcalUrl, calculateStudentSlot, nextDateForDay
    googleCalendar.js # Google Calendar OAuth token helpers + createCalendarEvent, fetchCalendarEvents

public/
  logo.png          # App icon (also used in index.html <link rel="icon">)
  BG.jpg            # Background image
  manifest.json     # PWA manifest
  sw.js             # Service worker source (built by vite-plugin-pwa)
  erica.png         # Dev team avatar
  junevic.png       # Dev team avatar

seeds/
  sample_data.sql   # One-time seed data — do not import in source code
```

---

## Architecture Rules

### Supabase — Single Data Layer
- **Always import the Supabase client from `src/supabase/supabase.js`** — never call `createClient` anywhere else.
- **All database queries live in `src/supabase/api.js`** — components call API functions, never raw `.from()` calls in JSX files (exceptions: `useAuth.js`, `NotificationCenter.jsx`, login/logout flows that use `supabase.auth` directly).
- **Realtime subscriptions** must use helpers from `src/supabase/realtime.js`. Always clean them up in the `useEffect` return function.
- **Toast / error handling**: always use `toast` and `logError` from `src/supabase/ux.js` — never `alert()`, never bare `console.error()`.
- **Optimistic updates**: use the `optimistic()` helper from `ux.js` for any state change that touches the DB.

### Auth
- **Always use `useAuth()`** from `src/hooks/useAuth.js` to get `{ user, loading }`.
- Never read `supabase.auth.getUser()` in a component — `useAuth` already does this with retry logic.
- Role detection is **DB-authoritative** (`profiles.role`), not email-based. Do not derive roles from email in component code.

### Routing
- Routes are defined **only** in `src/App.jsx`.
- Student pages → `/student/*`, Faculty pages → `/faculty/*`.
- All protected pages must be wrapped in `<ProtectedRoute allowedRole="...">`.

### Date / Time Formatting — Single Source of Truth
- **`fmt12(timeStr)`** — compact 12h display (e.g. "2 PM", "2:30 PM") → import from `src/utils/dateUtils.js`.
- **`formatTime(timeStr)`** — always shows minutes (e.g. "2:00 PM") → import from `src/utils/dateUtils.js`.
- **`formatDate(dateStr)`** — "May 8, 2026" → import from `src/utils/dateUtils.js`.
- Never write inline time/date formatters in component files.

### Constants
- All app-wide constants (room numbers, status labels, consultation types, etc.) live in **`src/utils/constants.js`**.
- Do not hardcode status strings like `'Pending'` in component logic — use `STATUS_LABELS` from constants.

### Components
- `SharedSettingsContent` is the **single settings UI** — both `StudentDashboard` and `FacultyDashboard` render it for the Settings tab.
- `SharedCalendarGrid` owns the calendar grid markup and styles (`calendarSharedStyles`). Both `FacultyCalendarPage` and `CalendarPage` import from it.
- `TermsModal` is the **single terms modal** — both dashboards use it.
- `ProfileEditModal` handles avatar + name editing for both roles.

---

## Stub Pages (Not Yet Implemented)

These routes are wired in `App.jsx` but render placeholder content only:

| Route | File | Notes |
|---|---|---|
| `/student/request` | `StudentRequest.jsx` | Reserved for future standalone booking flow |
| `/faculty/manage` | `FacultyManage.jsx` | Reserved for future management features |

Do not add logic to these files until the feature is designed.

---

## Code Style Rules

- **No comments** unless the *why* is non-obvious (hidden constraint, bug workaround, subtle invariant).
- **Named exports** preferred for utility functions. Default exports for page/component files.
- **Inline styles** are acceptable for component-scoped CSS injected via `<style>{...}</style>` template literals — this is the project convention. Do not introduce a CSS-in-JS library.
- No TypeScript — project is plain JSX.
- No test files — not in scope.
- `lucide-react` is the **only** icon library. Do not add emoji icons to UI components.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_GOOGLE_CLIENT_ID` | Optional | Enables "Add to Google Calendar" in FacultyRequestsContent |

Copy `.env.example` → `.env` to get started.

---

## Build & Dev

```bash
npm run dev        # Start Vite dev server (port 5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
start_gcas.bat     # Windows helper: installs deps if needed, then npm run dev --open
cloud.py           # Cloudflare tunnel helper for LAN/mobile testing
```

Run `npm run build` after every non-trivial refactor to catch regressions early.
