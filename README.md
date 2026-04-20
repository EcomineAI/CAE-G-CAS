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
- **Backend:** [Firebase](https://firebase.google.com/) (Auth & Database ready)
- **Branding:** Custom Vanilla CSS (Premium & Mobile Responsive)

## ✨ Core Features
- **Institutional Auth:** Secure login using Gordon College domain accounts (`@gordoncollege.edu.ph`).
- **Student Dashboard:** View appointment metrics (Approved, Pending, Completed) and recent consultation history.
- **Faculty Directory:** Real-time visibility of CCS faculty status with a seamless 3-step booking system.
- **Real-Time Status:** Interactive pills showing `Available`, `Busy`, or `Unavailable` faculty.
- **Mobile-First Design:** Premium, two-tone UI layout that adapts perfectly to desktop and mobile devices.

---

## 📈 Latest Updates (v0.1.0)
- **New Faculty Tab:** Implemented a full directory with high-fidelity faculty cards, slot-based booking tables, and request confirmation modals.
- **Component Refactoring:** Migrated dashboard views into modular files (`DashboardContent.jsx`, `FacultyContent.jsx`) for cleaner code management.
- **UI/UX Polishing:** Enhanced layout proportions with a 1050px container and refined typography for a professional look.
- **Dev Speed:** Integrated a "Skip to Dashboard" button in the login page for rapid UI testing.
────────────────────────────────────────────────────────────────────────────────

├── 📁 public/
│   ├── 🖼️ favicon.svg
│   └── 🖼️ icons.svg
├── 📁 src/
│   ├── 📁 assets/
│   │   ├── 🖼️ hero.png
│   │   ├── 🖼️ react.svg
│   │   └── 🖼️ vite.svg
│   ├── 📁 components/
│   │   ├── 📄 Button.jsx
│   │   ├── 📄 Input.jsx
│   │   ├── 📄 Navbar.jsx
│   │   └── 📄 ToggleRole.jsx
│   ├── 📁 firebase/
│   │   └── 📄 config.js
│   ├── 📁 pages/
│   │   ├── 📁 LandingPage/
│   │   │   └── 📄 LandingPage.jsx
│   │   ├── 📁 Login/
│   │   │   ├── 📁 Faculty/
│   │   │   │   └── 📄 FacultyLogin.jsx
│   │   │   └── 📁 Student/
│   │   │       └── 📄 StudentLogin.jsx
│   │   ├── 📁 faculty/
│   │   │   ├── 📄 FacultyDashboard.jsx
│   │   │   └── 📄 FacultyManage.jsx
│   │   ├── 📁 student/
│   │   │   ├── 📄 DashboardContent.jsx
│   │   │   ├── 📄 FacultyContent.jsx
│   │   │   ├── 📄 StudentDashboard.jsx
│   │   │   └── 📄 StudentRequest.jsx
│   │   └── 🖼️ logo.png
│   ├── 📄 App.jsx
│   └── 📄 main.jsx
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ package-lock.json
├── ⚙️ package.json
├── 📄 start_gcas.bat
└── 📄 vite.config.js

────────────────────────────────────────────────────────────────────────────────
---

## 🛠️ Developer Setup

### 1. The "Self-Healing" Start
We've included a script to make setup effortless. If you delete `node_modules` to save space, the script will automatically fix it.
- **Run:** Double-click `start_gcas.bat` in the root folder.

### 2. Manual Commands
```bash
npm install   # Downloads libraries
npm run dev   # Starts the app
```

## 📂 Project Structure
- `src/components/`: Reusable UI pieces (Input, etc.).
- `src/pages/student/`: Student-side views and modular tab components:
    - `StudentDashboard.jsx` (Main Tab Wrapper)
    - `DashboardContent.jsx` (Overview Tab)
    - `FacultyContent.jsx` (Faculty & Booking Tab)
- `src/pages/faculty/`: Faculty management and dashboard pages.
- `src/pages/Login/`: Separate institutional login gateways.

---
*Developed for Gordon College CCS Department.*
