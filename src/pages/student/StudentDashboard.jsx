import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Info, User, Moon, Sun, Settings, Menu, X as CloseIcon } from 'lucide-react';
import DashboardContent from './DashboardContent';
import FacultyContent from './FacultyContent';
import AppointmentsContent from './AppointmentsContent';
import AboutContent from './AboutContent';
import logo from '../logo.png';
import { useAuth } from '../../hooks/useAuth';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { updateProfile, getProfile } from '../../supabase/api';
import { useNavigate } from 'react-router-dom';
import SettingsModal from '../../components/SettingsModal';

const dashStyles = `
.dashboard-fixed-wrapper.dark {
  --bg-primary: rgba(18, 18, 18, 0.85);
  --bg-secondary: rgba(30, 30, 30, 0.9);
  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-muted: #9ca3af;
  --border-color: rgba(255, 255, 255, 0.1);
  --card-border: rgba(255, 255, 255, 0.1);
  --nav-bg: rgba(26, 26, 26, 0.95);
  --accent-orange: #ea580c;
  --accent-light: rgba(45, 26, 16, 0.5);
  --shadow: 0 4px 20px rgba(0,0,0,0.4);
  --overlay-color: rgba(15, 17, 23, 0.78);
}

:root {
  --bg-primary: rgba(255, 249, 245, 0.85);
  --bg-secondary: rgba(255, 255, 255, 0.9);
  --text-primary: #1a1a1a;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --border-color: rgba(234, 234, 234, 0.5);
  --card-border: rgba(209, 213, 219, 0.5);
  --nav-bg: rgba(255, 255, 255, 0.95);
  --accent-orange: #ea580c;
  --accent-light: rgba(255, 247, 237, 0.5);
  --shadow: 0 2px 8px rgba(0,0,0,0.04);
  --overlay-color: rgba(255, 255, 255, 0.72);
}

.dashboard-fixed-wrapper.high-contrast {
  --bg-primary: #000000 !important;
  --bg-secondary: #111111 !important;
  --text-primary: #ffffff !important;
  --text-secondary: #ffffff !important;
  --text-muted: #ffff00 !important;
  --border-color: #ffffff !important;
  --card-border: #ffffff !important;
  --accent-orange: #ff8c00 !important;
  --accent-light: #333333 !important;
  --shadow: 0 0 0 2px #ffffff !important;
}

.dashboard-fixed-wrapper.text-small { font-size: 0.85rem !important; }
.dashboard-fixed-wrapper.text-medium { font-size: 1rem !important; }
.dashboard-fixed-wrapper.text-large { font-size: 1.15rem !important; }

.dashboard-fixed-wrapper.text-small .nav-tab { font-size: 0.8rem !important; }
.dashboard-fixed-wrapper.text-large .nav-tab { font-size: 1.1rem !important; }

.dashboard-fixed-wrapper.text-small h1,
.dashboard-fixed-wrapper.text-small h2,
.dashboard-fixed-wrapper.text-small .welcome-title { font-size: 1.4rem !important; }
.dashboard-fixed-wrapper.text-large h1,
.dashboard-fixed-wrapper.text-large h2,
.dashboard-fixed-wrapper.text-large .welcome-title { font-size: 2.5rem !important; }

.dashboard-fixed-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  z-index: 50;
  overflow-y: auto;
  font-family: 'Outfit', 'Inter', sans-serif;
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.dashboard-bg-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: url('/GCBG.jpg') center/cover no-repeat fixed;
  filter: blur(2px);
  transform: scale(1.02);
}

.dashboard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: var(--overlay-color);
  backdrop-filter: blur(1px);
}

.dashboard-fixed-wrapper::-webkit-scrollbar {
  display: none;
}

.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1.5rem;
  background-color: var(--nav-bg);
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.logo-image {
  width: 30px;
  height: auto;
}

.brand-text {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.mobile-only { display: none; }
.desktop-only { display: block; }

.nav-tabs {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  flex: 1;
}

.nav-tab {
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

.nav-tab:hover {
  background: var(--accent-light);
  color: var(--accent-orange);
}

.nav-tab.active {
  background: var(--accent-orange);
  color: #fff;
  border-color: var(--accent-orange);
  box-shadow: none;
}

.dark-mode-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.dark-mode-toggle:hover {
  background: var(--bg-secondary);
  color: var(--accent-orange);
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: flex-end;
  flex: 1;
}

.user-info {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;
  background: var(--bg-secondary);
  border: 2px solid var(--accent-orange);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-orange);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
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
  background: var(--bg-primary);
  color: var(--accent-orange);
}

.main-content {
  max-width: 1050px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.welcome-section {
  margin-bottom: 2.5rem;
}

.welcome-title {
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.3rem;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.action-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.action-card {
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.action-card:hover {
  border-color: var(--accent-orange);
}

.action-icon {
  width: 45px;
  height: 45px;
  background: var(--accent-light);
  color: var(--accent-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.action-content h3 {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0 0 0.2rem 0;
  font-weight: 600;
}

.action-content p {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin: 0;
}

.metric-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 1rem 1.2rem;
  position: relative;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.metric-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: transparent;
  transition: background-color 0.2s;
}

.metric-card:hover {
  border-color: var(--border-color);
  box-shadow: var(--shadow);
  transform: translateY(-2px);
}

.metric-card:hover::before {
  background-color: var(--accent-orange);
}

.metric-card h4 {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  font-weight: 500;
}

.metric-card p {
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-orange);
  margin: 0.2rem 0;
  line-height: 1;
}

.appointments-container {
  background: var(--bg-secondary);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 1.5rem;
}

.appointments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.appointments-header h3 {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 600;
  margin: 0;
}

.view-all {
  color: var(--accent-orange);
  font-weight: 600;
  font-size: 0.8rem;
  text-decoration: none;
}

.appointment-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1rem;
  background: transparent;
  transition: all 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.appointment-card:last-child {
  border-bottom: none;
}

.appointment-card:hover {
  background: var(--bg-primary);
}

.appointment-info {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.app-avatar {
  width: 52px;
  height: 52px;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--accent-orange);
  transition: border-color 0.3s;
}

.app-avatar.approved { border-color: #22c55e; }
.app-avatar.pending { border-color: #eab308; }
.app-avatar.cancelled { border-color: #ef4444; }

.app-initials {
  font-weight: 700;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.app-initials.approved { color: #22c55e; }
.app-initials.pending { color: #eab308; }
.app-initials.cancelled { color: #ef4444; }

.app-avatar-icon {
  color: #fff;
}

.app-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
}

.app-details h4 {
  margin: 0;
  font-size: 1.05rem;
  color: var(--text-primary);
  font-weight: 600;
  line-height: 1.2;
}

.app-details p {
  margin: 0.1rem 0 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.status-badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  line-height: 1;
  text-transform: capitalize;
}

.status-badge.approved {
  border: 1.5px solid #22c55e;
  color: #22c55e;
}

.status-badge.pending {
  border: 1.5px solid #eab308;
  color: #eab308;
}

.status-badge.cancelled {
  border: 1.5px solid #ef4444;
  color: #ef4444;
}

.status-badge.completed {
  border: 1.5px solid #ea580c;
  color: #ea580c;
}

@media (max-width: 768px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }

  .main-content {
    padding: 1.5rem 1rem 5rem 1rem;
  }
  
  .top-navbar {
    padding: 0.6rem 1rem;
    justify-content: space-between;
  }

  .logo-section {
    flex-shrink: 0;
    gap: 0.8rem;
  }

  .brand-text {
    font-size: 1rem;
    font-weight: 800;
    color: var(--accent-orange);
  }

  .user-info,
  .dark-mode-toggle,
  .edit-profile-btn,
  .nav-logout-btn {
    display: none;
  }
  .user-section {
    display: flex;
    gap: 0.5rem;
  }
  .nav-tabs { display: none; }
  .mobile-menu-btn { display: flex !important; }
}

.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
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
  color: var(--accent-orange);
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
  background: var(--bg-primary);
  z-index: 2000;
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
  color: var(--accent-orange);
}

.mobile-profile-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-primary);
  border-radius: 16px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
}

@media (max-width: 600px) {
  .top-navbar {
    gap: 0.8rem;
  }
  
  .brand-text {
    font-size: 0.9rem;
  }

  .nav-tabs {
    gap: 0.3rem;
  }

  .nav-tab {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .dark-mode-toggle {
    padding: 0.3rem;
  }

  .welcome-title {
    font-size: 1.4rem;
  }

  .welcome-subtitle {
    font-size: 0.75rem;
  }

  .action-cards {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .action-card {
    padding: 0.8rem 1rem;
    gap: 0.8rem;
  }

  .action-icon {
    width: 40px;
    height: 40px;
  }

  .action-content h3 {
    font-size: 0.95rem;
  }

  .action-content p {
    font-size: 0.7rem;
  }

  .metric-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .metric-card {
    padding: 0.8rem;
  }

  .metric-value {
    font-size: 1.6rem;
  }

  .metric-card h4 {
    font-size: 0.8rem;
  }

  .metric-card p {
    font-size: 0.65rem;
  }

  .appointments-container {
    padding: 1rem;
  }

  .appointment-card {
    padding: 0.8rem 0.5rem;
    gap: 0.5rem;
  }

  .appointment-info {
    gap: 0.8rem;
  }

  .app-avatar {
    width: 40px;
    height: 40px;
  }

  .app-details h4 {
    font-size: 0.9rem;
  }

  .app-details p {
    font-size: 0.7rem;
    white-space: nowrap;
  }

  .status-badge {
    min-width: 70px;
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-card {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 16px;
  width: 95%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--card-border);
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3);
}

.modal-card::-webkit-scrollbar {
  width: 5px;
}
.modal-card::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
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
  background: var(--bg-primary);
  color: var(--text-primary);
  margin-bottom: 1.2rem;
  font-family: inherit;
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
  background: var(--bg-primary);
  overflow: hidden;
}

.avatar-option:hover { transform: scale(1.1); }
.avatar-option.selected {
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 2px var(--accent-light);
}
`;

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('gcas_student_tab') || 'Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('gcas_student_theme') === 'dark');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('gcas_student_text_size') || 'medium');
  const [isHighContrast, setIsHighContrast] = useState(() => localStorage.getItem('gcas_student_high_contrast') === 'true');
  const [initialFilter, setInitialFilter] = useState('All');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('gcas_student_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('gcas_student_text_size', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('gcas_student_high_contrast', isHighContrast);
  }, [isHighContrast]);

  // Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [realName, setRealName] = useState('');
  const [realAvatar, setRealAvatar] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const allAvatars = Array.from({ length: 20 }, (_, i) => `https://api.dicebear.com/7.x/lorelei/svg?seed=Student${i + 1}&backgroundColor=e5e7eb,f3f4f6`);

  // Ensure profile exists for pre-trigger users and check name
  useEffect(() => {
    if (!user) return;
    // Clear auth-page dark class from <html> so dashboard manages its own theme
    document.documentElement.className = '';
    ensureProfile();
    
    getProfile(user.id).then(p => {
      if (p) {
        setRealName(p.full_name || user.displayName || 'Student');
        setRealAvatar(p.avatar_url || user.avatarUrl || allAvatars[0]);
        
        // If full_name is only numbers, force update
        if (/^\d+$/.test(p.full_name)) {
          setSelectedAvatar(allAvatars[0]);
          setShowProfileModal(true);
        }
      }
    });
  }, [user]);

  const openProfileModal = () => {
    if (realName && !(/^\d+$/.test(realName))) {
      const parts = realName.split(' ').filter(p => p.trim() !== '');
      if (parts.length >= 3) {
        setLastName(parts[parts.length - 1]);
        setMiddleName(parts[parts.length - 2]);
        setFirstName(parts.slice(0, -2).join(' '));
      } else if (parts.length === 2) {
        setFirstName(parts[0]);
        setLastName(parts[1]);
        setMiddleName('');
      } else {
        setFirstName(realName);
        setLastName('');
        setMiddleName('');
      }
    }
    setSelectedAvatar(realAvatar || allAvatars[0]);
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("First name and Last name are required.");
      return;
    }

    const formattedName = `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim();
    
    const updated = await updateProfile(user.id, {
      full_name: formattedName,
      avatar_url: selectedAvatar
    });

    if (updated) {
      setRealName(formattedName);
      setRealAvatar(selectedAvatar);
      setShowProfileModal(false);
    }
  };

  const handleTabChange = (tab, filter = 'All') => {
    setInitialFilter(filter);
    setActiveTab(tab);
    localStorage.setItem('gcas_student_tab', tab);
  };

  const handleActiveTabSet = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('gcas_student_tab', tab);
  };

  const handleLogout = async () => {
    localStorage.removeItem('gcas_student_tab');
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <style>{dashStyles}</style>
    <div className={`dashboard-fixed-wrapper ${isDarkMode ? 'dark' : ''} ${isHighContrast ? 'high-contrast' : ''} text-${textSize}`}>
      <div className="dashboard-bg-layer"></div>
      <div className="dashboard-overlay"></div>
        <nav className="top-navbar">
          <div className="logo-section">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <img src={logo} alt="G-CAS Logo" className="logo-image" />
            <span className="brand-text desktop-only">Gordon College Appointment System</span>
            <span className="brand-text mobile-only">GCAS</span>
          </div>
          
          <div className="nav-tabs desktop-only">
            <div 
              className={`nav-tab ${activeTab === 'Dashboard' ? 'active' : ''}`}
              onClick={() => handleTabChange('Dashboard')}
            >
              Dashboard
            </div>
            <div 
              className={`nav-tab ${activeTab === 'Faculty' ? 'active' : ''}`}
              onClick={() => handleTabChange('Faculty')}
            >
              Faculty
            </div>
            <div 
              className={`nav-tab ${activeTab === 'Appointments' ? 'active' : ''}`}
              onClick={() => handleTabChange('Appointments')}
            >
              Appointments
            </div>
            <div 
              className={`nav-tab ${activeTab === 'About' ? 'active' : ''}`}
              onClick={() => handleTabChange('About')}
            >
              About
            </div>
          </div>

          <div className="user-section">
          <button className="dark-mode-toggle desktop-only" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="edit-profile-btn desktop-only" onClick={() => setIsSettingsModalOpen(true)} title="Settings">
             <Settings size={20} />
          </button>

          <div className="user-info desktop-only">
            <p className="user-name">{realName || 'Student'}</p>
            <p className="user-role">Gordon College Student</p>
          </div>
          
          <div 
            className="user-avatar" 
            onClick={() => {
              if (window.innerWidth <= 768) {
                setIsMobileMenuOpen(true);
              } else {
                openProfileModal();
              }
            }}
          >
            {realAvatar ? <img src={realAvatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : (realName ? realName[0] : 'S')}
          </div>

          <button 
            onClick={handleLogout}
            className="nav-logout-btn"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginLeft: '0.5rem'
            }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="bottom-nav">
        {[
          { id: 'Dashboard', icon: LayoutDashboard },
          { id: 'Faculty', icon: Users },
          { id: 'Appointments', icon: Calendar }
        ].map((item) => (
          <button
            key={item.id}
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleActiveTabSet(item.id)}
          >
            <item.icon size={20} />
            <span className="bottom-nav-text">{item.id}</span>
          </button>
        ))}
      </div>

        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          textSize={textSize}
          setTextSize={setTextSize}
          isHighContrast={isHighContrast}
          setIsHighContrast={setIsHighContrast}
          onLogout={handleLogout}
        />

        <main className="main-content">
          {activeTab === 'Dashboard' && <DashboardContent onTabChange={handleTabChange} realName={realName} />}
          {activeTab === 'Faculty' && <FacultyContent />}
          {activeTab === 'Appointments' && (
            <AppointmentsContent 
              initialFilter={initialFilter} 
              onResetFilter={() => setInitialFilter('All')} 
            />
          )}
          {activeTab === 'About' && <AboutContent />}
        </main>

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ marginTop: 0, marginBottom: '0.8rem', textAlign: 'left', color: 'var(--text-primary)', fontSize: '1.5rem' }}>{/^\d+$/.test(realName) ? 'Complete Your Profile' : 'Edit Profile'}</h2>
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)', 
              marginBottom: '1.5rem', 
              textAlign: 'left', 
              padding: '0.8rem', 
              background: 'rgba(234, 88, 12, 0.05)', 
              borderRadius: '8px',
              borderLeft: '4px solid var(--accent-orange)'
            }}>
              Please provide your real name. <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>Note: Faculty members will see your student number with this name.</span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="modal-label">First Name</label>
                <input 
                  type="text" 
                  className="profile-input" 
                  style={{ marginBottom: 0 }}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="modal-label">Middle</label>
                <input 
                  type="text" 
                  className="profile-input" 
                  style={{ marginBottom: 0 }}
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="M."
                />
              </div>
            </div>

            <label className="modal-label">Last Name</label>
            <input 
              type="text" 
              className="profile-input" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Dela Cruz"
            />

            <label className="modal-label">Choose an Avatar</label>
            <div className="avatar-grid">
              {allAvatars.map((url, i) => (
                <img 
                  key={`avatar-${i}`} src={url} alt={`Avatar option ${i+1}`} 
                  className={`avatar-option ${selectedAvatar === url ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(url)}
                />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: /^\d+$/.test(realName) ? '1fr' : '1fr 1fr', gap: '1rem' }}>
              {!(/^\d+$/.test(realName)) && (
                <button onClick={() => setShowProfileModal(false)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
              )}
              <button onClick={handleSaveProfile} style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="drawer-header">
            <div className="logo-section">
              <img src={logo} alt="GCAS Logo" style={{ width: '40px' }} />
              <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--accent-orange)' }}>G-CAS</span>
            </div>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <CloseIcon size={28} />
            </button>
          </div>
          <div className="drawer-links">
            <div className="mobile-profile-section">
              <div className="prof-avatar" style={{ width: '60px', height: '60px', overflow: 'hidden', borderRadius: '50%', border: '2px solid var(--accent-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--accent-orange)', fontWeight: 700, fontSize: '1.5rem' }}>
                {realAvatar ? <img src={realAvatar} alt="avatar" style={{ width: '100%' }} /> : (realName ? realName[0] : 'S')}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{realName}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Student</p>
              </div>
            </div>
            
            <button className="drawer-link" onClick={() => { setIsDarkMode(!isDarkMode); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </button>
            
            <button className="drawer-link" onClick={() => { setActiveTab('About'); setIsMobileMenuOpen(false); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Info size={24} />
                <span>About System</span>
              </div>
            </button>
            <button className="drawer-link" onClick={() => { setIsSettingsModalOpen(true); setIsMobileMenuOpen(false); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Settings size={24} />
                <span>Settings</span>
              </div>
            </button>
            <button className="drawer-link" onClick={() => { openProfileModal(); setIsMobileMenuOpen(false); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <User size={24} />
                <span>Edit Profile</span>
              </div>
            </button>
          </div>
          
          <div style={{ marginTop: 'auto', padding: '2rem 0', borderTop: '1px solid var(--border-color)' }}>
             <button 
              onClick={handleLogout}
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
    </>
  );
};

export default StudentDashboard;
