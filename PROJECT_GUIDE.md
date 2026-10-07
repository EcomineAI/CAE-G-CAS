# FACS — Complete File & Folder Explanation

> **FACS** — *Faculty Appointment & Consultation System*. Everything in this project explained in plain English so you know **exactly what is happening**.

---

## Root Files (the stuff outside `src/`)

| File | What it does |
|------|-------------|
| `index.html` | The single HTML page. React injects the entire app into `<div id="root">`. Title: `FACS: Faculty Appointment and Consultation System`. |
| `package.json` | Lists all npm dependencies (React, Supabase, Lucide icons, Vite, etc.) and defines scripts like `npm run dev`. |
| `package-lock.json` | Auto-generated lockfile. Keeps dependency versions in sync across machines. Never edit by hand. |
| `vite.config.js` | Vite build tool configuration. |
| `vercel.json` | Vercel deployment configuration (SPA rewrites). |
| `eslint.config.js` | Linting rules. |
| `.env` | **Secret.** Contains your Supabase URL and anon key. Never commit. |
| `.env.example` | Template showing what `.env` should look like. |
| `.gitignore` | Tells Git to ignore `node_modules/`, `.env`, build output. |
| `start_gcas.bat` | Windows batch script — double-click to install deps and start the dev server. |
| `README.md` | Project overview, setup, changelog. |
| `SUPABASE_SETUP.md` | Step-by-step guide for creating database tables in Supabase. |
| `cloud.py` | Python tunnel script to expose local server to a public URL for mobile testing. |
| `main logo.png` / `public/logo.png` / `src/pages/logo.png` | The navy "F" book logo used across the brand (login, sidebars, favicon). |
| `public/manifest.json` | PWA manifest. |
| `public/sw.js` | Service worker (offline/caching). |
| `seeds/sample_data.sql` | Seed data for Supabase. |

---

## `src/` — The Actual App

---

### `src/main.jsx` — Entry Point

The first file that runs. Wraps the app in `<BrowserRouter>` and `<StrictMode>`, injects global CSS, renders `<App />`.

---

### `src/App.jsx` — Router

Defines every page URL and what component to render.

| URL | Component | Who can access |
|-----|-----------|---------------|
| `/` | `LoginPage` | Everyone |
| `/login` | `LoginPage` | Everyone |
| `/login/student` | `LoginPage` | Legacy alias → same component |
| `/login/faculty` | `LoginPage` | Legacy alias → same component |
| `/student` | `StudentDashboard` | Students only (ProtectedRoute) |
| `/student/request` | `StudentRequest` | Students only |
| `/faculty` | `FacultyDashboard` | Faculty only (ProtectedRoute) |
| `/faculty/manage` | `FacultyManage` | Faculty only |

> **Important change:** There is no separate student/faculty login anymore. The old `LandingPage` is also no longer the root — `/` goes **straight to login**. One unified login page detects the account role from the Supabase `profiles.role` column after sign-in and redirects accordingly.

Also contains global CSS variables (`--primary`, `--bg-color`, `--shadow`, etc.) and the shared `fadeIn` animation.

---

## `src/components/` — Reusable UI Pieces

### `LoginPage` lives in `src/pages/Login/` (see Login section)

### `LogoutConfirm.jsx` *(new)*
A reusable confirmation modal shown before logging out. Red logout icon in a soft circle, "Log out of FACS?" title, Cancel + Log Out buttons. Blocks interaction while the sign-out call is in flight. Used by both Student and Faculty dashboards.

### `TermsModal.jsx` *(rewritten)*
Pure UI/UX terms modal — **no database writes anywhere**. Flow:
1. Opens with the **Close button disabled** and a bouncing "Scroll to read all" hint at the bottom.
2. User must scroll to the bottom of the terms text.
3. Once scrolled, hint fades out, Close button becomes active.
4. Clicking Close dismisses the modal.

