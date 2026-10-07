# 🧠 GCAS — Complete File & Folder Explanation

> Everything in this project explained in plain English so you know **what the hell is happening**.

---

## 📁 Root Files (the stuff outside `src/`)

| File | What it does |
|------|-------------|
| `index.html` | The single HTML page. React injects the entire app into `<div id="root">`. You almost never touch this. |
| `package.json` | Lists all npm dependencies (React, Supabase, Lucide icons, etc.) and defines scripts like `npm run dev`. |
| `package-lock.json` | Auto-generated lockfile. Ensures everyone gets the exact same dependency versions. Never edit manually. |
| `vite.config.js` | Vite build tool configuration. Tells Vite "this is a React project." Barely has anything in it. |
| `eslint.config.js` | Linting rules. Catches syntax mistakes in your code. Not critical for the app to run. |
| `.env` | **Secret!** Contains your Supabase URL and anon key. Never commit this to GitHub. |
| `.env.example` | Template showing what `.env` should look like, without the actual secrets. |
| `.gitignore` | Tells Git to ignore `node_modules/`, `.env`, and build output. |
| `start_gcas.bat` | Windows batch script — double-click to auto-install dependencies and start the dev server. |
| `README.md` | Project overview, tech stack, features, changelog, setup instructions. |
| `SUPABASE_SETUP.md` | Step-by-step guide for creating database tables in Supabase Dashboard. |
| `cloud.py` | **Tunnel!** Python script to instantly expose your local server to a public URL for mobile testing. |
| `GCAS.rar` | Compressed archive backup of the project. |

---

## 📁 `src/` — The Actual App

Everything below is the source code that becomes the running app.

---

### `src/main.jsx` — The Very First File That Runs

**What it does:** This is the entry point. When you run `npm run dev`, Vite loads `index.html`, which loads `main.jsx`.

**What's inside:**
1. Imports React and ReactDOM
2. Wraps the app in `<BrowserRouter>` (enables URL-based page navigation like `/student`, `/faculty`)
3. Wraps in `<StrictMode>` (helps catch bugs during development)
4. Injects global CSS variables for fonts, colors, and base layout
5. Renders `<App />` — the actual application

**Think of it as:** The ignition key. It starts the engine (`App.jsx`) and sets up the car frame (routing, base styles).

---

### `src/App.jsx` — The Router (Traffic Controller)

**What it does:** Defines **every page URL** in the app and what component to show for each.

**The routes:**

| URL | Component | Who can access |
|-----|-----------|---------------|
| `/` | `LandingPage` | Everyone (not logged in) |
| `/login/student` | `StudentLogin` | Everyone |
| `/login/faculty` | `FacultyLogin` | Everyone |
| `/student` | `StudentDashboard` | 🔒 Students only |
| `/student/request` | `StudentRequest` | 🔒 Students only |
| `/faculty` | `FacultyDashboard` | 🔒 Faculty only |
| `/faculty/manage` | `FacultyManage` | 🔒 Faculty only |

**Also contains:** Global CSS variables (`--primary`, `--bg-color`, `--shadow`, etc.) and the `fadeIn` animation used across the app.

**The 🔒 routes** are wrapped in `<ProtectedRoute>` — if you're not logged in or have the wrong role, you get redirected.

---

## 📁 `src/components/` — Reusable UI Pieces

These are **small, reusable building blocks** used by multiple pages.

### `Button.jsx`
**What it does:** A styled button with two variants:
- **Primary** — Orange background, white text, hover lift effect (used for "Get Started", "Login", "Submit")
- **Secondary** — Gray background, dark text

**Used by:** LandingPage, Login pages

---

### `Input.jsx`
**What it does:** A styled input field with:
- Optional left icon (e.g., mail icon for email field)
- Password toggle (eye icon to show/hide password)
- Focus states with subtle shadows

**Used by:** Login pages (email & password fields)

---

