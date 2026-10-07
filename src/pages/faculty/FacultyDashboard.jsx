import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { getProfile, updateProfile, updateFacultyStatus } from '../../supabase/api';
import { debouncedSave, toast } from '../../supabase/ux';
import { Layout, Calendar, CalendarDays, Clock, Bell, User, Moon, Sun, ChevronDown, CheckCircle, AlertCircle, XCircle, Settings, Menu, X as CloseIcon, Info, LogOut, ShieldCheck, FileText } from 'lucide-react';
import FacultyDashboardContent from './FacultyDashboardContent';
import FacultyScheduleContent from './FacultyScheduleContent';
import FacultyRequestsContent from './FacultyRequestsContent';
import FacultyAboutContent from './FacultyAboutContent';
import FacultyCalendarPage from './FacultyCalendarPage';
import AdminContent from '../admin/AdminContent';
import TermsModal from '../../components/TermsModal';
import { useAuth } from '../../hooks/useAuth';
import logo from '../logo.png';
import SharedSettingsContent from '../../components/SharedSettingsContent';
import NotificationCenter from '../../components/NotificationCenter';
import ProfileEditModal from '../../components/ProfileEditModal';
import LogoutConfirm from '../../components/LogoutConfirm';

const facultyDashStyles = `
/* ── Faculty dashboard token bridge ── */
.faculty-dashboard-wrapper {
  --sidebar-bg:     #00004e;
  --sidebar-hover:  rgba(255,255,255,0.07);
  --sidebar-active: #1e3a6e;
  --sidebar-text:   rgba(255,255,255,0.80);
  --sidebar-label:  rgba(255,255,255,0.38);
  --sidebar-border: rgba(255,255,255,0.1);
  --sidebar-width:  270px;

  --main-bg:        #f0f2f8;
  --topbar-bg:      #ffffff;
  --topbar-border:  #e5e8f0;
  --card-bg:        #ffffff;
  --card-border:    #e5e8f0;
  --card-shadow:    0 1px 8px rgba(0,0,0,0.06);

  --text-primary:   #1a2d5a;
  --text-secondary: #374151;
  --text-muted:     #6b7280;
  --accent:         #2e4a87;
  --accent-light:   #eef1fa;
  --accent-main:    #2e4a87;
  --accent-orange:  #2e4a87;

  --border-color:   #e5e8f0;
  --bg-primary:     #f0f2f8;
  --bg-secondary:   #ffffff;
  --shadow:         0 1px 8px rgba(0,0,0,0.06);
}

.faculty-dashboard-wrapper.dark {
  --sidebar-bg:     #0f1729;
  --sidebar-hover:  rgba(255,255,255,0.06);
  --sidebar-active: #1e3460;
  --sidebar-text:   rgba(255,255,255,0.65);
  --sidebar-label:  rgba(255,255,255,0.3);
  --sidebar-border: rgba(255,255,255,0.08);

  --main-bg:        #0c1022;
  --topbar-bg:      #111827;
  --topbar-border:  rgba(255,255,255,0.07);
  --card-bg:        #1a2235;
  --card-border:    rgba(255,255,255,0.07);
  --card-shadow:    0 2px 16px rgba(0,0,0,0.3);

  --text-primary:   #e2e8f5;
  --text-secondary: #c7d3ea;
  --text-muted:     #7a8fb0;
  --accent:         #5b80c4;
  --accent-light:   rgba(91,128,196,0.15);
  --accent-main:    #5b80c4;
  --accent-orange:  #5b80c4;

  --border-color:   rgba(255,255,255,0.07);
  --bg-primary:     #0c1022;
  --bg-secondary:   #1a2235;
  --shadow:         0 2px 16px rgba(0,0,0,0.3);
}

.prefix-suffix-toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.toggle-chip {
  padding: 0.35rem 0.8rem;
  border-radius: 20px;
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-chip:hover {
  border-color: var(--accent, #2e4a87);
}

.toggle-chip.active {
  background: var(--accent-light);
  color: var(--accent, #2e4a87);
  border-color: var(--accent, #2e4a87);
}

.toggle-chip-more {
  padding: 0.35rem 0.5rem;
  border-radius: 20px;
  background: transparent;
  border: 1px dashed var(--border-color);
  color: var(--text-muted);
  font-size: 0.75rem;
  cursor: pointer;
  outline: none;
}


.faculty-dashboard-wrapper.high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #111111;
  --text-primary: #ffffff;
  --text-secondary: #ffffff;
  --text-muted: #ffff00;
  --border-color: #ffffff;
  --card-border: #ffffff;
  --accent-orange: #ff8c00;
  --accent-light: #333333;
  --shadow: 0 0 0 2px #ffffff;
}

.faculty-dashboard-wrapper.text-small { font-size: 0.85rem !important; }
.faculty-dashboard-wrapper.text-medium { font-size: 1rem !important; }
.faculty-dashboard-wrapper.text-large { font-size: 1.15rem !important; }

/* Headers scaling */
.faculty-dashboard-wrapper.text-small h1,
.faculty-dashboard-wrapper.text-small h2 { font-size: 1.4rem !important; }
.faculty-dashboard-wrapper.text-large h1,
.faculty-dashboard-wrapper.text-large h2 { font-size: 2.5rem !important; }

/* Subtext scaling */
.faculty-dashboard-wrapper.text-small p,
.faculty-dashboard-wrapper.text-small .requests-header p { font-size: 0.75rem !important; }
.faculty-dashboard-wrapper.text-large p,
.faculty-dashboard-wrapper.text-large .requests-header p { font-size: 1rem !important; }

/* Metrics scaling */
.faculty-dashboard-wrapper.text-small .metric-num { font-size: 1.5rem !important; }
.faculty-dashboard-wrapper.text-large .metric-num { font-size: 2.2rem !important; }

/* Navigation scaling */
.faculty-dashboard-wrapper.text-small .nav-link { font-size: 0.8rem !important; }
.faculty-dashboard-wrapper.text-large .nav-link { font-size: 1.1rem !important; }

/* Card and Label scaling */
.faculty-dashboard-wrapper.text-small h3,
.faculty-dashboard-wrapper.text-small h4,
.faculty-dashboard-wrapper.text-small .metric-title,
.faculty-dashboard-wrapper.text-small .metric-sub,
.faculty-dashboard-wrapper.text-small .status-pill-small,
.faculty-dashboard-wrapper.text-small .brand-text-full,
.faculty-dashboard-wrapper.text-small .brand-text-mobile,
.faculty-dashboard-wrapper.text-small .filter-chip { font-size: 0.7rem !important; }

.faculty-dashboard-wrapper.text-large h3,
.faculty-dashboard-wrapper.text-large h4,
.faculty-dashboard-wrapper.text-large .metric-title,
.faculty-dashboard-wrapper.text-large .metric-sub,
.faculty-dashboard-wrapper.text-large .status-pill-small,
.faculty-dashboard-wrapper.text-large .brand-text-full,
.faculty-dashboard-wrapper.text-large .brand-text-mobile,
.faculty-dashboard-wrapper.text-large .filter-chip { font-size: 1.1rem !important; }

/* Accessibility Classes */
.faculty-dashboard-wrapper.reduced-motion * {
  animation: none !important;
  transition: none !important;
}

@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/OpenDyslexic-Regular.otf');
}

.faculty-dashboard-wrapper.dyslexic-font {
  font-family: 'OpenDyslexic', sans-serif !important;
}

.faculty-dashboard-wrapper.dyslexic-font h1,
.faculty-dashboard-wrapper.dyslexic-font h2,
.faculty-dashboard-wrapper.dyslexic-font h3,
.faculty-dashboard-wrapper.dyslexic-font p,
.faculty-dashboard-wrapper.dyslexic-font span,
.faculty-dashboard-wrapper.dyslexic-font button,
.faculty-dashboard-wrapper.dyslexic-font input,
.faculty-dashboard-wrapper.dyslexic-font textarea,
.faculty-dashboard-wrapper.dyslexic-font select {
  font-family: 'OpenDyslexic', sans-serif !important;
}


.faculty-dashboard-wrapper {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: var(--main-bg, #f0f2f8);
  z-index: 50;
  display: flex;
  font-family: 'Outfit', 'Inter', sans-serif;
  color: var(--text-primary);
}

.dashboard-bg-layer, .dashboard-overlay { display: none; }

/* ── Sidebar ── */
.fac-sidebar {
  width: 68px;
  flex-shrink: 0;
  background: var(--sidebar-bg, #1a2d5a);
  display: flex;
  flex-direction: column;
  padding: 0;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
}
.fac-sidebar:hover { width: 270px; }
.fac-sidebar::-webkit-scrollbar { display: none; }

.fac-sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1.6rem 1.3rem 1.2rem 1.3rem;
  border-bottom: 1px solid var(--sidebar-border, rgba(255,255,255,0.1));
  margin-bottom: 0.7rem;
}
.fac-sidebar-brand img { width: 38px; height: auto; filter: none; opacity: 1; }
.fac-sidebar-brand-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 900;
  font-size: 1.55rem;
  color: #ffffff;
  letter-spacing: -0.3px;
}
.fac-sidebar-brand-sub {
  font-size: 0.68rem; color: rgba(255,255,255,0.45);
  font-weight: 500; letter-spacing: 0.02em;
  display: block; margin-top: 2px;
}

.fac-section-label {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--sidebar-label, rgba(255,255,255,0.38));
  padding: 0.7rem 1.3rem 0.35rem 1.3rem;
}

.fac-nav-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.75rem 1.2rem; margin: 0.1rem 0.6rem;
  border-radius: 10px; border: none;
  background: transparent;
  color: var(--sidebar-text, rgba(255,255,255,0.80));
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.15s;
  width: calc(100% - 1.2rem);
  text-align: left;
}
.fac-nav-item:hover { background: var(--sidebar-hover, rgba(255,255,255,0.08)); color: #ffffff; }
.fac-nav-item.active { background: var(--sidebar-active, #2e4a87); color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }

.fac-sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid var(--sidebar-border, rgba(255,255,255,0.1));
  padding-top: 0.7rem;
}

/* ── Sidebar collapsed (default) ── */
.fac-sidebar .fac-sidebar-brand {
  padding: 1.2rem 0 1.2rem calc((68px - 36px) / 2);
  gap: 0.8rem;
  transition: padding 0.28s cubic-bezier(0.4,0,0.2,1);
}
.fac-sidebar .fac-sidebar-brand img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; display: block; }
.fac-sidebar:hover .fac-sidebar-brand {
  padding: 1.4rem 1.3rem 1.1rem 1.3rem;
}

.fac-sidebar .fac-sidebar-brand-text,
.fac-sidebar .fac-nav-label,
.fac-sidebar .fac-section-label {
  max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap;
  transition: max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
}
.fac-sidebar:hover .fac-sidebar-brand-text,
.fac-sidebar:hover .fac-nav-label,
.fac-sidebar:hover .fac-section-label {
  max-width: 220px; opacity: 1;
}

.fac-sidebar .fac-section-label {
  padding-left: 0; transition: max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, padding-left 0.28s;
}
.fac-sidebar:hover .fac-section-label { padding-left: 1.3rem; }

.fac-sidebar .fac-nav-item {
  display: flex; align-items: center;
  gap: 0;
  padding: 0.75rem 0;
  width: 100%; margin: 0.1rem 0;
  border-radius: 0;
  transition: background 0.15s, color 0.15s, width 0.28s cubic-bezier(0.4,0,0.2,1), margin 0.28s cubic-bezier(0.4,0,0.2,1), border-radius 0.28s cubic-bezier(0.4,0,0.2,1);
}
.fac-sidebar .fac-nav-item .fac-nav-icon {
  width: 68px; min-width: 68px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.fac-sidebar .fac-nav-item svg { width: 22px; height: 22px; flex-shrink: 0; }
.fac-sidebar:hover .fac-nav-item {
  width: calc(100% - 1.2rem);
  margin: 0.1rem 0.6rem;
  border-radius: 10px;
}

/* User chip at sidebar bottom */
.fac-user-chip {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--sidebar-border, rgba(255,255,255,0.1));
  margin-top: 0.4rem; cursor: pointer;
  transition: background 0.15s;
}
.fac-user-chip:hover { background: var(--sidebar-hover, rgba(255,255,255,0.08)); }

/* ── Main area ── */
.fac-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--main-bg, #f0f2f8);
}

.fac-topbar {
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background: var(--topbar-bg, #ffffff);
  border-bottom: 1px solid var(--topbar-border, #e5e8f0);
  flex-shrink: 0;
}

.fac-topbar-icon-btn {
  width: 54px; height: 54px; border-radius: 50%;
  border: none; background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  transition: background 0.15s, color 0.15s;
}
.fac-topbar-icon-btn:hover { background: var(--accent-light); color: var(--accent, #2e4a87); }

.fac-topbar-divider { width: 1px; height: 22px; background: var(--topbar-border, #e5e8f0); }

.fac-profile-chip {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 10px;
  transition: background 0.15s;
}
.fac-profile-chip:hover { background: var(--accent-light); }

.fac-profile-name { font-weight: 700; font-size: 1.05rem; color: var(--text-primary); margin: 0; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.fac-profile-role { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

.faculty-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.6rem 2rem;
  scrollbar-width: none;
  -ms-overflow-style: none;
  zoom: 1.18;
}
.faculty-main-content::-webkit-scrollbar { display: none; }

/* ── Legacy classes (kept for child component compatibility) ── */
.faculty-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  background: var(--card-bg, #fff);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.nav-brand img {
  width: 32px;
  height: auto;
}

.brand-text-full {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.nav-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex: 1;
}

.nav-link {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-link:hover {
  background: var(--accent-light);
  color: var(--accent, #2e4a87);
}

.nav-link.active {
  background: var(--accent, #2e4a87);
  color: #fff;
  border-color: var(--accent, #2e4a87);
}

.nav-user-section {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  justify-content: flex-end;
  flex: 1;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  cursor: pointer;
}

.prof-info {
  text-align: right;
}

.prof-role {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.prof-avatar {
  width: 34px;
  height: 34px;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: border-color 0.3s ease;
  overflow: hidden;
}

.prof-avatar.available { border-color: #00c853; animation: pulse-available 2s infinite; }
.prof-avatar.busy { border-color: #ffab00; animation: pulse-busy 2s infinite; }
.prof-avatar.unavailable { border-color: #ff1744; }

@keyframes pulse-available {
  0% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(0, 200, 83, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 200, 83, 0); }
}

@keyframes pulse-busy {
  0% { box-shadow: 0 0 0 0 rgba(255, 171, 0, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(255, 171, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 171, 0, 0); }
}

.faculty-main-content.fac-calendar-tab {
  padding: 1.2rem 1.2rem;
  overflow-y: auto;
}

.edit-profile-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.edit-profile-btn:hover {
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 12px;
}

.avatar-grid::-webkit-scrollbar {
  width: 5px;
}

.avatar-grid::-webkit-scrollbar-track {
  background: transparent;
}

.avatar-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.avatar-option {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-primary, #f0f2f8);
  overflow: hidden;
}

.avatar-option:hover {
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: var(--accent-main);
  box-shadow: 0 0 0 2px var(--accent-light);
}

.modal-label {
  display: block;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.profile-input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-family: inherit;
}

@media (max-width: 768px) {
  .faculty-navbar {
    padding: 0.6rem 1rem;
    justify-content: space-between;
  }
  .brand-text-full { display: none; }
  .nav-links { display: none; }
  .mobile-menu-btn { display: flex !important; }
  
  .desktop-only { display: none; }
  .prof-info { display: none; }
  .nav-logout-btn { display: none; }
  
  .faculty-main-content {
    padding: 1.5rem 1rem 5rem 1rem; /* Extra padding at bottom for nav */
  }
}

.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--card-bg, #fff);
  border-top: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  z-index: 1000;
  justify-content: space-around;
  align-items: center;
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .bottom-nav { display: flex; }
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.4rem;
  flex: 1;
  transition: all 0.2s;
}

.bottom-nav-item.active {
  color: var(--accent, #2e4a87);
}

.bottom-nav-text {
  font-size: 0.65rem;
  font-weight: 600;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 0.5rem;
  align-items: center;
  justify-content: center;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary, #f0f2f8);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  animation: slideInLeft 0.3s ease;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3rem;
}

.drawer-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.drawer-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  background: none;
  border: none;
  text-align: left;
  padding: 0.5rem 0;
  cursor: pointer;
}

.drawer-link.active {
  color: var(--accent, #2e4a87);
}

.mobile-profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary, #f0f2f8);
  border-radius: 16px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

.brand-text-mobile { display: none; }

/* ── prof-avatar (shared) ── */
.prof-avatar {
  width: 36px; height: 36px;
  background: transparent;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-secondary);
  transition: border-color 0.3s ease;
  overflow: hidden; flex-shrink: 0;
}
.prof-avatar.available { border-color: #00c853; animation: pulse-available 2s infinite; }
.prof-avatar.busy { border-color: #ffab00; animation: pulse-busy 2s infinite; }
.prof-avatar.unavailable { border-color: #ff1744; }
@keyframes pulse-available { 0% { box-shadow: 0 0 0 0 rgba(0,200,83,0.4); } 70% { box-shadow: 0 0 0 6px rgba(0,200,83,0); } 100% { box-shadow: 0 0 0 0 rgba(0,200,83,0); } }
@keyframes pulse-busy { 0% { box-shadow: 0 0 0 0 rgba(255,171,0,0.4); } 70% { box-shadow: 0 0 0 6px rgba(255,171,0,0); } 100% { box-shadow: 0 0 0 0 rgba(255,171,0,0); } }

/* ── Mobile topbar + drawer ── */
.fac-mobile-topbar {
  display: none;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: var(--nav-bg);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.mobile-menu-btn { display: none; background: none; border: none; color: var(--text-primary); cursor: pointer; padding: 0.4rem; align-items: center; justify-content: center; }
.mobile-drawer { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--bg-primary, #f0f2f8); z-index: 1001; display: flex; flex-direction: column; padding: 2rem; animation: drawerInFac 0.25s ease; }
@keyframes drawerInFac { from { transform: translateX(-100%); } to { transform: translateX(0); } }
.drawer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2.5rem; }
.drawer-links { display: flex; flex-direction: column; gap: 1.25rem; }
.drawer-link { font-family: 'Source Sans 3', sans-serif; font-size: 1.35rem; font-weight: 700; color: var(--text-primary); background: none; border: none; text-align: left; padding: 0.4rem 0; cursor: pointer; transition: color 0.12s ease; }
.drawer-link.active { color: var(--accent-main); }
.mobile-profile-section { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; background: var(--card-bg, #fff); border-radius: 12px; margin-bottom: 1.75rem; border: 1px solid var(--border-color); }

.bottom-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: var(--nav-bg); border-top: 1px solid var(--border-color); padding: 0.5rem 1rem; z-index: 1000; justify-content: space-around; align-items: center; }
.bottom-nav-item { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.4rem; flex: 1; transition: color 0.12s ease; font-family: 'Source Sans 3', sans-serif; }
.bottom-nav-item.active { color: var(--accent-main); }
.bottom-nav-text { font-size: 0.65rem; font-weight: 700; }

@media (max-width: 768px) {
  .fac-sidebar { display: none !important; }
  .fac-topbar { display: none !important; }
  .fac-mobile-topbar { display: flex; }
  .mobile-menu-btn { display: flex; }
  .bottom-nav { display: flex; }
  .faculty-main-content { padding: 1.2rem 1rem 5rem 1rem; }
}
`;

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('gcas_faculty_tab') || 'Dashboard');
  
  const handleActiveTabSet = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('gcas_faculty_tab', tab);
  };
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gcas_faculty_theme') === 'dark');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('gcas_faculty_text_size') || 'medium');
  const [isHighContrast, setIsHighContrast] = useState(() => localStorage.getItem('gcas_faculty_high_contrast') === 'true');
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({ reducedMotion: false, dyslexicFont: false });
  const [requestFilter, setRequestFilter] = useState('Pending');
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [profileStatus, setProfileStatus] = useState('Available');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [resetTimer, setResetTimer] = useState(null);
  const [oooDate, setOooDate] = useState('');
  const saveStatusDebounced = debouncedSave((uid, s) => updateFacultyStatus(uid, s), 500);
  const [profilePrefix, setProfilePrefix] = useState('');
  const [profileSuffix, setProfileSuffix] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [profileData, setProfileData] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsReadOnly, setTermsReadOnly] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('gcas_faculty_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('gcas_faculty_text_size', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('gcas_faculty_high_contrast', isHighContrast);
  }, [isHighContrast]);

  const { user } = useAuth();
  const navigate = useNavigate();

  // 20 clean, modern avatars using Lorelei style (no specific gender labels or cultural identifiers)
  // Faculty profile state

  useEffect(() => {
    if (!user) return;
    // Clear auth-page dark class from <html> so dashboard manages its own theme
    document.documentElement.className = '';
    // Ensure profile exists (handles pre-trigger users)
    ensureProfile();
    // Load profile for display name
    getProfile(user.id).then(p => {
      if (p) {
        setProfileName(p.full_name || user.displayName || 'Faculty Member');
        setProfileDept(p.department || 'General');
        setProfileAvatar(p.avatar_url || user.avatarUrl || null);
        setProfileStatus(p.status || 'Active');
        setProfilePrefix(p.name_prefix || '');
        setProfileSuffix(p.name_suffix || '');
        setProfileData(p);

        // #51: Load accessibility prefs
        if (p.accessibility_prefs) {
          setAccessibilityPrefs(p.accessibility_prefs);
        }

        if (!p.tnc_accepted && !localStorage.getItem(`gcas_tnc_${user.id}`)) { setTermsReadOnly(false); setShowTerms(true); }
      }
    });

    return () => {};
  }, [user]);

  // Notification Listener for unread count
  useEffect(() => {
    if (!user) return;
    
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();

    const channel = supabase
      .channel('fac-notif-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        fetchUnread();
      })
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const openProfileModal = () => setShowProfileModal(true);

  const handleProfileSaved = (saved) => {
    setProfileName(saved.full_name);
    setProfileAvatar(saved.avatar_url);
    setProfilePrefix(saved.name_prefix || '');
    setProfileSuffix(saved.name_suffix || '');
    setProfileDept(saved.department || profileDept);
    setProfileData(prev => ({ ...prev, ...saved }));
    setShowProfileModal(false);
  };

  const updateAccessibilityPref = async (key, value) => {
    const newPrefs = { ...accessibilityPrefs, [key]: value };
    setAccessibilityPrefs(newPrefs);
    
    // Save to DB using the Spread updateProfile
    const { updateProfile } = await import('../../supabase/api');
    await updateProfile(user.id, {
      accessibility_prefs: newPrefs
    });
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    setLoggingOut(true);
    localStorage.removeItem('gcas_faculty_tab');
    sessionStorage.removeItem('admin_bypass');
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleTabChange = (tab, filter = null) => {
    setActiveTab(tab);
    if (filter) setRequestFilter(filter);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <FacultyDashboardContent onTabChange={handleTabChange} onStatusChange={setProfileStatus} />;
      case 'Calendar':
        return <FacultyCalendarPage onTabChange={handleTabChange} />;
      case 'Schedule':
        return <FacultyScheduleContent />;
      case 'Requests':
        return <FacultyRequestsContent initialFilter={requestFilter} />;
      case 'About':
        return <FacultyAboutContent />;
      case 'Settings':
        return (
          <SharedSettingsContent
            role="faculty"
            profileData={profileData}
            userId={user?.id}
            userEmail={user?.email}
            isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
            textSize={textSize} setTextSize={setTextSize}
            isHighContrast={isHighContrast} setIsHighContrast={setIsHighContrast}
            accessibilityPrefs={accessibilityPrefs} updateAccessibilityPref={updateAccessibilityPref}
            onProfileSaved={handleProfileSaved}
          />
        );
      case 'Admin':
        return <AdminContent />;
      default:
        return <FacultyDashboardContent onTabChange={handleTabChange} onStatusChange={setProfileStatus} />;
    }
  };

  const navItems = [
    { id: 'Dashboard', icon: Layout },
    { id: 'Calendar', icon: CalendarDays },
    { id: 'Requests', icon: Clock },
    { id: 'About', icon: Info },
    ...(user?.id === 'admin-bypass' ? [{ id: 'Admin', icon: ShieldCheck }] : []),
  ];

  const bottomNavItems = [
    { id: 'Settings', icon: Settings },
  ];

  return (
    <div className={`faculty-dashboard-wrapper ${isDarkMode ? 'dark' : ''} ${isHighContrast ? 'high-contrast' : ''} text-${textSize} ${accessibilityPrefs.reducedMotion ? 'reduced-motion' : ''} ${accessibilityPrefs.dyslexicFont ? 'dyslexic-font' : ''}`}>
      <style>{facultyDashStyles}</style>

      {/* ── Sidebar ── */}
      <aside className="fac-sidebar">
        <div className="fac-sidebar-brand">
          <img src={logo} alt="FACS" />
          <div className="fac-sidebar-brand-text">
            <span className="fac-sidebar-brand-name">FACS</span>
            <span className="fac-sidebar-brand-sub">Faculty &amp; Consultation System</span>
          </div>
        </div>

        <div className="fac-section-label">Faculty Workplace</div>

        {navItems.map(({ id, icon: Icon }) => (
          <button
            key={id}
            data-label={id}
            className={`fac-nav-item ${activeTab === id ? 'active' : ''}`}
            onClick={() => handleActiveTabSet(id)}
          >
            <span className="fac-nav-icon"><Icon size={18} /></span>
            <span className="fac-nav-label">{id}</span>
          </button>
        ))}

        <div className="fac-sidebar-bottom">
          <button data-label="Terms & Policy" className="fac-nav-item" onClick={() => { setTermsReadOnly(true); setShowTerms(true); }}>
            <span className="fac-nav-icon"><FileText size={18} /></span>
            <span className="fac-nav-label">Terms &amp; Policy</span>
          </button>
          <button data-label="Settings" className={`fac-nav-item ${activeTab === 'Settings' ? 'active' : ''}`} onClick={() => handleActiveTabSet('Settings')}>
            <span className="fac-nav-icon"><Settings size={18} /></span>
            <span className="fac-nav-label">Settings</span>
          </button>
          <button data-label="Log Out" className="fac-nav-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
            <span className="fac-nav-icon"><LogOut size={18} /></span>
            <span className="fac-nav-label">Log Out</span>
          </button>
        </div>

      </aside>

      {/* ── Main area ── */}
      <div className="fac-main-area">

        {/* Desktop topbar */}
        <div className="fac-topbar">
          <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            {activeTab === 'Terms' ? 'Terms & Policy' : activeTab}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button className="fac-topbar-icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)} title="Notifications" style={{ position: 'relative' }}>
              <Bell size={24} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: 'white', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '50%', fontWeight: 700 }}>{unreadCount}</span>
              )}
            </button>
            <button className="fac-topbar-icon-btn" onClick={() => setIsDarkMode(!isDarkMode)} title="Toggle theme">
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* Status pill in topbar */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsStatusOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', padding: '0.55rem 1.1rem', borderRadius: 20, border: '1.5px solid var(--topbar-border, #e5e8f0)', background: 'var(--card-bg, #fff)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
              >
                <span style={{ width: 11, height: 11, borderRadius: '50%', flexShrink: 0, display: 'inline-block', background: profileStatus === 'Available' ? '#00c853' : profileStatus === 'Busy' ? '#ffab00' : profileStatus === 'In a meeting' ? '#ff9800' : '#616161' }} />
                {profileStatus}
                <ChevronDown size={16} />
              </button>

              {isStatusOpen && (
                <>
                  {/* backdrop */}
                  <div onClick={() => setIsStatusOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 299 }} />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    background: 'var(--card-bg,#fff)', border: '1.5px solid var(--border-color,#e5e8f0)',
                    borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                    zIndex: 300, width: 290, padding: '1rem 1.1rem 1rem',
                    fontFamily: 'inherit',
                  }}>
                    {/* Students see */}
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Students currently see</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: profileStatus === 'Available' ? '#00c853' : profileStatus === 'Busy' ? '#ffab00' : profileStatus === 'In a meeting' ? '#ff9800' : '#616161', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profileStatus}</span>
                    </div>

                    {/* Status options */}
                    <p style={{ margin: '0 0 0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Your status (today only)</p>
                    {[
                      { label: 'Available',    color: '#00c853' },
                      { label: 'Busy',         color: '#ff1744' },
                      { label: 'In a meeting', color: '#ff9800' },
                      { label: 'Out of office',color: '#616161' },
                    ].map(opt => (
                      <div key={opt.label}
                        onClick={() => { setProfileStatus(opt.label); saveStatusDebounced(user?.id, opt.label); toast.success(`Status set to ${opt.label}`); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.45rem 0.3rem', cursor: 'pointer', borderRadius: 8, transition: 'background 0.12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary,#f0f2f8)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: opt.color, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{opt.label}</span>
                        {profileStatus === opt.label && <span style={{ fontSize: '0.8rem', color: opt.color, fontWeight: 700 }}>✓</span>}
                      </div>
                    ))}

                    {/* Reset timer */}
                    <div style={{ height: 1, background: 'var(--border-color,#e5e8f0)', margin: '0.8rem 0' }} />
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Reset to available after</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.9rem' }}>
                      {['End of day', '30 min', '1 hour', '2 hours'].map(t => (
                        <button key={t} onClick={() => setResetTimer(resetTimer === t ? null : t)}
                          style={{ padding: '0.55rem 0.5rem', borderRadius: 10, border: '1.5px solid var(--border-color,#e5e8f0)', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: resetTimer === t ? '#1a2d5a' : 'transparent', color: resetTimer === t ? '#fff' : 'var(--text-primary)' }}
                        >{t}</button>
                      ))}
                    </div>

                    {/* Out of office */}
                    <p style={{ margin: '0 0 0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Away for several days</p>
                    <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 500 }}>Out of office through</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.9rem' }}>
                      <input type="date" value={oooDate} onChange={e => setOooDate(e.target.value)}
                        style={{ flex: 1, padding: '0.55rem 0.7rem', borderRadius: 9, border: '1.5px solid var(--border-color,#e5e8f0)', fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text-primary)', background: 'var(--bg-primary,#f0f2f8)', outline: 'none' }}
                      />
                      <button onClick={() => { if (oooDate) { setProfileStatus('Out of office'); saveStatusDebounced(user?.id, 'Out of office'); toast.success('Out of office set'); } }}
                        style={{ padding: '0.55rem 0.9rem', borderRadius: 9, border: '1.5px solid var(--border-color,#e5e8f0)', background: 'transparent', fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-primary)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-primary,#f0f2f8)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >Set</button>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      Status only affects today. Future dates follow your weekly hours and blocked dates.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="fac-topbar-divider" />
            <div className="fac-profile-chip" onClick={openProfileModal} title="Edit Profile">
              <div style={{ lineHeight: 1.2 }}>
                <p className="fac-profile-name">{profilePrefix ? `${profilePrefix} ` : ''}{profileName || 'Faculty'}{profileSuffix ? `, ${profileSuffix}` : ''}</p>
                <p className="fac-profile-role">{profileDept}</p>
              </div>
              <div className={`prof-avatar ${profileStatus?.toLowerCase()}`}>
                {profileAvatar ? <img src={profileAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} />}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile topbar */}
        <div className="fac-mobile-topbar">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)} style={{ display: 'flex' }}>
            <Menu size={24} />
          </button>
          <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--accent, #2e4a87)' }}>FACS</span>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button className="fac-topbar-icon-btn" onClick={() => setIsNotifOpen(!isNotifOpen)} style={{ position: 'relative' }}>
              <Bell size={24} />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 2, right: 2, background: '#ef4444', color: 'white', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '50%', fontWeight: 700 }}>{unreadCount}</span>}
            </button>
            <button className="fac-topbar-icon-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <main className={`faculty-main-content${activeTab === 'Calendar' ? ' fac-calendar-tab' : ''}`}>
          {renderContent()}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="bottom-nav">
        {[{ id: 'Dashboard', icon: Layout }, { id: 'Calendar', icon: CalendarDays }, { id: 'Requests', icon: Clock }].map((item) => (
          <button key={item.id} className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => handleActiveTabSet(item.id)}>
            <item.icon size={20} />
            <span className="bottom-nav-text">{item.id}</span>
          </button>
        ))}
      </div>

      <NotificationCenter
        userId={user?.id}
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        role="Faculty"
      />

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSaved={handleProfileSaved}
        role="faculty"
        userId={user?.id}
        initialData={profileData}
        forceComplete={false}
      />

      {showTerms && user?.id && user.id !== 'admin-bypass' && (
        <TermsModal userId={user.id} readOnly={termsReadOnly} onAccepted={() => setShowTerms(false)} />
      )}

      {showLogoutConfirm && (
        <LogoutConfirm
          onConfirm={confirmLogout}
          onCancel={() => !loggingOut && setShowLogoutConfirm(false)}
          loading={loggingOut}
        />
      )}

      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="drawer-header">
            <span style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--accent, #2e4a87)' }}>FACS</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => setIsMobileMenuOpen(false)}>
              <CloseIcon size={28} />
            </button>
          </div>
          <div className="mobile-profile-section">
            <div className={`prof-avatar ${profileStatus?.toLowerCase()}`} style={{ width: '52px', height: '52px' }}>
              {profileAvatar ? <img src={profileAvatar} alt="avatar" style={{ width: '100%' }} /> : <User size={26} />}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{profileName}</p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{profileDept}</p>
            </div>
          </div>
          <div className="drawer-links">
            {navItems.map(({ id, icon: Icon }) => (
              <button key={id} className={`drawer-link ${activeTab === id ? 'active' : ''}`} onClick={() => { handleActiveTabSet(id); setIsMobileMenuOpen(false); }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Icon size={22} /><span>{id}</span></div>
              </button>
            ))}
            <button className="drawer-link" onClick={() => { setIsDarkMode(!isDarkMode); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>
            <button className="drawer-link" onClick={() => { handleActiveTabSet('Settings'); setIsMobileMenuOpen(false); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><Settings size={22} /><span>Settings</span></div>
            </button>
            <button className="drawer-link" onClick={() => { openProfileModal(); setIsMobileMenuOpen(false); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><User size={22} /><span>Edit Profile</span></div>
            </button>
            <button className="drawer-link" onClick={() => { setTermsReadOnly(true); setShowTerms(true); setIsMobileMenuOpen(false); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><FileText size={22} /><span>Terms &amp; Policy</span></div>
            </button>
          </div>
          <div style={{ marginTop: 'auto', padding: '2rem 0', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={handleLogout}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #ef4444',
                background: 'transparent',
                color: '#ef4444',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