Supports a `readOnly` prop that skips the scroll gate (used when the modal is opened just to view the terms, like from the login page).

### `SharedTermsContent.jsx`
The actual Terms & Conditions content as a reusable component. Used inside dashboards for the "Terms & Policy" view.

### `SharedSettingsContent.jsx` *(new, unified)*
**One component for both student and faculty settings** — controlled by a `role="student"` or `role="faculty"` prop. Keeps the UI identical for shared settings (Dark Mode, Text Size, Accessibility, Appearance) and only diverges for role-specific fields:
- **Student:** Student number, Program and section, Google badge, booking preferences
- **Faculty:** Faculty ID, Department, Booking rules card (min notice, booking window), Experimental features card (max appointments/day, reminders, vacation mode, default mode) with a master on/off toggle labelled as beta / UI visual change only
- **Shared:** Dark mode, high contrast, text size grid, accessibility toggles
- Saves to `student_prefs` or `faculty_prefs` table based on `role`

### `SharedCalendarGrid.jsx`
Reusable calendar grid used by both student and faculty calendar pages.

### `CalendarView.jsx`
Shared calendar component for appointment views.

### `NotificationCenter.jsx`
Bell icon dropdown showing in-app notifications (approved, declined, cancelled, new request). Realtime-driven.

### `ProfileEditModal.jsx`
Modal for editing name, department, avatar. Shared between student and faculty.

### `ProtectedRoute.jsx`
Wraps a route and checks:
1. Is the user logged in? → If no, redirect to `/login`
2. Does the user have the right role? → If student tries `/faculty`, redirect to `/student`
3. Still loading? → Show "Loading..."

### `Button.jsx`, `Input.jsx`, `Navbar.jsx`
Legacy primitive components, mostly superseded by inline-styled components inside each page. Still exist for compatibility.

### `SettingsModal.jsx`
Legacy global settings modal. Superseded by `SharedSettingsContent` rendered inline as a tab inside each dashboard.

### `ToggleRole.jsx`
Legacy toggle switch for student/faculty login. **No longer used** since login is unified.

---

## `src/hooks/` — Custom React Hooks

### `useAuth.js` *(updated — role now comes from the database)*
Previously derived role from the email pattern. Now it fetches the `role` column from the `profiles` table in Supabase so the **admin can override any user's role from the admin panel**.

Returns: `{ user, loading }` where user includes `role`, `displayName`, `avatarUrl`.

Also handles the admin bypass sentinel (`sessionStorage.admin_bypass === '1'`).

### `useNetworkStatus.js`
Detects online/offline state for showing network banners.

---

## `src/utils/` — Utility Functions

### `authUtils.js`
Email helpers. `getUserRole()` is still exported for compatibility but **no longer the source of truth** — role now comes from `profiles.role`. `formatNameFromEmail()` is used for display name fallback.

### `constants.js`
Shared constants (status enums, color maps, etc.).

### `dateUtils.js`
Date/time formatting helpers.

### `googleCalendar.js`
Google Calendar integration helpers.

---

## `src/supabase/` — The Backend Brain

### `supabase.js` — The Connection
Creates the Supabase client. Contains `ensureProfile()` safety net that auto-creates a `profiles` row for first-time users.

### `api.js` — All Database Operations

Every database read/write goes through this file.