### `Navbar.jsx`
**What it does:** A fixed top navigation bar with the "G-CAS" brand link. Currently a placeholder — the actual navigation is built into each dashboard.

**Used by:** Not actively used in dashboards (they have their own sidebar nav)

---

### `ProtectedRoute.jsx`
**What it does:** A security wrapper for routes. Before showing the page, it checks:
1. **Is the user logged in?** → If no, redirect to login page
2. **Does the user have the right role?** → If student tries to access `/faculty`, redirect them to `/student`
3. **Still loading auth?** → Show "Loading..." text

**Used by:** App.jsx wraps all `/student` and `/faculty` routes with this

---

### `ToggleRole.jsx`
**What it does:** A sliding toggle switch that lets users pick between "Student" and "Faculty" on the login page. Has a smooth animated slider effect.

**Used by:** Login pages (to switch between student/faculty login)

---

### `SettingsModal.jsx`
**What it does:** **Global Settings!** A premium interactive modal that handles Dark Mode, Font Size, High Contrast, and Logout. It uses global CSS variables and local storage to persist user preferences.

**Used by:** Student and Faculty Dashboards

---

## 📁 `src/hooks/` — Custom React Hooks

### `useAuth.js`
**What it does:** THE authentication hook. Every component that needs to know "who is logged in?" uses this.

**How it works:**
1. On mount, it calls `supabase.auth.getSession()` to check if there's an active login
2. It listens for auth state changes (login, logout, token refresh)
3. For each user, it enriches the session data with:
   - `role` — "student" or "faculty" (detected from email pattern)
   - `displayName` — Human-readable name (e.g., "Arnie Armada" from "arnie.armada@...")
   - `avatarUrl` — Auto-generated cartoon avatar from Dicebear

**Returns:** `{ user, loading }` — user is `null` if not logged in

**Used by:** Almost every page component (dashboards, content tabs, protected routes)

---

## 📁 `src/utils/` — Utility Functions

### `authUtils.js`
**What it does:** Helper functions for role detection and name formatting. Three functions:

| Function | What it does | Example |
|----------|-------------|---------|
| `getUserRole(email)` | Checks if email prefix is all numbers (student) or has letters (faculty) | `202110123@...` → `'student'` |
| `isValidRoleEmail(email, role)` | Validates if an email matches an expected role | Used by login pages |
| `formatNameFromEmail(email)` | Converts email prefix to a display name | `arnie.armada@...` → `'Arnie Armada'` |

**Used by:** `useAuth.js`, login pages

---

## 📁 `src/supabase/` — The Backend Brain 🧠

> **This is where ALL database logic lives.** If data is being read, written, updated, or deleted — it goes through this folder.

### `supabase.js` — The Connection

**What it does:** Creates the Supabase client that talks to your database.

**Key parts:**
- `supabase` — The client object. Every API call uses this.
- `auth` — Shortcut to `supabase.auth` for login/logout
- `ensureProfile()` — Safety net function. If a user logs in but doesn't have a profile row (signed up before the database trigger existed), this auto-creates one.

**Used by:** Everything in `src/supabase/`, login pages, dashboards

---

### `api.js` — All Database Operations

**What it does:** Every single database read/write goes through this file. It's the API layer between your UI and Supabase.

