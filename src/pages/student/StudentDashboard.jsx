import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home, LayoutDashboard, Users, Calendar, CalendarDays, Info,
  User, Settings, Bell, Menu, X as CloseIcon,
  LogOut, FileText, ChevronRight, BookOpen
} from 'lucide-react';
import DashboardContent from './DashboardContent';
import FacultyContent from './FacultyContent';
import AppointmentsContent from './AppointmentsContent';
import AboutContent from '../faculty/FacultyAboutContent';
import ArchiveContent from '../shared/components/ArchiveContent';
import CalendarPage from './CalendarPage';
import WelcomeContent from './WelcomeContent';
import SharedSettingsContent from '../../components/SharedSettingsContent';
import logo from '../logo.png';
import { useAuth } from '../../hooks/useAuth';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { getProfile, updateProfile } from '../../supabase/api';
import { subscribeToOwnProfile } from '../../supabase/realtime';
import { useNavigate } from 'react-router-dom';
import NotificationCenter from '../../components/NotificationCenter';
import ProfileEditModal from '../../components/ProfileEditModal';
import TermsModal from '../../components/TermsModal';
import LogoutConfirm from '../../components/LogoutConfirm';
import ErrorBoundary from '../../components/ErrorBoundary';

/* ─────────────────────────────────────────────
   Design tokens + shell styles
───────────────────────────────────────────── */
const dashStyles = `
/* ── Token bridge ── */
.sd-root {
  --sidebar-bg:      #00004e;
  --sidebar-hover:   rgba(255,255,255,0.07);
  --sidebar-active:  #1e3a6e;
  --sidebar-text:    rgba(255,255,255,0.80);
  --sidebar-label:   rgba(255,255,255,0.38);
  --sidebar-border:  rgba(255,255,255,0.1);
  --sidebar-width:   270px;

  --main-bg:         #f0f2f8;
  --topbar-bg:       #ffffff;
  --topbar-border:   #e5e8f0;
  --card-bg:         #ffffff;
  --card-border:     #e5e8f0;
  --card-shadow:     0 1px 8px rgba(0,0,0,0.06);

  --text-primary:    #1a2d5a;
  --text-secondary:  #374151;
  --text-muted:      #6b7280;
  --accent:          #2e4a87;
  --accent-light:    #eef1fa;
  --accent-orange:   #2e4a87;

  --border-color:    #e5e8f0;
  --bg-primary:      #f0f2f8;
  --bg-secondary:    #ffffff;

  --approved-color:  #16a34a;
  --pending-color:   #d97706;
  --history-color:   #6b7280;

  --shadow: 0 1px 8px rgba(0,0,0,0.06);
}


/* Accessibility */
.sd-root.text-small  { font-size: 0.85rem !important; }
.sd-root.text-medium { font-size: 1rem !important; }
.sd-root.text-large  { font-size: 1.15rem !important; }
.sd-root.reduced-motion * { animation: none !important; transition: none !important; }
@font-face {
  font-family: 'OpenDyslexic';
  src: url('https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/OpenDyslexic-Regular.otf');
}
.sd-root.dyslexic-font,
.sd-root.dyslexic-font * { font-family: 'OpenDyslexic', sans-serif !important; }

/* ── Root shell ── */
.sd-root {
  position: fixed; inset: 0;
  display: flex;
  background: var(--main-bg);
  font-family: 'Outfit', 'Inter', sans-serif;
  color: var(--text-primary);
  overflow: hidden;
  z-index: 50;
}

/* ── Sidebar ── */
.sd-sidebar {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  width: 68px;
  background: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  padding: 0;
  transition: width 0.22s cubic-bezier(0.4,0,0.2,1);
}
.sd-sidebar:hover { width: 270px; }
.sd-sidebar::-webkit-scrollbar { display: none; }

/* ── Sidebar collapsed (default) ── */
.sd-sidebar .sd-brand {
  padding: 1.2rem 0 1.2rem calc((68px - 36px) / 2); gap: 0.8rem;
  transition: padding 0.28s cubic-bezier(0.4,0,0.2,1);
}
.sd-sidebar .sd-brand img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; display: block; }
.sd-sidebar:hover .sd-brand { padding: 1.4rem 1.3rem 1.1rem 1.3rem; }

.sd-sidebar .sd-brand-text,
.sd-sidebar .sd-nav-label,
.sd-sidebar .sd-section-label {
  max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap;
  transition: max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
}
.sd-sidebar:hover .sd-brand-text,
.sd-sidebar:hover .sd-nav-label,
.sd-sidebar:hover .sd-section-label {
  max-width: 220px; opacity: 1;
}

.sd-sidebar .sd-section-label {
  padding-left: 0;
  transition: max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease, padding-left 0.28s;
}
.sd-sidebar:hover .sd-section-label { padding-left: 1.3rem; }

.sd-sidebar .sd-nav-item {
  display: flex; align-items: center;
  gap: 0;
  padding: 0.75rem 0;
  width: 100%; margin: 0.1rem 0;
  border-radius: 0;
  transition: background 0.15s, color 0.15s, width 0.28s cubic-bezier(0.4,0,0.2,1), margin 0.28s cubic-bezier(0.4,0,0.2,1), border-radius 0.28s cubic-bezier(0.4,0,0.2,1);
}
.sd-sidebar .sd-nav-item .sd-nav-icon {
  width: 68px; min-width: 68px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.sd-sidebar .sd-nav-item svg { width: 22px; height: 22px; flex-shrink: 0; }
.sd-sidebar:hover .sd-nav-item {
  width: calc(100% - 1.2rem);
  margin: 0.1rem 0.6rem;
  border-radius: 10px;
}

.sd-sidebar .sd-user-chip {
  padding-left: calc((68px - 34px) / 2);
  transition: padding-left 0.28s cubic-bezier(0.4,0,0.2,1);
}
.sd-sidebar:hover .sd-user-chip { padding-left: 1rem; }
.sd-sidebar .sd-user-chip-text {
  max-width: 0; opacity: 0; overflow: hidden; white-space: nowrap;
  transition: max-width 0.28s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease;
}
.sd-sidebar:hover .sd-user-chip-text { max-width: 180px; opacity: 1; }

/* Brand row */
.sd-brand {
  display: flex; align-items: center; gap: 0.8rem;
  padding: 1.6rem 1.3rem 1.2rem 1.3rem;
  border-bottom: 1px solid var(--sidebar-border);
  margin-bottom: 0.7rem;
}
.sd-brand img { width: 38px; height: auto; filter: none; opacity: 1; }
.sd-brand-name {
  font-weight: 900; font-size: 1.55rem; color: #ffffff;
  letter-spacing: -0.3px; line-height: 1;
}
.sd-brand-sub {
  font-size: 0.68rem; color: rgba(255,255,255,0.45);
  font-weight: 500; letter-spacing: 0.02em; line-height: 1.2;
  display: block; margin-top: 2px;
}

/* Section label */
.sd-section-label {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--sidebar-label);
  padding: 0.7rem 1.3rem 0.35rem 1.3rem;
}

/* Nav items */
.sd-nav-item {
  display: flex; align-items: center; gap: 0.9rem;
  padding: 0.75rem 1.2rem; margin: 0.1rem 0.6rem;
  border-radius: 10px; border: none;
  background: transparent; color: var(--sidebar-text);
  font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 1.05rem;
  cursor: pointer; transition: background 0.15s, color 0.15s;
  text-align: left; width: calc(100% - 1.2rem);
}
.sd-nav-item:hover { background: var(--sidebar-hover); color: #ffffff; }
.sd-nav-item.active {
  background: var(--sidebar-active); color: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.sd-nav-item svg { flex-shrink: 0; opacity: 0.85; }
.sd-nav-item.active svg { opacity: 1; }

/* Sidebar bottom */
.sd-sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid var(--sidebar-border);
  padding: 0.7rem 0 0 0;
}

/* User profile chip at bottom of sidebar */
.sd-user-chip {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--sidebar-border);
  margin-top: 0.4rem; cursor: pointer;
  transition: background 0.15s;
}
.sd-user-chip:hover { background: var(--sidebar-hover); }
.sd-user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--avatar-color, rgba(255,255,255,0.15));
  border: 2px solid rgba(255,255,255,0.35);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 0.78rem;
  overflow: hidden; flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.sd-user-name {
  font-size: 0.8rem; font-weight: 700; color: #ffffff;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 130px; margin: 0;
}
.sd-user-role { font-size: 0.65rem; color: rgba(255,255,255,0.45); margin: 0; }

/* ── Main area ── */
.sd-main {
  flex: 1; display: flex; flex-direction: column; overflow: hidden;
  padding-left: 68px;
}

/* Topbar */
.sd-topbar {
  height: auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.4rem 2rem;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--topbar-border);
  flex-shrink: 0;
  gap: 0.8rem;
  transition: padding-left 0.22s cubic-bezier(0.4,0,0.2,1);
}
.sd-sidebar:hover ~ .sd-main .sd-topbar {
  padding-left: calc(270px - 68px + 2rem);
}

.sd-topbar-page-title {
  font-weight: 800; font-size: 1.5rem; color: var(--text-primary);
  flex: 1;
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.sd-topbar-actions {
  display: flex; align-items: center; gap: 0.5rem;
}

.sd-icon-btn {
  width: 54px; height: 54px; border-radius: 50%;
  border: none; background: transparent;
  color: var(--text-muted); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  position: relative; transition: background 0.15s, color 0.15s;
}
.sd-icon-btn:hover { background: var(--accent-light); color: var(--accent); }

.sd-notif-badge {
  position: absolute; top: 2px; right: 2px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #ef4444; color: #fff;
  font-size: 0.5rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

.sd-topbar-divider { width: 1px; height: 22px; background: var(--topbar-border); }

/* Profile chip in topbar */
.sd-topbar-profile {
  display: flex; align-items: center; gap: 0.6rem;
  cursor: pointer; padding: 0.3rem 0.5rem;
  border-radius: 9px; transition: background 0.15s;
}
.sd-topbar-profile:hover { background: var(--accent-light); }
.sd-topbar-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid var(--accent);
  background: var(--accent-light); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.78rem; overflow: hidden; flex-shrink: 0;
}
.sd-topbar-name { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0; white-space: nowrap; max-width: 200px; overflow: hidden; text-overflow: ellipsis; }
.sd-topbar-sub  { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

/* ── Content ── */
.sd-content {
  flex: 1; min-height: 0; overflow-y: auto; padding: 1.6rem 2rem;
  scrollbar-width: none; -ms-overflow-style: none;
  background-image: linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.72)), url('/BG.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  zoom: 1.18;
}
.sd-content::-webkit-scrollbar { display: none; }

/* ── Mobile topbar (hidden on desktop) ── */
.sd-mobile-bar {
  display: none; align-items: center; justify-content: space-between;
  padding: 0.18rem 0.75rem;
  background: var(--topbar-bg); border-bottom: 1px solid var(--topbar-border);
  flex-shrink: 0;
}
.sd-mobile-brand { font-weight: 900; font-size: 0.88rem; color: var(--accent); }
@media (max-width: 768px) {
  .sd-mobile-bar .sd-icon-btn { width: 34px; height: 34px; }
  .sd-notif-badge { top: 0px; right: 0px; width: 14px; height: 14px; font-size: 0.52rem; }
}

/* ── Bottom nav (mobile) ── */
.sd-bottom-nav {
  display: none;
  flex-shrink: 0;
  margin: 0 12px calc(12px + env(safe-area-inset-bottom, 0px)) 12px;
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: 22px;
  padding: 0.4rem 0.5rem;
  justify-content: space-around; align-items: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
}
.sd-bottom-nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 0.15rem;
  background: none; border: none; color: var(--text-muted);
  cursor: pointer; padding: 0.4rem; flex: 1;
  transition: color 0.2s; font-family: 'Outfit', sans-serif;
}
.sd-bottom-nav-item.active { color: var(--accent); }
.sd-bottom-nav-text { font-size: 0.62rem; font-weight: 600; }

/* ── Mobile drawer ── */
@keyframes sdOverlayIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes sdOverlayOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes sdPanelIn    { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes sdPanelOut   { from { transform: translateX(0); } to { transform: translateX(-100%); } }
.sd-drawer-overlay.closing { animation: sdOverlayOut 0.28s ease forwards; }
.sd-drawer.closing { animation: sdPanelOut 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }

.sd-drawer-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(3px);
  z-index: 2000;
  animation: sdOverlayIn 0.2s ease;
}
.sd-drawer {
  position: fixed; top: 0; left: 0; bottom: 0;
  width: 300px; max-width: 82vw;
  background: var(--sidebar-bg);
  z-index: 2001;
  display: flex; flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto; scrollbar-width: none;
  animation: sdPanelIn 0.28s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 4px 0 24px rgba(0,0,0,0.35);
}
.sd-drawer::-webkit-scrollbar { display: none; }
.sd-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2rem;
}

/* ── Responsive ── */

/* iPad landscape + small laptops (1024px) */
@media (max-width: 1024px) {
  .sd-content { padding: 1.2rem 1.5rem; }
}

/* iPad portrait (768px) */
@media (max-width: 768px) {
  .sd-sidebar { display: none !important; }
  .sd-topbar  { display: none !important; }
  .sd-main    { padding-left: 0 !important; }
  .sd-mobile-bar { display: flex !important; }
  .sd-bottom-nav { display: flex !important; }
  .sd-content { padding: 1rem; zoom: 1; }
}

/* iPhone (430px and below) */
@media (max-width: 430px) {
  .sd-content { padding: 0.8rem 0.75rem; zoom: 1; }
}

/* Large monitors (1440px+) */
@media (min-width: 1440px) {
  .sd-content { padding: 2rem 2.5rem; }
}

/* ── Modal overlay (shared) ── */
.sd-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  z-index: 3000;
}
.sd-modal-card {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-radius: 16px; padding: 1.6rem;
  width: 95%; max-width: 440px; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
`;