| Function | What it does |
|----------|-------------|
| `getProfile(userId)` | Fetches a user's profile. |
| `updateProfile(userId, data)` | Updates profile fields (name, avatar, department, status). |
| `updateFacultyStatus(facultyId, status)` | Sets faculty to Available/Busy/Unavailable. |
| `getFacultySchedules(facultyId)` | Gets all schedules with filled-slot counts. |
| `createSchedule(data)` / `updateSchedule(id, u)` / `deleteSchedule(id)` | Schedule CRUD. |
| `getFacultyRequests(facultyId)` | Requests sent TO this faculty, joined with student profiles. |
| `getStudentRequests(studentId)` | Requests BY this student, joined with faculty profiles. |
| `updateRequestStatus(id, status, reason, decline, note)` | Approve/decline/cancel/complete a request. |
| `updateRequestDetails(id, subject, details)` | Student edits their request. |
| `submitRequest(data)` | Creates a new appointment request. |
| `checkActiveRequest(sid, fid)` | Conflict prevention — blocks double booking. |
| `deleteRequest(id, role)` | Soft-deletes a request for one side via `is_student_deleted` / `is_faculty_deleted` flags. |
| `getAllFaculty()` | Faculty directory for students. |
| `getSchedulesForFaculty(facultyId)` | Schedules shown to students during booking. |
| `getAllProfiles()` | Admin: all users. |
| `getAllRequests()` | Admin: last 100 requests. |
| **`updateUserRole(userId, role)`** *(new)* | **Admin: switch a user's role between `student` and `faculty`.** |

### `realtime.js`
WebSocket subscriptions to Supabase so the UI updates live:
- `subscribeToSchedules(...)` — schedule changes
- `subscribeToRequests(...)` — new / updated requests
- `subscribeToFacultyStatus(...)` — availability changes
- `subscribeToAllSchedules(...)` — any schedule change system-wide

### `ux.js`
UX utilities: toast system (`toast.success/error/warning/loading`), `optimistic()` helper for optimistic UI with rollback, 6 skeleton components, `withMinDelay`, `debouncedSave`, `prefetch`, cache helpers.

### `MIGRATION_v0.6.0.sql`
SQL migration script for the current schema version.

---

## `src/pages/` — The Actual Screens

---

### `src/pages/LandingPage/`

**No longer the root route.** `/` now goes straight to `LoginPage`. The file still exists but is unused.

---

### `src/pages/Login/`

#### `LoginPage.jsx` *(fully rewritten — one unified login)*
A single login page for both students and faculty. The old separate `StudentLogin` / `FacultyLogin` wrappers still exist in `Student/` and `Faculty/` subfolders but just re-export `LoginPage` for backwards compatibility.

**What it does:**
- Single ID / email input and password field
- Admin bypass: `Admin@gmail.com` / `admin` → sets `sessionStorage.admin_bypass`, routes to `/faculty`
- Normal flow: calls `supabase.auth.signInWithPassword()`, then fetches `profiles.role` for the signed-in user and redirects to `/student` or `/faculty` based on that
- Light-mode frosted glass card over a soft animated background (3 slow-drifting pale blue/lavender blobs)
- **Bare PNG logo** (no box) with a CSS `mask-image`-clipped glint sweep that passes across the actual logo shape every ~6s
- **Role hint chip** that appears as the user types ("Student account" / "Faculty account") based on whether the input looks like a numeric ID or a name
- **Friendly error messages** mapping Supabase's cryptic errors to plain language
- **Error shake animation** on failed login
- Error clears automatically as soon as the user starts typing again
- **Auto-focus** on the ID field on load, auto-trim whitespace on submit
- **"Terms & Conditions"** text button below the Sign In button — opens the `TermsModal` in read-only mode

---

### `src/pages/admin/`

#### `AdminContent.jsx` *(updated with role management)*
Admin dashboard embedded as a tab inside the faculty dashboard (visible via the admin bypass login). Shows:
- **Metrics** — Faculty count, Student count, Total/Pending/Approved/Declined requests
- **User Roles table** — Lists every user with their name, department, status, join date, **and a Student/Faculty pill toggle** per row. Clicking a role in the pill instantly calls `updateUserRole()` and updates the UI. Shows "saving…" while in flight.
- **Recent Requests table** — Last 100 requests with status colour coding.

---

### `src/pages/student/` — Student Side

#### `StudentDashboard.jsx` — The Shell
The main wrapper for the entire student interface.