| Function | What it does | Who uses it |
|----------|-------------|-------------|
| `getProfile(userId)` | Fetches a user's profile (name, role, status, avatar) | Faculty dashboard (welcome name, status) |
| `updateProfile(userId, data)` | Updates profile fields | Status changes |
| `updateFacultyStatus(facultyId, status)` | Sets faculty to Available/Busy/Unavailable | Faculty dashboard status dropdown |
| `getFacultySchedules(facultyId)` | Gets all schedules + counts how many slots are filled | Faculty schedule tab, student booking |
| `createSchedule(data)` | Adds a new consultation time slot | Faculty schedule "Add" button |
| `updateSchedule(id, updates)` | Edits an existing schedule | Faculty schedule "Edit" button |
| `deleteSchedule(id)` | Removes a schedule | Faculty schedule "Delete" button |
| `getFacultyRequests(facultyId)` | Gets all requests sent TO this faculty, with student names/avatars | Faculty requests tab |
| `updateRequestStatus(id, status, reason)` | Changes request to Approved/Declined/etc. Optional `reason` for cancellations. | Faculty approve/decline, student cancel |
| `updateRequestDetails(id, subject, details)` | Allows students to edit their request info | Student appointments "Edit" button |
| `getStudentRequests(studentId)` | Gets all requests BY this student, with faculty names/avatars | Student appointments tab |
| `getAllFaculty()` | Lists all faculty members with real names, avatars, and live status | Student faculty directory |
| `getSchedulesForFaculty(facultyId)` | Gets a faculty's schedules (used by students when booking) | Student booking flow |
| `submitRequest(data)` | Creates a new appointment request | Student "Submit" button |
| `checkActiveRequest(sid, fid)` | **Conflict Prevention!** Checks if a student already has a pending/approved request with a specific faculty member. | Student booking flow |
| `deleteRequest(id, role)` | **History Sync!** Soft-deletes a request for a specific user role using the `is_student_deleted` or `is_faculty_deleted` flags. Records are only fully removed when both parties delete them. | Student/Faculty appointment tabs |

**Key fix from original:** The old version had hardcoded placeholders like `'Faculty Name'` and `'Faculty Member'`. Now it pulls real data from the `profiles` table using SQL JOINs.

---

### `realtime.js` — Live Updates

**What it does:** Makes the app feel alive by listening for database changes in real-time. When something changes in the database, the UI updates automatically without a page refresh.

| Function | What it listens for | Who uses it |
|----------|-------------------|-------------|
| `subscribeToSchedules(facultyId, callback, fetchFn)` | Faculty adds/edits/deletes a schedule | Student booking view auto-updates |
| `subscribeToRequests(userId, role, callback, fetchFn)` | New request submitted, or status changed | Faculty sees new requests instantly; student sees approvals instantly |
| `subscribeToFacultyStatus(callback, fetchFn)` | Faculty changes their availability | Student faculty directory status dots update live |
| `subscribeToAllSchedules(callback)` | Any schedule in the system changes | Student browsing view |

**How it works:** Uses Supabase's PostgreSQL LISTEN/NOTIFY feature. The client opens a WebSocket connection and the server pushes changes to it. Each function returns an `unsubscribe()` function used in React's `useEffect` cleanup.

---

### `ux.js` — UX Magic ✨

**What it does:** Contains all the fancy user experience utilities. This is what makes the app feel fast and polished instead of clunky.

#### 1. Toast Notifications
A lightweight popup system (no external library). Toasts slide in from the bottom-right and auto-dismiss.
- `toast.success("Saved!")` → Green checkmark, 3 seconds
- `toast.error("Failed")` → Red X, 5 seconds
- `toast.warning("Offline")` → Yellow warning, 4 seconds
- `toast.loading("Saving...")` → Blue spinner, stays until you dismiss it

#### 2. Optimistic UI Helper
```
optimistic(setState, currentState, newState, serverCall, messages)
```
Updates the UI **immediately** before the server responds. If the server call fails, it **rolls back** to the previous state and shows an error toast. Used for schedule CRUD and request approve/decline.

#### 3. Skeleton Loading Components
Six shimmer-animated placeholder components that replace "Loading..." text:
- `ScheduleCardSkeleton` — Pulsing cards for schedule grid
- `RequestCardSkeleton` — Pulsing rows with avatar circles
- `MetricCardSkeleton` — Pulsing number cards for dashboards
- `FacultyCardSkeleton` — Pulsing cards for faculty directory
- `AppointmentRowSkeleton` — Pulsing table rows
- `DashboardAppointmentSkeleton` — Pulsing appointment cards