const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('gcas_student_tab') || 'Welcome');
  const [facultyMountKey, setFacultyMountKey] = useState(0);
  const [initialFacultyId, setInitialFacultyId] = useState(null);
  const [textSize, setTextSize] = useState(() => localStorage.getItem('gcas_student_text_size') || 'medium');
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({ reducedMotion: false, dyslexicFont: false });
  const [initialFilter, setInitialFilter] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [focusAppointmentId, setFocusAppointmentId] = useState(null);
  const [focusCalendarDate, setFocusCalendarDate] = useState(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsReadOnly, setTermsReadOnly] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [realName, setRealName] = useState('');
  const [realAvatar, setRealAvatar] = useState('');
  const [profilePrefix, setProfilePrefix] = useState('');
  const [profileSuffix, setProfileSuffix] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => { localStorage.setItem('gcas_student_text_size', textSize); }, [textSize]);
  useEffect(() => { localStorage.removeItem('gcas_student_theme'); }, []);
  useEffect(() => { localStorage.removeItem('gcas_student_high_contrast'); }, []);

  useEffect(() => {
    window.history.pushState({ dashboardGuard: true }, '');
    const onPop = () => {
      window.history.pushState({ dashboardGuard: true }, '');
      setShowLogoutConfirm(true);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (!user) return;
    document.documentElement.className = '';
    ensureProfile();
    getProfile(user.id).then(p => {
      if (p) {
        setRealName(p.full_name || 'Student');
        setRealAvatar(p.avatar_url || null);
        setProfilePrefix(p.name_prefix || '');
        setProfileSuffix(p.name_suffix || '');
        setProfileData(p);
        if (p.avatar_color) {
          setAvatarColor(p.avatar_color);
          localStorage.setItem(`askademic_avatar_color_${user.id}`, p.avatar_color);
        }
        if (p.accessibility_prefs) setAccessibilityPrefs(p.accessibility_prefs);
        if (!p.tnc_accepted && !localStorage.getItem(`gcas_tnc_${user.id}`)) {
          setTermsReadOnly(false); setShowTerms(true);
        }
        if (/^\d+$/.test(p.full_name)) setShowProfileModal(true);
      }
    });

    // Keep profile UI in sync across tabs/devices
    const unsubProfile = subscribeToOwnProfile(user.id, (p) => {
      setRealName(p.full_name || 'Student');
      setRealAvatar(p.avatar_url || null);
      setProfilePrefix(p.name_prefix || '');
      setProfileSuffix(p.name_suffix || '');
      setProfileData(prev => ({ ...prev, ...p }));
      if (p.avatar_color) {
        setAvatarColor(p.avatar_color);
        localStorage.setItem(`askademic_avatar_color_${user.id}`, p.avatar_color);
      }
    });
    return () => unsubProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();
    const channel = supabase.channel('notif-count-stu')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleProfileSaved = (saved) => {
    setRealName(saved.full_name);
    setRealAvatar(saved.avatar_url);
    setProfilePrefix(saved.name_prefix || '');
    setProfileSuffix(saved.name_suffix || '');
    setProfileData(prev => ({ ...prev, ...saved }));
    if (saved.avatar_color) {
      setAvatarColor(saved.avatar_color);
      if (user?.id) localStorage.setItem(`askademic_avatar_color_${user.id}`, saved.avatar_color);
    }
    setShowProfileModal(false);
  };

  const handleProfileRollback = () => {
    if (!profileData) return;
    setRealName(profileData.full_name || '');
    setRealAvatar(profileData.avatar_url || null);
    setProfilePrefix(profileData.name_prefix || '');
    setProfileSuffix(profileData.name_suffix || '');
    if (profileData.avatar_color) {
      setAvatarColor(profileData.avatar_color);
      if (user?.id) localStorage.setItem(`askademic_avatar_color_${user.id}`, profileData.avatar_color);
    }
  };

  const updateAccessibilityPref = async (key, value) => {
    const newPrefs = { ...accessibilityPrefs, [key]: value };
    setAccessibilityPrefs(newPrefs);
    await updateProfile(user.id, { accessibility_prefs: newPrefs });
  };

  const handleTabChange = (tab, filter = 'All', facultyIdOrDate = null) => {
    if (tab === 'Faculty') { setFacultyMountKey(k => k + 1); setInitialFacultyId(facultyIdOrDate); }
    if (tab === 'Calendar' && facultyIdOrDate) setFocusCalendarDate(facultyIdOrDate);
    setInitialFilter(filter); setActiveTab(tab);
    localStorage.setItem('gcas_student_tab', tab);
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('gcas_student_tab', tab);
  };

  const closeDrawer = () => {
    setIsDrawerClosing(true);
    setTimeout(() => { setIsMobileMenuOpen(false); setIsDrawerClosing(false); }, 280);
  };

  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    setLoggingOut(true);
    localStorage.removeItem('gcas_student_tab');
    localStorage.removeItem('gcas_faculty_tab');
    localStorage.removeItem('askademic_last_uid');
    sessionStorage.removeItem('admin_bypass');
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayName = realName || 'Student';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_PALETTE = ['#2e4a87','#7c3aed','#0891b2','#0d9488','#d97706','#db2777','#059669','#dc2626'];
  const [avatarColor, setAvatarColor] = useState(null);
  useEffect(() => {
    if (user?.id && !avatarColor) {
      const stored = localStorage.getItem(`askademic_avatar_color_${user.id}`);
      if (stored) setAvatarColor(stored);
    }
  }, [user?.id]);
  const resolvedAvatarColor = avatarColor || AVATAR_PALETTE[(displayName.charCodeAt(0) || 0) % AVATAR_PALETTE.length];

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  const formatFirstName = (name) => {
    if (!name) return 'there';
    if (name.includes(',')) {
      const [, rest = ''] = name.split(', ');
      return rest.trim().split(' ')[0];
    }
    return name.trim().split(' ')[0];
  };

  const navItems = [
    { id: 'Welcome',      icon: Home,          label: 'Welcome' },
    { id: 'Dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'Calendar',     icon: CalendarDays,  label: 'Calendar' },
    { id: 'Faculty',      icon: Users,         label: 'Faculty' },
    { id: 'Appointments', icon: Calendar,      label: 'Appointments' },
    { id: 'About',        icon: Info,          label: 'About' },
  ];

  const pageTitles = {
    Welcome: 'Welcome', Dashboard: 'Dashboard', Calendar: 'Calendar',
    Faculty: 'Faculty Directory', Appointments: 'My Consultation Appointments',
    About: 'About Askademic', Settings: 'Settings', Archive: 'Archive',
  };

  const rootClass = [
    'sd-root',
    `text-${textSize}`,
    accessibilityPrefs.reducedMotion ? 'reduced-motion' : '',
    accessibilityPrefs.dyslexicFont ? 'dyslexic-font' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <style>{dashStyles}</style>
      <div className={rootClass}>

        {/* ── Sidebar ── */}
        <aside className="sd-sidebar">
          {/* Brand */}
          <div className="sd-brand">
            <img src={logo} alt="Askademic" />
            <div className="sd-brand-text">
              <span className="sd-brand-name">Askademic</span>
              <span className="sd-brand-sub">Askademic</span>
            </div>
          </div>

          {/* Section label */}
          <div className="sd-section-label">Student Workplace</div>

          {/* Nav items */}
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              data-label={label}
              className={`sd-nav-item${activeTab === id ? ' active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span className="sd-nav-icon"><Icon size={17} /></span>
              <span className="sd-nav-label">{label}</span>
            </button>
          ))}

          {/* Bottom section */}
          <div className="sd-sidebar-bottom">
            <button data-label="Terms & Policy" className="sd-nav-item" onClick={() => { setTermsReadOnly(true); setShowTerms(true); }}>
              <span className="sd-nav-icon"><FileText size={17} /></span>
              <span className="sd-nav-label"> Terms &amp; Policy</span>
            </button>
            <button data-label="Settings" className={`sd-nav-item${activeTab === 'Settings' ? ' active' : ''}`} onClick={() => setTab('Settings')}>
              <span className="sd-nav-icon"><Settings size={17} /></span>
              <span className="sd-nav-label"> Settings</span>
            </button>
            <button data-label="Log Out" className="sd-nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
              <span className="sd-nav-icon"><LogOut size={17} /></span>
              <span className="sd-nav-label"> Log Out</span>
            </button>
          </div>

          {/* User chip */}
          <div className="sd-user-chip" onClick={() => setShowProfileModal(true)}>
            <div className="sd-user-avatar" style={{ '--avatar-color': resolvedAvatarColor }}>
              {initials}
            </div>
            <div className="sd-user-chip-text" style={{ minWidth: 0 }}>
              <p className="sd-user-name">
                {profilePrefix ? `${profilePrefix} ` : ''}{displayName}{profileSuffix ? `, ${profileSuffix}` : ''}
              </p>
              <p className="sd-user-role">BSCS Student</p>
            </div>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div className="sd-main">

          {/* Desktop topbar */}
          <div className="sd-topbar">
            <div className="sd-topbar-page-title">
              <div>
                {activeTab === 'Dashboard'
                  ? `${getGreeting()}, ${formatFirstName(realName)}!`
                  : (pageTitles[activeTab] || activeTab)
                }
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '2px' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </div>
            </div>
            <div className="sd-topbar-actions">
              {/* Notification bell */}
              <button className="sd-icon-btn" onClick={() => setIsNotifOpen(v => !v)} title="Notifications">
                <Bell size={24} />
                {unreadCount > 0 && <span className="sd-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
            </div>
          </div>

          {/* Mobile topbar */}
          <div className="sd-mobile-bar">
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={18} />
            </button>
            <span className="sd-mobile-brand">Askademic</span>
            <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
              <button className="sd-icon-btn" onClick={() => setIsNotifOpen(v => !v)}>
                <Bell size={16} />
                {unreadCount > 0 && <span className="sd-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
            </div>
          </div>

          {/* Content */}
          <main className="sd-content">
            <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              style={{ height: '100%' }}
            >
            <ErrorBoundary key={activeTab}>
              {activeTab === 'Welcome'      && <WelcomeContent />}
              {activeTab === 'Dashboard'    && <DashboardContent onTabChange={handleTabChange} realName={realName} />}
              {activeTab === 'Calendar'     && (
                <CalendarPage
                  onTabChange={handleTabChange}
                  focusAppointmentId={focusAppointmentId}
                  focusDate={focusCalendarDate}
                  onFocusHandled={() => { setFocusAppointmentId(null); setFocusCalendarDate(null); }}
                />
              )}
              {activeTab === 'Faculty'      && <FacultyContent key={facultyMountKey} initialFacultyId={initialFacultyId} />}
              {activeTab === 'Appointments' && (
                <AppointmentsContent
                  initialFilter={initialFilter}
                  onResetFilter={() => setInitialFilter('All')}
                  focusAppointmentId={focusAppointmentId}
                  onFocusHandled={() => setFocusAppointmentId(null)}
                />
              )}
              {activeTab === 'About'    && <AboutContent />}
              {activeTab === 'Archive'  && <ArchiveContent role="student" />}
              {activeTab === 'Settings' && (
                <SharedSettingsContent
                  role="student"
                  profileData={profileData}
                  userId={user?.id}
                  userEmail={user?.email}
                  textSize={textSize} setTextSize={setTextSize}
                  accessibilityPrefs={accessibilityPrefs} updateAccessibilityPref={updateAccessibilityPref}
                  onProfileSaved={handleProfileSaved}
                  onTabChange={setTab}
                />
              )}
            </ErrorBoundary>
            </motion.div>
            </AnimatePresence>
          </main>

          {/* Bottom nav (mobile) */}
          <div className="sd-bottom-nav">
          {[
            { id: 'Welcome', icon: Home },
            { id: 'Dashboard', icon: LayoutDashboard },
            { id: 'Calendar', icon: CalendarDays },
            { id: 'Faculty', icon: Users },
            { id: 'Appointments', icon: Calendar },
          ].map(item => (
            <button
              key={item.id}
              className={`sd-bottom-nav-item${activeTab === item.id ? ' active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              <item.icon size={20} />
              <span className="sd-bottom-nav-text">{item.id}</span>
            </button>
          ))}
          </div>
        </div>

        {/* Mobile drawer */}
        {(isMobileMenuOpen || isDrawerClosing) && (
          <div className={`sd-drawer-overlay${isDrawerClosing ? ' closing' : ''}`} onClick={closeDrawer}>
          <div className={`sd-drawer${isDrawerClosing ? ' closing' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="sd-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src={logo} alt="Askademic" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>Askademic</span>
              </div>
              <button onClick={closeDrawer} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                <CloseIcon size={26} />
              </button>
            </div>

            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden', background: resolvedAvatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>BSCS Student</p>
              </div>
            </div>

            {/* Nav links */}
            {navItems.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => { setTab(id); closeDrawer(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'none', border: 'none', color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <Icon size={20} /> {label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem', paddingTop: '1rem' }}>
              <button onClick={() => { setTab('Settings'); closeDrawer(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <Settings size={20} /> Settings
              </button>
              <button onClick={() => { setShowProfileModal(true); closeDrawer(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <User size={20} /> Edit Profile
              </button>
              <button onClick={() => { setTermsReadOnly(true); setShowTerms(true); closeDrawer(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <FileText size={20} /> Terms &amp; Policy
              </button>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem' }}>
                <LogOut size={20} /> Log Out
              </button>
            </div>
          </div>
          </div>
        )}

        {/* Modals */}
        <NotificationCenter
          userId={user?.id}
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
          onNotificationClick={(notif) => {
            if (!notif.request_id) return;
            setFocusAppointmentId(notif.request_id);
            // Approved → jump to Calendar (student can see the day it's scheduled)
            // Everything else (declined, cancelled, etc.) → Appointments details
            if (notif.type === 'approved') {
              setTab('Calendar');
            } else {
              setTab('Appointments');
            }
          }}
        />
        <ProfileEditModal
          isOpen={showProfileModal} onClose={() => setShowProfileModal(false)}
          onSaved={handleProfileSaved} onRollback={handleProfileRollback} role="student"
          userId={user?.id} initialData={profileData}
          forceComplete={/^\d+$/.test(realName)}
        />
        {showTerms && user?.id && (
          <TermsModal
            userId={user.id}
            readOnly={termsReadOnly}
            onAccepted={async () => {
              setShowTerms(false);
              if (!termsReadOnly) {
                localStorage.setItem(`gcas_tnc_${user.id}`, '1');
                try {
                  await supabase.from('profiles').update({ tnc_accepted: true }).eq('id', user.id);
                } catch {/* DB column may not exist yet — localStorage flag still protects */}
              }
            }}
          />
        )}
        {showLogoutConfirm && (
          <LogoutConfirm
            onConfirm={confirmLogout}
            onCancel={() => !loggingOut && setShowLogoutConfirm(false)}
            loading={loggingOut}
          />
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