- **Collapsible sidebar** — Narrow 68px by default, expands to 270px on hover (pure CSS, no state). Icons sit in a fixed-width container so they **don't shift** when the sidebar expands — only the labels slide in beside them. Navy `#00004e` sidebar background (matching faculty for brand consistency).
- **Bare PNG logo** at the top (no inverted filter), properly sized for both collapsed and expanded states.
- **Top navbar** — Notification bell, user chip
- **Content area** — Swaps between tab components based on `activeTab`
- **Settings tab** — Renders `<SharedSettingsContent role="student" ... />`
- **Terms & Policy button** — Opens the `TermsModal` as a popup (read-only)
- **Log Out button** — Opens `<LogoutConfirm>` modal instead of logging out immediately
- **Mobile responsive** — Sidebar collapses to a bottom tab bar
- Enforces profile completion for students with numeric names

#### `DashboardContent.jsx` — Overview Tab
Welcome banner, 4 metric cards (Approved/Pending/Completed/Cancelled), recent appointments preview.

#### `FacultyContent.jsx` — Faculty Directory & Booking Tab
Three views: faculty list → schedule selection → request form modal. After submit, a confirmation modal shows a receipt with the **CheckCircle icon playing a spring-bounce `checkPop` animation** (scale + rotation overshoot) via `.check-success-icon` class.

#### `AppointmentsContent.jsx` — Appointments Tab
Filter tabs, table of all appointments, Edit/Cancel actions on pending requests, soft-delete.

#### `CalendarPage.jsx` — Calendar Tab
Monthly calendar view of appointments.

#### `WelcomeContent.jsx`
First-run welcome / onboarding screen.

#### `AboutContent.jsx` — About Tab
Project info, team members, version.

#### `SettingsContent.jsx`
Legacy student-only settings. Superseded by `SharedSettingsContent`.

#### `StudentRequest.jsx`
Minimal placeholder page.

#### `appointmentsData.js` — Legacy mock data (unused)

---

### `src/pages/faculty/` — Faculty Side

#### `FacultyDashboard.jsx` — The Shell
Same shell pattern as student with navy `#00004e` sidebar. All the same sidebar behaviour (hover-expand, fixed icon positions, bare PNG logo).

- **Settings tab** — Renders `<SharedSettingsContent role="faculty" ... />`
- **Terms & Policy** — Opens the `TermsModal` as a popup (read-only)
- **Admin tab** — Only visible to admin-bypass users, renders `<AdminContent />`
- **Log Out** — Opens `<LogoutConfirm>` modal first

#### `FacultyDashboardContent.jsx` — Overview Tab
Welcome banner with name from DB, status selector (Available/Busy/Unavailable, debounced save), 4 metric cards, pending requests preview, schedule preview.

#### `FacultyScheduleContent.jsx` — Schedule Manager Tab
CRUD for consultation time slots. 2-column grid of schedule cards with progress bars, add/edit modal.

#### `FacultyRequestsContent.jsx` — Requests Tab
Filterable list of incoming requests with approve/decline actions, decline reason capture, soft-delete.

#### `FacultyCalendarPage.jsx` — Calendar Tab
Monthly calendar view of appointments and schedules.

#### `FacultyAboutContent.jsx` — About Tab
Mirrors the student About page.

#### `FacultySettingsContent.jsx`
Legacy faculty-only settings. Superseded by `SharedSettingsContent`.

#### `FacultyTermsContent.jsx`
Legacy inline terms page. Terms now shown via `TermsModal` popup.

#### `FacultyManage.jsx`
Minimal placeholder page.

#### `facultyData.js` — Legacy mock data (unused)

---

## How It All Connects (Data Flow)