#### 4. Latency Masking
- `withMinDelay(promise, 300)` — Prevents skeleton from flashing too fast on quick loads
- `debouncedSave(fn, 500)` — Waits 500ms after last call before actually saving (prevents spam)
- `prefetch(key, fetchFn)` — Pre-loads data in the background so tab switches feel instant
- `getCached(key)` / `clearCache(key)` — Read/clear the prefetch cache

---

## 📁 `src/pages/` — The Actual Screens

### `logo.png`
The G-CAS circular logo used in the landing page and dashboard navbars.

---

### 📁 `src/pages/LandingPage/`

#### `LandingPage.jsx`
**What it does:** The first thing users see. Shows the G-CAS logo, title, subtitle, and a "Get Started" button that navigates to the student login page.

**Think of it as:** The front door of the app.

---

### 📁 `src/pages/Login/`

#### `Student/StudentLogin.jsx`
**What it does:** Login form for students. Requires an email ending in `@gordoncollege.edu.ph` where the part before `@` is all numbers (student ID). Uses Supabase `signInWithPassword()`.

**Flow:** Enter email + password → Validate email pattern → Call Supabase Auth → If success, redirect to `/student`

#### `Faculty/FacultyLogin.jsx`
**What it does:** Same as StudentLogin but validates that the email prefix contains letters (name-based, not a student ID). Redirects to `/faculty` on success.

---

### 📁 `src/pages/student/` — Student Side

#### `StudentDashboard.jsx` — The Shell
**What it does:** The main wrapper for the entire student interface. Contains:
- **Left sidebar** — Navigation tabs (Dashboard, Faculty, Appointments, About) with orange pill-style active states
- **Top navbar** — Logo, user name, dark mode toggle, logout
- **Content area** — Swaps between tab components based on `activeTab` state
- **Dark mode** — Toggles CSS variables for the entire student UI
- **Mobile responsive** — Sidebar collapses to bottom tab bar on small screens
- **Profile Standards** — Enforces profile completion (real name formatting) for students with numeric account names.
- **Editable Profiles** — Allows students to change their name and avatar.
- **Settings Modal** — Integrates the `SettingsModal` for accessibility (Font Size, Contrast) and theme management.
- **Logout** — Clears the Supabase session and redirects to landing page.

---

#### `DashboardContent.jsx` — Overview Tab
**What it does:** The first thing students see after login.

Shows:
- **Welcome banner** with the student's name
- **4 metric cards** — Approved, Pending, Completed, Cancelled counts (clickable — navigate to filtered appointments)
- **Recent appointments list** — Last 3 appointments with faculty avatar, name, date, status badge

**Data source:** `getStudentRequests(user.id)` from `api.js`
**UX:** Skeleton loading on metrics + appointments, real-time subscription for live status updates

---

#### `FacultyContent.jsx` — Faculty Directory & Booking Tab
**What it does:** The longest file in the project. Handles the entire faculty browsing and booking flow.

**Three views managed by state:**
1. **Faculty List** — Grid of faculty cards showing name, department, avatar, and live status dot (green/yellow/red). Search bar to filter.
2. **Schedule Selection** — When you click a faculty card, shows their available time slots. Each slot shows day, time, room, and how many slots are left.
3. **Request Form** — After picking a slot, a modal asks for subject and details. Submit button creates the request.

**Also has:** A confirmation modal after successful submission.

**Data sources:** `getAllFaculty()`, `getSchedulesForFaculty(facultyId)`, `submitRequest(data)`
**UX:** Skeleton cards while loading, real-time faculty status updates, toast on submit

---

#### `AppointmentsContent.jsx` — Appointments Tab
**What it does:** Full appointment history in a table format with action capabilities.

Shows:
- **Filter tabs** — All, Approved, Pending, Cancelled, Completed (with counts)
- **Table** — Faculty name + avatar, date, time slot, status badge (color-coded)
- **Actions** — **Edit** (subject/details) and **Cancel** (with reason) for pending requests.
- **Soft Delete** — Allows students to remove appointments from their history view without deleting them for the faculty member.
- **Modals** — Premium confirmation dialogs for editing, cancelling, and deleting.

