import React, { useState, useEffect } from 'react';
import {
  Home, LayoutDashboard, Users, Calendar, CalendarDays, Info,
  User, Moon, Sun, Settings, Bell, Menu, X as CloseIcon,
  LogOut, FileText, ChevronRight, BookOpen
} from 'lucide-react';
import DashboardContent from './DashboardContent';
import FacultyContent from './FacultyContent';
import AppointmentsContent from './AppointmentsContent';
import AboutContent from './AboutContent';
import CalendarPage from './CalendarPage';
import WelcomeContent from './WelcomeContent';
import SharedSettingsContent from '../../components/SharedSettingsContent';
import logo from '../logo.png';
import { useAuth } from '../../hooks/useAuth';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { getProfile, updateProfile } from '../../supabase/api';
import { useNavigate } from 'react-router-dom';
import SettingsModal from '../../components/SettingsModal';
import NotificationCenter from '../../components/NotificationCenter';
import ProfileEditModal from '../../components/ProfileEditModal';
import TermsModal from '../../components/TermsModal';

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

/* Dark mode */
.sd-root.dark {
  --sidebar-bg:      #0f1729;
  --sidebar-hover:   rgba(255,255,255,0.06);
  --sidebar-active:  #1e3460;
  --sidebar-text:    rgba(255,255,255,0.65);
  --sidebar-label:   rgba(255,255,255,0.3);
  --sidebar-border:  rgba(255,255,255,0.08);

  --main-bg:         #0c1022;
  --topbar-bg:       #111827;
  --topbar-border:   rgba(255,255,255,0.07);
  --card-bg:         #1a2235;
  --card-border:     rgba(255,255,255,0.07);
  --card-shadow:     0 2px 16px rgba(0,0,0,0.3);

  --text-primary:    #e2e8f5;
  --text-secondary:  #c7d3ea;
  --text-muted:      #7a8fb0;
  --accent:          #5b80c4;
  --accent-light:    rgba(91,128,196,0.15);
  --accent-orange:   #5b80c4;

  --border-color:    rgba(255,255,255,0.07);
  --bg-primary:      #0c1022;
  --bg-secondary:    #1a2235;

  --shadow: 0 2px 16px rgba(0,0,0,0.3);
}

/* Accessibility */
.sd-root.high-contrast {
  --main-bg: #000 !important; --card-bg: #111 !important;
  --text-primary: #fff !important; --text-secondary: #fff !important;
  --text-muted: #ff0 !important; --border-color: #fff !important;
  --card-border: #fff !important; --accent: #f00 !important;
  --accent-light: #222 !important; --sidebar-bg: #000 !important;
}
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
  width: 68px;
  flex-shrink: 0;
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
  background: rgba(255,255,255,0.15);
  border: 2px solid rgba(255,255,255,0.25);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 0.8rem;
  overflow: hidden; flex-shrink: 0;
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
  flex: 1; overflow-y: auto; padding: 1.6rem 2rem;
  scrollbar-width: none; -ms-overflow-style: none;
  background: var(--main-bg);
  zoom: 1.18;
}
.sd-content::-webkit-scrollbar { display: none; }

/* ── Mobile topbar (hidden on desktop) ── */
.sd-mobile-bar {
  display: none; align-items: center; justify-content: space-between;
  padding: 0.7rem 1rem;
  background: var(--topbar-bg); border-bottom: 1px solid var(--topbar-border);
  flex-shrink: 0;
}
.sd-mobile-brand { font-weight: 900; font-size: 1.1rem; color: var(--accent); }