```
User opens app
    │
    ▼
main.jsx → App.jsx (routing)
    │
    ├── "/" → LoginPage (unified)
    │     │
    │     ├── Admin bypass? → sessionStorage flag → /faculty with admin tab
    │     │
    │     ▼ supabase.auth.signInWithPassword()
    │     │
    │     ▼ Fetch profiles.role for the signed-in user
    │     │
    │     ├── role === 'student' → /student
    │     └── role === 'faculty' → /faculty
    │
    ├── "/student" → ProtectedRoute → StudentDashboard
    │       ├── DashboardContent
    │       ├── FacultyContent (browse + book + animated check success)
    │       ├── AppointmentsContent
    │       ├── CalendarPage
    │       ├── SharedSettingsContent (role="student")
    │       ├── TermsModal (popup, read-only)
    │       └── LogoutConfirm (confirmation before signOut)
    │
    ├── "/faculty" → ProtectedRoute → FacultyDashboard
    │       ├── FacultyDashboardContent
    │       ├── FacultyScheduleContent
    │       ├── FacultyRequestsContent
    │       ├── FacultyCalendarPage
    │       ├── SharedSettingsContent (role="faculty")
    │       ├── AdminContent (admin-only tab)
    │       │     └── updateUserRole() → flips any user's role
    │       ├── TermsModal (popup, read-only)
    │       └── LogoutConfirm (confirmation before signOut)
    │
    └── Realtime subscriptions
          ├── Schedule changes → both sides update
          ├── Request changes → both sides update
          └── Status changes → student directory updates
```

---

## Recent UI/UX Changes (what's new vs. the old guide)

- **Rebrand** — G-CAS → **FACS** (*Faculty Appointment & Consultation System*). New navy "F" book logo across the app.
- **Unified login** — One login page for everyone. Role lookup from `profiles.role`, not email guessing.
- **Admin role toggle** — Admins can switch any user between student and faculty from the admin dashboard.
- **No more LandingPage** — `/` goes straight to login.
- **Collapsible hover sidebars** — Both dashboards. Icons stay still, labels slide in.
- **Shared Settings component** — Single source of truth for both roles, driven by a `role` prop.
- **Shared Terms** — Reusable terms content; the modal is now pure UI with a scroll-to-unlock gate.
- **Logout confirmation modal** — No more one-click accidental logouts.
- **Login polish** — Frosted glass card over slow-drifting pastel blobs, PNG logo with mask-clipped glint sweep, role-hint chip, friendly errors, error shake, auto-focus.
- **Booking success animation** — Spring-bounce check icon on request confirmation.
- **Sidebar colour unified** — Both student and faculty now use `#00004e`.
- **Modal centering fix** — Appointment request modal uses `inset: 0` + high z-index so it sits dead center.

---

## Files You Can Safely Delete

| File | Why it's dead |
|------|--------------|
| `src/pages/student/appointmentsData.js` | Hardcoded fake data. Replaced by `api.getStudentRequests()`. |
| `src/pages/faculty/facultyData.js` | Hardcoded fake data. Replaced by API calls. |
| `src/pages/student/StudentRequest.jsx` | Placeholder page. |
| `src/pages/faculty/FacultyManage.jsx` | Placeholder page. |
| `src/pages/LandingPage/LandingPage.jsx` | No longer routed. |
| `src/pages/Login/Student/StudentLogin.jsx` | Just re-exports `LoginPage`. |
| `src/pages/Login/Faculty/FacultyLogin.jsx` | Just re-exports `LoginPage`. |
| `src/components/ToggleRole.jsx` | Was the student/faculty login toggle — login is unified. |
| `src/components/SettingsModal.jsx` | Replaced by `SharedSettingsContent` rendered as a tab. |
| `src/pages/student/SettingsContent.jsx` | Replaced by `SharedSettingsContent`. |
| `src/pages/faculty/FacultySettingsContent.jsx` | Replaced by `SharedSettingsContent`. |
| `src/pages/faculty/FacultyTermsContent.jsx` | Replaced by `TermsModal` + `SharedTermsContent`. |