**Data source:** `getStudentRequests(user.id)`
**UX:** Skeleton table rows, real-time updates when faculty changes status, custom confirmation modals.

---

#### `AboutContent.jsx` — About Tab
**What it does:** Static info page showing:
- Project description and mission
- Team member cards with badges
- System version info

---

#### `StudentRequest.jsx` — Placeholder Page
**What it does:** A minimal placeholder at `/student/request`. Currently just shows "Submit your appointment requests here." The actual booking flow is built into `FacultyContent.jsx`.

---

#### `appointmentsData.js` — Legacy Mock Data ⚠️
**What it does:** Contains hardcoded fake appointment data that was used before the Supabase integration. Names like "Mr. Arnie Armada", "Mr. Kenneth Bautista" are hardcoded here.

**Status:** **LEGACY — no longer used.** All appointment data now comes from `api.js → getStudentRequests()`. This file can be safely deleted.

---

### 📁 `src/pages/faculty/` — Faculty Side

#### `FacultyDashboard.jsx` — The Shell
**What it does:** Same concept as `StudentDashboard.jsx` but for faculty. Contains:
- **Left sidebar** — Dashboard, Schedule, Requests, About tabs
- **Top navbar** — Logo, faculty name (from profile DB), dark mode toggle, logout
- **Content area** — Swaps between tab components
- **Tab communication** — Passes `onTabChange(tab, filter)` down so clicking metric cards can navigate to specific filtered tabs
- **Settings Modal** — Allows faculty to toggle Dark Mode, High Contrast, and Font Size via the sidebar settings icon.
- **Editable Profiles** — Allows faculty to change their name, department, and avatar.

**Also calls** `ensureProfile()` and fetches `getProfile()` for the display name and profile picture.

---

#### `FacultyDashboardContent.jsx` — Overview Tab
**What it does:** Faculty's home screen.

Shows:
- **Welcome banner** — "Welcome, {Name}!" pulled from the `profiles` table (no more hardcoded "Mr. Arnie Armada")
- **Status selector** — Dropdown to set availability (Available/Busy/Unavailable). **Persists to database** via `updateFacultyStatus()` with debounced saving.
- **4 metric cards** — Total Requests, Approved, Pending, Active Schedules (clickable)
- **Pending requests preview** — Shows the most recent pending request with student avatar, name, subject, and time
- **Schedule preview** — Shows up to 2 schedules with day, time, room, and slots remaining

**Data sources:** `getProfile()`, `getFacultyRequests()`, `getFacultySchedules()`
**UX:** Skeleton metrics, real-time subscriptions for both requests and schedules, data prefetch, debounced status save, toast on status change

---

#### `FacultyScheduleContent.jsx` — Schedule Manager Tab
**What it does:** Full CRUD interface for managing consultation time slots.

Shows:
- **Header** with "Add Schedule" button
- **Schedule grid** — 2-column grid of cards, each showing day, time, filled/total slots with a progress bar, and edit/delete icons
- **Add/Edit modal** — Form with day dropdown, start/end time pickers, max slots, room input

**CRUD operations:**
- **Add** — Creates schedule via `createSchedule()`, optimistically adds card to grid
- **Edit** — Updates via `updateSchedule()`, optimistically modifies the card
- **Delete** — Removes via `deleteSchedule()`, optimistically removes from grid

**Data source:** `getFacultySchedules(user.id)`
**UX:** Skeleton cards on load, optimistic add/edit/delete with rollback, toast notifications, real-time sync, latency masking

---

#### `FacultyRequestsContent.jsx` — Requests Tab
**What it does:** Lists all appointment requests from students, with approve/decline actions.

Shows:
- **Filter tabs** — All, Pending, Approved, Declined, Completed (with counts)
- **Request cards** — Student avatar + name, subject, details, day/time, status badge
- **Action buttons** — Approve (checkmark) and Decline (X) for pending requests
- **Soft Delete** — Allows faculty to clear their request list. If the student hasn't deleted their copy yet, the record remains in the database but is hidden from the faculty.