/* ── Bottom nav (mobile) ── */
.sd-bottom-nav {
  display: none; position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--card-bg); border-top: 1px solid var(--card-border);
  padding: 0.4rem 0.5rem; z-index: 1000;
  justify-content: space-around; align-items: center;
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
.sd-drawer {
  position: fixed; inset: 0;
  background: var(--sidebar-bg);
  z-index: 2000; display: flex; flex-direction: column;
  padding: 1.5rem;
  animation: drawerSlide 0.25s ease;
}
@keyframes drawerSlide {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}
.sd-drawer-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 2rem;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .sd-sidebar { display: none !important; }
  .sd-topbar  { display: none !important; }
  .sd-mobile-bar { display: flex !important; }
  .sd-bottom-nav { display: flex !important; }
  .sd-content { padding: 1rem 0.9rem 5rem 0.9rem; }
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

const allAvatars = Array.from({ length: 20 }, (_, i) =>
  `https://api.dicebear.com/7.x/lorelei/svg?seed=Student${i + 1}&backgroundColor=e5e7eb,f3f4f6`
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('gcas_student_tab') || 'Welcome');
  const [facultyMountKey, setFacultyMountKey] = useState(0);
  const [initialFacultyId, setInitialFacultyId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gcas_student_theme') === 'dark');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('gcas_student_text_size') || 'medium');
  const [isHighContrast, setIsHighContrast] = useState(() => localStorage.getItem('gcas_student_high_contrast') === 'true');
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({ reducedMotion: false, dyslexicFont: false });
  const [initialFilter, setInitialFilter] = useState('All');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const [termsReadOnly, setTermsReadOnly] = useState(false);

  // Profile
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [realName, setRealName] = useState('');
  const [realAvatar, setRealAvatar] = useState('');
  const [profilePrefix, setProfilePrefix] = useState('');
  const [profileSuffix, setProfileSuffix] = useState('');
  const [profileData, setProfileData] = useState(null);

  useEffect(() => { localStorage.setItem('gcas_student_theme', isDarkMode ? 'dark' : 'light'); }, [isDarkMode]);
  useEffect(() => { localStorage.setItem('gcas_student_text_size', textSize); }, [textSize]);
  useEffect(() => { localStorage.setItem('gcas_student_high_contrast', isHighContrast); }, [isHighContrast]);

  useEffect(() => {
    if (!user) return;
    document.documentElement.className = '';
    ensureProfile();
    getProfile(user.id).then(p => {
      if (p) {
        setRealName(p.full_name || 'Student');
        setRealAvatar(p.avatar_url || allAvatars[0]);
        setProfilePrefix(p.name_prefix || '');
        setProfileSuffix(p.name_suffix || '');
        setProfileData(p);
        if (p.accessibility_prefs) setAccessibilityPrefs(p.accessibility_prefs);
        if (!p.tnc_accepted && !localStorage.getItem(`gcas_tnc_${user.id}`)) {
          setTermsReadOnly(false); setShowTerms(true);
        }
        if (/^\d+$/.test(p.full_name)) setShowProfileModal(true);
      }
    });
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
    setShowProfileModal(false);
  };

  const updateAccessibilityPref = async (key, value) => {
    const newPrefs = { ...accessibilityPrefs, [key]: value };
    setAccessibilityPrefs(newPrefs);
    await updateProfile(user.id, { accessibility_prefs: newPrefs });
  };

  const handleTabChange = (tab, filter = 'All', facultyId = null) => {
    if (tab === 'Faculty') { setFacultyMountKey(k => k + 1); setInitialFacultyId(facultyId); }
    setInitialFilter(filter); setActiveTab(tab);
    localStorage.setItem('gcas_student_tab', tab);
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('gcas_student_tab', tab);
  };

  const handleLogout = async () => {
    localStorage.removeItem('gcas_student_tab');
    sessionStorage.removeItem('admin_bypass');
    await supabase.auth.signOut();
    navigate('/');
  };

  const displayName = realName || 'Student';
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
  ];

  const pageTitles = {
    Welcome: 'Welcome', Dashboard: 'Dashboard', Calendar: 'Calendar',
    Faculty: 'Faculty Directory', Appointments: 'My Consultation Appointments',
    Settings: 'Settings',
  };

  const rootClass = [
    'sd-root',
    isDarkMode ? 'dark' : '',
    isHighContrast ? 'high-contrast' : '',
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
            <img src={logo} alt="FACS" />
            <div className="sd-brand-text">
              <span className="sd-brand-name">FACS</span>
              <span className="sd-brand-sub">Faculty Appointment &amp;<br />Consultation System</span>
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
            <div className="sd-user-avatar">
              {realAvatar
                ? <img src={realAvatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                : initials}
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
              {/* Theme toggle */}
              <button className="sd-icon-btn" onClick={() => setIsDarkMode(v => !v)} title="Toggle theme">
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile topbar */}
          <div className="sd-mobile-bar">
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', padding: '0.4rem' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <span className="sd-mobile-brand">FACS</span>
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
              <button className="sd-icon-btn" onClick={() => setIsNotifOpen(v => !v)}>
                <Bell size={19} />
                {unreadCount > 0 && <span className="sd-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>
              <button className="sd-icon-btn" onClick={() => setIsDarkMode(v => !v)}>
                {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            </div>
          </div>

          {/* Content */}
          <main className="sd-content">
            {activeTab === 'Welcome'      && <WelcomeContent />}
            {activeTab === 'Dashboard'    && <DashboardContent onTabChange={handleTabChange} realName={realName} />}
            {activeTab === 'Calendar'     && <CalendarPage onTabChange={handleTabChange} />}
            {activeTab === 'Faculty'      && <FacultyContent key={facultyMountKey} initialFacultyId={initialFacultyId} />}
            {activeTab === 'Appointments' && (
              <AppointmentsContent
                initialFilter={initialFilter}
                onResetFilter={() => setInitialFilter('All')}
              />
            )}
            {activeTab === 'Settings' && (
              <SharedSettingsContent
                role="student"
                profileData={profileData}
                userId={user?.id}
                userEmail={user?.email}
                isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
                textSize={textSize} setTextSize={setTextSize}
                isHighContrast={isHighContrast} setIsHighContrast={setIsHighContrast}
                accessibilityPrefs={accessibilityPrefs} updateAccessibilityPref={updateAccessibilityPref}
                onProfileSaved={handleProfileSaved}
              />
            )}
          </main>
        </div>

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

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="sd-drawer">
            <div className="sd-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src={logo} alt="FACS" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                <span style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff' }}>FACS</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                <CloseIcon size={26} />
              </button>
            </div>

            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                {realAvatar ? <img src={realAvatar} alt="avatar" style={{ width: '100%' }} /> : initials}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{displayName}</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>BSCS Student</p>
              </div>
            </div>

            {/* Nav links */}
            {navItems.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => { setTab(id); setIsMobileMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'none', border: 'none', color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <Icon size={20} /> {label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem', paddingTop: '1rem' }}>
              <button onClick={() => { setIsNotifOpen(true); setIsMobileMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <Bell size={20} /> Notifications {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '50%', fontWeight: 700 }}>{unreadCount}</span>}
              </button>
              <button onClick={() => { setTab('Settings'); setIsMobileMenuOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginBottom: '0.2rem' }}>
                <Settings size={20} /> Settings
              </button>
              <button onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', background: 'none', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '0.75rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem' }}>
                <LogOut size={20} /> Log Out
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        <NotificationCenter userId={user?.id} isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        <ProfileEditModal
          isOpen={showProfileModal} onClose={() => setShowProfileModal(false)}
          onSaved={handleProfileSaved} role="student"
          userId={user?.id} initialData={profileData}
          forceComplete={/^\d+$/.test(realName)}
        />
        {showTerms && user?.id && (
          <TermsModal userId={user.id} readOnly={termsReadOnly} onAccepted={() => setShowTerms(false)} />
        )}
      </div>
    </>
  );
};

export default StudentDashboard;
