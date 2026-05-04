# G-CAS: Gordon College Appointment System
**CCS Faculty Consultation Hours System**

A real-time system designed to record and display the consultation availability of CCS faculty members at Gordon College. G-CAS helps bridge the gap between students and instructors, ensuring that consultation hours are predictable and convenient.

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
- **Styling:** Custom Vanilla CSS (Premium & Mobile Responsive)

## ✨ Core Features
- **Institutional Auth:** Secure login using Gordon College domain accounts (`@gordoncollege.edu.ph`) via Supabase Auth with magic links.
- **Student Dashboard:** View appointment metrics (Approved, Pending, Completed, Cancelled) and recent consultation history — all live from the database.
- **Faculty Directory:** Real-time visibility of CCS faculty status with a seamless booking flow (browse → select slot → submit details).
- **Real-Time Sync:** Changes on the faculty side (schedule edits, request approvals) are reflected instantly on the student side via Supabase Realtime, and vice versa.
- **Faculty Schedule Manager:** Full CRUD for consultation time slots with day, time, room, and max-slot configuration.
- **Appointment Requests:** Faculty can approve/decline student requests with optimistic UI — status updates instantly, rolls back on failure.
- **Persistent Faculty Status:** Faculty availability (`Available`, `Busy`, `Unavailable`) is saved to the database and synced live to the student Faculty Directory.
- **Mobile-First Design:** Premium, two-tone UI layout that adapts perfectly to desktop and mobile devices.

### 🎨 UX Techniques
- **Optimistic UI:** All mutations (add/edit/delete schedule, approve/decline requests, edit appointment info) update instantly with automatic rollback on server failure.
- **Critical Action Safety:** Premium in-app confirmation modals for high-stakes actions like declining requests, deleting schedules, or cancelling appointments.
- **Skeleton Loading:** Animated shimmer placeholders replace all "Loading..." text for a polished, app-like feel.
- **Toast Notifications:** Lightweight, CSS-only feedback toasts (✅ success / ❌ error / ⚠️ warning) with slide-in animations.
- **Latency Masking:** Minimum skeleton display time (300ms anti-flicker), debounced saves, and background data prefetch for instant tab switches.

---

## 📈 Latest Updates (v0.3.0)
- **Full Supabase Integration:** All CRUD operations persist to PostgreSQL — schedules, requests, and profiles are fully database-backed.
- **Real-Time Subscriptions:** Faculty schedule changes, request status updates, and availability toggles sync live across student and faculty views.
- **Profile System:** Auto-created `profiles` table via database trigger on sign-up. Faculty names and avatars are pulled from the DB instead of hardcoded.
- **Optimistic UI:** Schedule add/edit/delete and request approve/decline update the UI instantly with rollback on failure.
- **Skeleton Loading:** Six animated shimmer components replacing all text-based loading states.
- **Toast Notifications:** Lightweight feedback system for every user action (no external dependencies).
- **Latency Masking:** withMinDelay (anti-flicker), debouncedSave (status toggle), and prefetch cache (instant tab switches).
- **SQL Setup Guide:** Added `SUPABASE_SETUP.md` with step-by-step instructions for database setup.
- **Confirmation Dialogs:** Added "Are you sure?" modals for all critical/destructive actions (declining requests, deleting schedules, cancelling appointments).
- **Profile Management:** Users (Students & Faculty) can now edit their names and choose from 20 modern, neutral avatars.
- **Appointment Editing:** Students can now edit the subject and details of their pending requests.
- **Cloudflare Tunneling:** Added `cloud.py` to instantly expose the local server for mobile device testing.
- **Cancellation Reasons:** Students must provide a note when cancelling, which is visible to faculty.

### Previous: v0.2.0
- Faculty UI Synchronization, Consultation Schedule Manager, Appointment Requests Hub, Dashboard Deep Linking, Comprehensive Dark Mode.

---

## 📅 Development Activity Log

### **April 27, 2026** — Supabase Integration & UX
- **Full Database Wiring:** Connected all UI components to Supabase PostgreSQL — schedules, requests, and profiles are fully persisted.
- **API Layer Rewrite:** Rewrote `src/supabase/api.js` — fixed all placeholder data (`'Faculty Name'`, `'Faculty Member'`), added profile queries, computed filled slot counts.
- **Real-Time Engine:** Created `src/supabase/realtime.js` with subscription helpers for schedules, requests, and faculty status changes.
- **UX Utilities Module:** Created `src/supabase/ux.js` with toast notifications, optimistic update helper, 6 skeleton components, and latency masking utilities.
- **Optimistic CRUD:** Faculty schedule add/edit/delete and request approve/decline now update UI instantly with automatic rollback on server failure.
- **Skeleton Loading:** Replaced all "Loading..." text with animated shimmer placeholders matching the real layout (schedule cards, request rows, metric cards, faculty cards, table rows, appointment cards).
- **Toast Feedback:** Every user action (save, delete, approve, decline, status change, submit request) shows a slide-in toast notification.
- **Latency Masking:** Added `withMinDelay()` (300ms anti-flicker), `debouncedSave()` (500ms for status toggles), and `prefetch()` cache for instant tab switches.
- **Profile System:** Added `ensureProfile()` helper and database trigger to auto-create profiles on sign-up. Faculty welcome message now reads from DB.
- **Persistent Status:** Faculty availability (Available/Busy/Unavailable) saved to profiles table and synced live to student Faculty Directory.
- **Setup Guide:** Created `SUPABASE_SETUP.md` — step-by-step guide for creating tables, triggers, RLS, and enabling Realtime in Supabase Dashboard.