**Data source:** `getFacultyRequests(user.id)`
**UX:** Skeleton rows, optimistic approve/decline with rollback, real-time subscription (sees new requests instantly)

---

#### `FacultyAboutContent.jsx` — About Tab
**What it does:** Same content as the student About tab — project info, team, mission. Duplicated for brand consistency.

---

#### `FacultyManage.jsx` — Placeholder Page
**What it does:** Minimal placeholder at `/faculty/manage`. Just shows "Faculty Management - Manage appointments here." Not actively used — the actual management is in the dashboard tabs.

---

#### `facultyData.js` — Legacy Mock Data ⚠️
**What it does:** Contains hardcoded fake request and schedule data used before Supabase integration.

**Status:** **LEGACY — no longer used.** Schedule and request data now comes from `api.js`. This file can be safely deleted.

---

## 🔄 How It All Connects (Data Flow)

```
User opens app
    │
    ▼
main.jsx → App.jsx (routing)
    │
    ├── "/" → LandingPage → "Get Started" button
    │
    ├── "/login/student" → StudentLogin
    │       │
    │       ▼ supabase.auth.signInWithPassword()
    │       │
    │       ▼ Redirects to /student
    │
    ├── "/student" → ProtectedRoute (checks auth + role)
    │       │
    │       ▼ StudentDashboard (shell)
    │           ├── DashboardContent (overview)
    │           │     └── api.getStudentRequests() → Supabase DB
    │           ├── FacultyContent (browse + book)
    │           │     ├── api.getAllFaculty() → Supabase DB
    │           │     ├── api.getSchedulesForFaculty() → Supabase DB
    │           │     ├── api.checkActiveRequest() → Conflict check
    │           │     └── api.submitRequest() → Supabase DB
    │           └── AppointmentsContent (history)
    │                 ├── api.getStudentRequests() → Supabase DB
    │                 └── api.deleteRequest() → Soft delete
    │
    ├── "/faculty" → ProtectedRoute (checks auth + role)
    │       │
    │       ▼ FacultyDashboard (shell)
    │           ├── FacultyDashboardContent (overview)
    │           │     ├── api.getProfile() → Supabase DB
    │           │     ├── api.getFacultyRequests() → Supabase DB
    │           │     └── api.getFacultySchedules() → Supabase DB
    │           ├── FacultyScheduleContent (CRUD schedules)
    │           │     ├── api.createSchedule() → Supabase DB
    │           │     ├── api.updateSchedule() → Supabase DB
    │           │     └── api.deleteSchedule() → Supabase DB
    │           └── FacultyRequestsContent (approve/decline)
    │                 ├── api.updateRequestStatus() → Supabase DB
    │                 └── api.deleteRequest() → Soft delete
    │
    ├── Settings & Accessibility
    │     ├── Dark Mode (CSS Variables)
    │     ├── Font Size (S/M/L)
    │     └── High Contrast Mode
    │
    └── Real-time subscriptions (WebSocket)
          ├── Schedule changes → Both sides update
          ├── Request changes → Both sides update
          └── Status changes → Student directory updates
```

---

## 🗑️ Files You Can Safely Delete

These were used before the Supabase integration and are now completely unused:

| File | Why it's dead |
|------|--------------|
| `src/pages/student/appointmentsData.js` | Hardcoded fake appointments. Replaced by `api.getStudentRequests()` |
| `src/pages/faculty/facultyData.js` | Hardcoded fake requests/schedules. Replaced by `api.getFacultyRequests()` and `api.getFacultySchedules()` |
| `src/pages/student/StudentRequest.jsx` | Placeholder page. Booking is done in `FacultyContent.jsx` |
| `src/pages/faculty/FacultyManage.jsx` | Placeholder page. Management is done in dashboard tabs |
