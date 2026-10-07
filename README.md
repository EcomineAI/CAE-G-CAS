# FACS: Faculty Appointment & Consultation System
**Gordon College — CCS Faculty Consultation Hours System**

A real-time system designed to record and display the consultation availability of CCS faculty members at Gordon College. **FACS** helps bridge the gap between students and instructors, ensuring that consultation hours are predictable and convenient.

## 👥 Meet the Team
![June A.](https://img.shields.io/badge/June-red?style=for-the-badge)
![Erica M.](https://img.shields.io/badge/Erica%20M.-purple?style=for-the-badge)
![Erica C.](https://img.shields.io/badge/Erica%20C.-pink?style=for-the-badge)

---

## 🎯 The Mission
### Problem Statement
Consultation between students and instructors is critical. However, actual availability often deviates from the announced schedule, causing students to wait for long periods or travel to campus unnecessarily.

### Goals
- **Improve** the faculty consultation process for the CCS Department.
- **Provide** a reliable real-time system for students to check availability.
- **Reduce** time wasted due to uncertainty.

### Vision
Create a centralized management system that reduces uncertainty by providing real-time access to consultation data.

---

## 🚀 Tech Stack
- **Frontend:** [React](https://react.dev/) + [JSX](https://react.dev/learn/writing-markup-with-jsx)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Backend:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Styling:** Custom Vanilla CSS (Light-mode default · Premium · Mobile Responsive)

## ✨ Core Features
- **Unified Login:** One single login page for both students and faculty. Role is read from the Supabase `profiles` table after sign-in — no more guessing from the email pattern, no more separate login screens.
- **Admin Role Toggle:** Admins can switch any user's role between Student and Faculty from the Admin Dashboard with a single click. The change takes effect immediately on the next login.
- **Student Dashboard:** View appointment metrics (Approved, Pending, Completed, Cancelled), recent consultation history, upcoming appointments — all live from the database.
- **Faculty Directory:** Real-time visibility of CCS faculty status with a seamless booking flow (browse → select slot → submit details). Success confirmation plays a spring-bounce check animation.
- **Real-Time Sync:** Changes on the faculty side (schedule edits, request approvals) are reflected instantly on the student side via Supabase Realtime, and vice versa.
- **Faculty Schedule Manager:** Full CRUD for consultation time slots with day, time, room, and max-slot configuration.
- **Appointment Requests:** Faculty can approve/decline student requests with optimistic UI — status updates instantly, rolls back on failure.
- **Persistent Faculty Status:** Faculty availability (`Available`, `Busy`, `Unavailable`) is saved to the database and synced live to the student Faculty Directory.
- **Collapsible Hover Sidebars:** Both dashboards use a 68px → 270px CSS-only hover-expand sidebar. Icons stay in a fixed-width container so they never shift — only the labels slide in beside them.
- **Shared Settings Component:** One `SharedSettingsContent` powers both student and faculty settings, controlled by a `role` prop. Role-specific fields diverge, shared fields (dark mode, text size, accessibility) stay in sync.
- **Scroll-Gated Terms Modal:** Pure UI terms acceptance — the Close button is disabled until the user actually scrolls to the bottom of the terms.
- **Logout Confirmation:** No more accidental one-click logouts — a confirmation modal protects both student and faculty sign-outs.
- **Mobile-First Design:** Premium UI that adapts perfectly to desktop and mobile devices (sidebar collapses to a bottom tab bar on small screens).

### 🎨 UX Techniques
- **Light-mode Frosted Login:** Login page uses three slow-drifting pale blobs under a frosted glass card. The PNG logo has a `mask-image`-clipped glint sweep that passes across the actual logo shape every ~6 seconds.
- **Smart Role Hint:** As you type into the login, a chip appears automatically showing "Student account" (green) or "Faculty account" (indigo) based on whether the input looks like a numeric ID or a name.
- **Friendly Errors:** Supabase's cryptic error messages are mapped to plain language ("Wrong ID or password" instead of "Invalid login credentials"). Error box slides in and the card shakes on failure. Error clears as soon as you start typing again.
- **Optimistic UI:** All mutations (schedule CRUD, approve/decline requests, edit appointment info) update instantly with automatic rollback on server failure.
- **Critical Action Safety:** Premium in-app confirmation modals for high-stakes actions like declining requests, deleting schedules, cancelling appointments, and logging out.
- **Skeleton Loading:** Animated shimmer placeholders replace all "Loading..." text for a polished, app-like feel.
- **Toast Notifications:** Lightweight, CSS-only feedback toasts (✅ success / ❌ error / ⚠️ warning) with slide-in animations.
- **Latency Masking:** Minimum skeleton display time (300ms anti-flicker), debounced saves, and background data prefetch for instant tab switches.
- **Spring-bounce Success Animation:** The booking confirmation check icon pops in with a satisfying overshoot via `cubic-bezier(0.34,1.56,0.64,1)`.

---

## 📈 Latest Updates (v0.9.0) — October 7, 2026 — **FACS Rebrand & Unified Experience**

- **🔀 Rebrand: G-CAS → FACS** — *Faculty Appointment & Consultation System*. New navy "F" book logo across the entire app.
- **🔑 Unified Login (#login):** Removed the separate student/faculty login screens. One login page for everyone. Role is now fetched from `profiles.role` instead of being derived from the email pattern.
- **👤 Admin Role Toggle (#admin):** New `updateUserRole()` API and a per-user Student/Faculty pill toggle inside the Admin Dashboard. Admins can reassign any user's role on the fly.
- **🚪 No More LandingPage:** `/` now goes straight to login. The LandingPage file is retained but no longer routed.
- **📜 TermsModal Rewrite:** The old DB-coupled, state-glitchy terms modal has been replaced with a pure UI/UX implementation. Scroll-to-unlock gate with a bouncing "Scroll to read all" hint. Checkbox was removed entirely — scroll alone unlocks the Close button.
- **🚪 LogoutConfirm Modal:** New reusable `<LogoutConfirm>` component. Both student and faculty logout buttons now show a confirmation modal with a red logout icon, "Log out of FACS?" title, and Cancel + Log Out buttons.
- **🧩 Shared Components:** Introduced `SharedSettingsContent` and `SharedTermsContent` so both student and faculty render the exact same UI from a single source of truth (role prop controls the diverging fields).
- **🧭 Collapsible Hover Sidebars:** Both dashboards. CSS-only hover-expand (no JS state). Icons sit in a fixed-width `.nav-icon` container so they stay perfectly still when the sidebar expands — only labels slide in.
- **🎨 Sidebar Brand Unification:** Student sidebar now uses the same navy `#00004e` as faculty for brand consistency.
- **🖼️ Bare PNG Logo:** Removed the inverted CSS filter — the new logo is already colored navy and looks great on the dark sidebar as-is.
- **✨ Login Polish:** Light-mode frosted glass card over three slow-drifting pastel blobs. Logo has a `mask-image`-clipped glint sweep. Role hint chip, friendly errors, error shake, auto-focus, whitespace trim, "Terms & Conditions" quick-view link.
- **🎉 Booking Success Animation:** CheckCircle icon on the booking confirmation modal plays a spring-bounce `checkPop` animation (scale + rotation overshoot).
- **🏷️ Browser Tab Title:** Updated to `FACS: Faculty Appointment and Consultation System` (no em-dashes).

### Previous: v0.8.1 — May 9, 2026
- **Search-Optimized UI (#11):** Transformed all request and faculty lists into a high-performance, search-optimized interface. Added real-time filtering to handle 50+ records efficiently.
- **Hotfix: ReferenceError (#bug):** Resolved a critical crash in `StudentDashboard.jsx` where the notification state was accessed before declaration.
- **Lightweight Experience:** Replaced 3D assets with SVG icons for faster load times and professional visual clarity across all empty states.

### Previous: v0.8.0
- **Profile Name Redesign (#18):** Decoupled professional prefixes and suffixes from the `full_name` database field.
- **Refined Faculty Titles:** Standardized professional titles to strictly "Academic" and "Administrative" categories.
- **Real Profile Picture Upload (#16):** Supabase Storage integration for custom photos.
- **Storage Security:** Isolated user media buckets with RLS.
- **Appointment Capacity Guard (#1):** Database-level overbooking prevention.
- **Faculty Feedback Notes (#21):** Approval instructions for students.
- **Date-Specific Scheduling (#38):** Added support for one-time consultation slots.
- **Auto-Divided Time Allocation (#47):** Implemented intelligent sub-slot calculation.
- **Bug Fixes:** Resolved a critical `ReferenceError` where the `Bell` icon was used in the Student Dashboard without being imported. Fixed a syntax error (missing comma) in the PWA `manifest.json`.

### Previous: v0.7.0
- **Monthly Calendar Overview (#38):** Replaced the static schedule list with a full interactive month view on the Faculty Dashboard. Supports navigation, highlights today, and shows color-coded indicators for both schedules and appointments.
- **Real-Time Notification Center (#47, #48):** Added a dedicated notification panel with unread badges. Users receive instant alerts for approvals, declines, and cancellations without needing to check specific tabs.
- **Accessibility Suite (#51):** Integrated toggles for **Reduced Motion** (disables animations) and **Dyslexia Friendly Font** (OpenDyslexic typeface) in the Settings modal to improve platform inclusivity.
- **Philippine Name Standards (#18):** Refined the profile system with grouped dropdowns for Philippine-specific prefixes (Dr., Engr., Atty.) and suffixes (Jr., III, Ph.D.) to ensure academic and professional titles are correctly captured.
- **Scheduling Guardrails (#37):** Implemented backend overlap detection. Faculty are now alerted if they attempt to create conflicting consultation slots on the same day.
- **PWA Integration (#43):** Added a manifest and mobile meta tags to support "Add to Home Screen" functionality on iOS and Android for a standalone app experience.

### Previous: v0.6.0
- **Visual Overhaul:** Integrated Gordon College building background across all dashboards and login pages with premium frosted-glass (glassmorphism) effects.
- **History Persistence (Soft Delete):** Role-based soft-delete system. Students can clear their view of history without deleting the record for Faculty.
- **Intelligent Name Parsing:** Multi-word first names and middle initials now supported.
- **Unified Theme System:** Synchronized dark/light mode variables across both dashboards.
- **Input UX Polish:** Standardized input field aesthetics, fixed muddy colors in light mode, added browser autofill overrides.
- **Scroll Cleanliness:** Globally hidden browser scrollbars for a more immersive, app-like experience.

### Previous: v0.5.0
- Mobile UI Overhaul, History Management, Availability Guardrails, Pulsing Live Indicators, Tab Persistence.

### Previous: v0.3.0
- Full Supabase Integration, Real-Time Subscriptions, Profile System, Optimistic CRUD, Skeleton Loading, Toast Notifications, Latency Masking.

### Previous: v0.2.0
- Faculty UI Synchronization, Consultation Schedule Manager, Appointment Requests Hub, Dashboard Deep Linking, Comprehensive Dark Mode.

---

## 📅 Development Activity Log

### **October 7, 2026** — FACS Rebrand & Unified Login
- **Complete rebrand:** G-CAS → FACS across all tabs, titles, metadata, modals, and copy.
- **Unified LoginPage:** Rewrote `LoginPage.jsx` as a single login for both roles. Added admin bypass, role lookup from `profiles.role`, friendly error mapping, error shake animation, role-hint chip, auto-focus, whitespace trim, and a Terms & Conditions quick-view link.
- **Login UI overhaul:** Light-mode frosted glass card, three slow-drifting pastel blob background, PNG logo with `mask-image`-clipped glint sweep.
- **Admin role toggle:** Added `updateUserRole(userId, role)` to the API. Added a Student/Faculty pill toggle to each row in the Admin Users table.
- **Removed landing page from routing:** `/` now renders LoginPage directly.
- **TermsModal rewrite:** Scroll-gated Close button, no checkbox, no DB coupling. Pure UI/UX with a bouncing "Scroll to read all" hint and fade-out gradient.
- **LogoutConfirm:** Created new reusable `<LogoutConfirm>` component. Wired into both StudentDashboard and FacultyDashboard logout buttons.
- **Shared components:** Created `SharedSettingsContent` and `SharedTermsContent` as single sources of truth for both roles. Added role-specific divergence (Student number vs Faculty ID, Booking rules only for faculty, Experimental features beta card only for faculty).
- **Collapsible hover sidebars:** Rebuilt the sidebar in both dashboards. Icons wrapped in `.nav-icon` fixed-width containers so they stay still on hover-expand. CSS-only, no JS state.
- **Sidebar brand unification:** Student sidebar `--sidebar-bg` changed from `#0d1b3e` to `#00004e` to match faculty.
- **Booking check animation:** Added `checkPop` keyframe (spring overshoot) to the booking confirmation success icon.
- **Updated PROJECT_GUIDE.md and README.md** to reflect all the above.

### **May 8-9, 2026** — GCAS V4 Scheduling & Accessibility
- **Interactive Calendar View:** Developed `CalendarView.jsx` — a custom CSS Grid calendar with month navigation and event indicators for schedules and requests.
- **Notification Center:** Built a dedicated `NotificationCenter.jsx` component. Integrated real-time unread counts and type-specific icons (Approved, Declined, New Request).
- **Accessibility Integration:** Updated `SettingsModal.jsx` and Dashboard shells to support global `.reduced-motion` and `.dyslexic-font` CSS classes.
- **Database Schema Expansion:** Added `name_prefix`, `name_suffix`, and `accessibility_prefs` columns to the `profiles` table.
- **Philippine Context Polish:** Added `PH_PREFIXES` and `PH_SUFFIXES` constants. Updated profile modals in both dashboards to use grouped dropdown selectors.
- **Schedule Integrity:** Injected overlap detection logic into `FacultyScheduleContent.jsx` to compare start/end times against existing slots before creation.
- **PWA Manifest:** Created `manifest.json` and updated `index.html` with Apple-specific meta tags and branded theme colors.
- **Decline Visibility:** Updated Student Appointment view to display `decline_reason` directly on history cards.

### **May 4, 2026** — Mobile UX & History Cleanup
- **Appointments Mobile Overhaul:** Replaced table-based layout with a modern card system on mobile.
- **History Deletion System:** Added `deleteRequest` to the API. Integrated "Delete" actions into History tabs for both Students and Faculty.
- **Deletion Safety:** Built custom confirmation modals.
- **Availability Logic:** Dynamic request blocking for "Unavailable" / "Busy" faculty.
- **Pulsing Status Rings:** Added CSS keyframe animations to faculty profile pictures.
- **Tab Persistence:** `localStorage` syncing for `activeTab` state.
- **Viewport Stability:** Prevents mobile browsers from zooming on input focus.
- **Name Format Standard:** First Middle Last naming convention enforced.
- **WebSocket Cleanup:** Hardened `realtime.js` unsubscribe functions.

### **April 27, 2026** — Supabase Integration & UX
- **Full Database Wiring:** Connected all UI components to Supabase PostgreSQL.
- **API Layer Rewrite:** Rewrote `src/supabase/api.js` with real profile queries and computed slot counts.
- **Real-Time Engine:** Created `src/supabase/realtime.js` with subscription helpers.
- **UX Utilities Module:** Created `src/supabase/ux.js` with toasts, optimistic helper, skeletons, and latency masking.
- **Optimistic CRUD:** Faculty schedule and request mutations now update UI instantly with rollback on failure.
- **Skeleton Loading:** Replaced all "Loading..." text with shimmer placeholders.
- **Toast Feedback:** Every user action shows a slide-in toast notification.
- **Latency Masking:** `withMinDelay()`, `debouncedSave()`, and `prefetch()` cache.
- **Profile System:** Added `ensureProfile()` helper.
- **Persistent Status:** Faculty availability saved to DB and synced live.
- **Setup Guide:** Created `SUPABASE_SETUP.md`.

### **April 28, 2026** — Profile Standards & Identity
- **Profile Completion Enforcement** for students with numeric usernames.
- **Identity Transparency:** Faculty see student account number alongside name.
- **Editable Profiles:** Dedicated profile editing modal with 20 Lorelei-style avatars.
- **Critical Action Safety:** Replaced all `window.confirm` with custom in-app modals.
- **Appointment Post-Submission Edits:** Students can modify pending requests.
- **Cancellation Reasons:** New column in `requests` table for cancel notes.
- **Cloudflare Tunneling:** Created `cloud.py` for mobile testing.

### **April 25, 2026** — Faculty Dashboard
- **Faculty Dashboard Sync:** Mirrored the student visual system onto faculty.
- **Responsive Navigation:** Rebuilt faculty nav with pill design.
- **Schedule Modals:** Premium modals for schedule add/edit.
- **Dynamic Filtering:** Status chips on Requests tab with live counts.
- **Intelligent Routing:** Metric cards link to filtered tab states.
- **Dark Mode Expansion:** Hardcoded hex replaced with CSS variables.

### **April 21, 2026** — Student Dashboard
- **UI/UX Overhaul:** Modern pill-based navigation.
- **Dark Mode Implementation:** CSS variable-based theme system.
- **Background & Icons:** Dot Grid pattern + personalized initial-based avatars.
- **Status System:** Standardized badge colors.
- **Layout Consistency:** Fixed vertical alignment of history cards.
- **Scroll Cleanliness:** Hidden scrollbars for seamless feel.

---

## 🛠️ Developer Setup

### 1. Supabase Database Setup
Before running the app, you must set up the database tables in your Supabase project.

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key into `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Follow the step-by-step guide in **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** to create all tables, triggers, and security policies.
4. Ensure `profiles` has a `role` column (`'student'` or `'faculty'`) — this is what FACS reads to route users after login.

### 2. Install & Run
```bash
npm install   # Install dependencies
npm run dev   # Start dev server (Vite)
```

### 3. Quick Start Script
Alternatively, double-click `start_gcas.bat` in the root folder — it auto-installs dependencies if missing.

### 4. Mobile Testing (Cloudflare)
To test the app on your phone, run:
```bash
python cloud.py
```
This will generate a public `.trycloudflare.com` link you can open on any device.

### 5. Admin Access
Use the built-in admin bypass:
- **Email:** `Admin@gmail.com`
- **Password:** `admin`

Logs you in as faculty with access to the Admin tab where you can toggle any user's role.

---

## 📂 Project Structure
```
src/
├── components/
│   ├── LogoutConfirm.jsx          # ⭐ New: logout confirmation modal
│   ├── SharedSettingsContent.jsx  # ⭐ Unified settings for both roles
│   ├── SharedTermsContent.jsx     # ⭐ Shared terms content
│   ├── TermsModal.jsx             # Scroll-gated terms popup (pure UI)
│   ├── NotificationCenter.jsx     # Realtime notification panel
│   ├── ProfileEditModal.jsx       # Shared profile editor
│   ├── CalendarView.jsx           # Shared calendar component
│   ├── SharedCalendarGrid.jsx     # Calendar grid building block
│   ├── ProtectedRoute.jsx         # Auth + role route guard
│   └── (legacy: Button, Input, Navbar, SettingsModal, ToggleRole)
├── hooks/
│   ├── useAuth.js                 # ⭐ Role now sourced from profiles.role
│   └── useNetworkStatus.js
├── pages/
│   ├── Login/
│   │   └── LoginPage.jsx          # ⭐ Unified login (student + faculty + admin)
│   ├── student/
│   │   ├── StudentDashboard.jsx   # Shell w/ hover sidebar + LogoutConfirm
│   │   ├── DashboardContent.jsx
│   │   ├── FacultyContent.jsx     # Browse + book (w/ checkPop animation)
│   │   ├── AppointmentsContent.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── WelcomeContent.jsx
│   │   └── AboutContent.jsx
│   ├── faculty/
│   │   ├── FacultyDashboard.jsx   # Shell w/ hover sidebar + LogoutConfirm
│   │   ├── FacultyDashboardContent.jsx
│   │   ├── FacultyScheduleContent.jsx
│   │   ├── FacultyRequestsContent.jsx
│   │   ├── FacultyCalendarPage.jsx
│   │   └── FacultyAboutContent.jsx
│   ├── admin/
│   │   └── AdminContent.jsx       # ⭐ Role toggle UI + user management
│   └── LandingPage/               # (no longer routed)
├── supabase/
│   ├── supabase.js                # Client init + ensureProfile
│   ├── api.js                     # ⭐ Added updateUserRole()
│   ├── realtime.js                # WebSocket subscription helpers
│   └── ux.js                      # Toasts, skeletons, optimistic, latency
├── utils/
│   ├── authUtils.js
│   ├── constants.js
│   ├── dateUtils.js
│   └── googleCalendar.js
├── cloud.py                       # Cloudflare tunnel automation
├── SUPABASE_SETUP.md              # Database setup guide
└── PROJECT_GUIDE.md               # Full project maintenance guide
```

---
*Developed for Gordon College CCS Department.*