### **April 28, 2026** — Profile Standards & Identity
- **Profile Completion Enforcement:** Students with numeric usernames are now prompted to complete their real profile (Lastname, Firstname Middlename).
- **Mandatory Standards:** Enforced proper name formatting to ensure students are easily identifiable by faculty.
- **Identity Transparency:** Faculty can now see the student's account number (Student ID) alongside their name for verification.
- **Editable Profiles:** Added a dedicated profile editing modal for both Students and Faculty with 20 Lorelei-style avatars.
- **Critical Action Safety:** Replaced all `window.confirm` popups with premium, custom in-app confirmation modals for high-stakes actions.
- **Appointment Post-Submission Edits:** Students can now modify the details of their pending requests if they made a mistake.
- **Cancellation Reasons:** Implemented a new column in the `requests` table to store and display student-provided cancellation notes.
- **Cloudflare Tunneling:** Created `cloud.py` — an automated script to download and run Cloudflare Tunnel (`cloudflared`) to expose `localhost:5173` for mobile testing.

### **April 25, 2026** — Faculty Dashboard
- **Faculty Dashboard Sync:** Transferred exact CSS variables, hover effects, and dot-grid backgrounds from the student dashboard to the faculty view.
- **Responsive Navigation:** Rebuilt the faculty nav bar using modern pill designs and transparent hover states.
- **Schedule Modals:** Created a premium modal interface for adding and editing faculty consultation hours.
- **Dynamic Filtering:** Added interactive status chips to the Requests tab that update counts dynamically.
- **Intelligent Routing:** Linked dashboard metric cards directly to filtered states within the Requests and Schedule tabs.
- **Dark Mode Expansion:** Replaced all hardcoded hex values in faculty components with global CSS variables.
- **About Tab Migration:** Copied the project team and system mission content to the faculty view for brand consistency.
- **Status Dot Fix:** Resolved a flexbox squashing issue preventing the 'Unavailable' status dot from rendering.

### **April 22, 2026** — Documentation
- **Documentation:** Finalized comprehensive README update tracking all system refinements and visual polish.

### **April 21, 2026** — Student Dashboard
- **UI/UX Overhaul:** Updated navigation to modern orange-accented pill design with high-fidelity hover states.
- **Dark Mode Implementation:** Created a CSS variable-based theme system with deep charcoal tones and a Moon toggle.
- **Background & Icons:** Added "Dot Grid" background pattern and implemented personalized initial-based avatars.
- **Status System:** Standardized badge colors: Green (Approved), Yellow (Pending), Red (Denied).
- **Layout Consistency:** Fixed vertical alignment and card spacing for appointment history list items.
- **Scroll Cleanliness:** Hidden visual scrollbars on the dashboard wrapper for a seamless, app-like feel.
- **Badge Refinement:** Updated status pills with 1.5px strokes and 700-weight typography for a premium look.
- **Site Identity:** Updated favicon to `logo.png` and set title to "Gordon College Appointment System".

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
This will generate a public `.trycloudflare.com` link you can open on any device!

---

## 📂 Project Structure
```
src/
├── components/          # Reusable UI (Input, Button, ProtectedRoute)
├── hooks/
│   └── useAuth.js       # Auth state hook (session, role detection)
├── pages/
│   ├── student/         # Student-side views
│   │   ├── StudentDashboard.jsx    # Main shell (nav, tabs, dark mode)
│   │   ├── DashboardContent.jsx    # Overview: metrics + recent appointments
│   │   ├── FacultyContent.jsx      # Faculty directory + booking flow
│   │   ├── AppointmentsContent.jsx # Appointments table with filters
│   │   └── AboutContent.jsx        # About the system
│   ├── faculty/         # Faculty-side views
│   │   ├── FacultyDashboard.jsx    # Main shell (nav, tabs, dark mode)
│   │   ├── FacultyDashboardContent.jsx  # Overview: metrics + pending requests
│   │   ├── FacultyScheduleContent.jsx   # Schedule CRUD manager
│   │   ├── FacultyRequestsContent.jsx   # Request approval workflow
│   │   └── FacultyAboutContent.jsx      # About the system
│   ├── Login/           # Institutional login gateways
│   └── LandingPage/     # Landing page
├── supabase/            # 🔌 All backend logic lives here
│   ├── supabase.js      # Client init + ensureProfile helper
│   ├── api.js           # All CRUD functions (profiles, schedules, requests)
│   ├── realtime.js      # Real-time subscription helpers
│   └── ux.js            # UX utilities (toasts, skeletons, optimistic, latency)
├── utils/
│   └── authUtils.js     # Role detection + name formatting
├── cloud.py             # ☁️ Cloudflare tunnel automation
├── SUPABASE_SETUP.md    # 🗄️ Database setup guide
└── PROJECT_GUIDE.md     # 📖 Project maintenance guide
```

---
*Developed for Gordon College CCS Department.*
