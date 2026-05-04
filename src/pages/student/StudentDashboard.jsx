import React, { useState, useEffect } from 'react';
import { User, Moon, Settings, Menu, X as CloseIcon } from 'lucide-react';
import DashboardContent from './DashboardContent';
import FacultyContent from './FacultyContent';
import AppointmentsContent from './AppointmentsContent';
import AboutContent from './AboutContent';
import logo from '../logo.png';
import { useAuth } from '../../hooks/useAuth';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { getProfile, updateProfile } from '../../supabase/api';
import { useNavigate } from 'react-router-dom';

const dashStyles = `
:root {
  --bg-primary: #fff9f5;
  --bg-secondary: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #4b5563;
  --text-muted: #9ca3af;
  --border-color: #eaeaea;
  --card-border: #d1d5db;
  --nav-bg: #ffffff;
  --accent-orange: #ea580c;
  --accent-light: #fff7ed;
  --shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.dashboard-fixed-wrapper.dark {
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --text-primary: #ffffff;
  --text-secondary: #e5e7eb;
  --text-muted: #9ca3af;
  --border-color: #2a2a2a;
  --card-border: #333333;
  --nav-bg: #1a1a1a;
  --accent-orange: #ea580c;
  --accent-light: #2d1a10;
  --shadow: 0 4px 20px rgba(0,0,0,0.4);
}

.dashboard-fixed-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-primary);
  background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 30px 30px;
  z-index: 50;
  overflow-y: auto;
  font-family: 'Outfit', 'Inter', sans-serif;
  color: var(--text-primary);
  transition: background-color 0.3s, color 0.3s;
  
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.dashboard-fixed-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.top-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--nav-bg);
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-image {
  width: 35px;
  height: auto;
}

.brand-text {
  font-weight: 600;
  color: var(--text-muted);
  font-size: 1rem;
}

.mobile-only { display: none; }
.desktop-only { display: block; }

.nav-tabs {
  display: flex;
  gap: 0.8rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-tab {
  padding: 0.5rem 1.1rem;
  border-radius: 20px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.95rem;
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
}

.user-info {
  text-align: right;
  line-height: 1.2;
}

.user-name {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 2px solid var(--accent-orange);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-orange);
  font-weight: 700;
  font-size: 0.9rem;
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
  padding: 3rem 1rem;
}

.welcome-section {
  margin-bottom: 2.5rem;
}

.welcome-title {
  font-size: 2rem;
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
  width: 55px;
  height: 55px;
  background: var(--accent-light);
  color: var(--accent-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  flex-shrink: 0;
}

.action-content h3 {
  font-size: 1.1rem;
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
  font-size: 2.2rem;
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

@media (max-width: 900px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }

  .main-content {
    padding: 1.5rem 1rem;
  }
  
  .top-navbar {
    padding: 0.6rem 1rem;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    overflow-x: auto;
    white-space: nowrap;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .top-navbar::-webkit-scrollbar {
    display: none;
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

  .nav-tabs {
    position: static;
    transform: none;
    width: auto;
    justify-content: flex-start;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .nav-tab {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .user-section {
    width: auto;
    justify-content: flex-end;
    gap: 0.8rem;
    flex-shrink: 0;
  }

  .user-avatar {
    width: 36px;
    height: 36px;
  }

  .dark-mode-toggle {
    padding: 0.4rem;
  }

  .nav-tabs { display: none; }
  .mobile-menu-btn { display: flex !important; }
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
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [initialFilter, setInitialFilter] = useState('All');

  // Profile State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [realName, setRealName] = useState('');
  const [realAvatar, setRealAvatar] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allAvatars = Array.from({ length: 20 }, (_, i) => `https://api.dicebear.com/7.x/lorelei/svg?seed=Student${i + 1}&backgroundColor=e5e7eb,f3f4f6`);

  // Ensure profile exists for pre-trigger users and check name
  useEffect(() => {
    if (!user) return;
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
      const parts = realName.split(', ');
      const last = parts[0] || '';
      const rest = parts[1] || '';
      const first = rest.split(' ')[0] || '';
      const mid = rest.split(' ').slice(1).join(' ') || '';
      
      setLastName(last);
      setFirstName(first);
      setMiddleName(mid);
    }
    setSelectedAvatar(realAvatar || allAvatars[0]);
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert("First name and Last name are required.");
      return;
    }

    const formattedName = `${lastName.trim()}, ${firstName.trim()} ${middleName.trim()}`.trim();
    
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
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <>
      <style>{dashStyles}</style>
      <div className={`dashboard-fixed-wrapper ${isDarkMode ? 'dark' : ''}`}>
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
            <button 
              className="dark-mode-toggle" 
              aria-label="Toggle Dark Mode"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              <Moon size={20} />
            </button>
            <div className="user-info">
              <h4 className="user-name">{realName || user?.displayName || 'User'}</h4>
              <p className="user-role" style={{ fontSize: '0.75rem', marginTop: '0.1rem' }}>{user?.email ? user.email.split('@')[0] : 'Student'}</p>
            </div>
            <div className="user-avatar" style={{ overflow: 'hidden' }} onClick={openProfileModal} title="Edit Profile">
              <img src={realAvatar || user?.avatarUrl || allAvatars[0]} alt="User Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            </div>
            <button className="edit-profile-btn" onClick={openProfileModal} title="Settings">
              <Settings size={16} />
            </button>

            <button 
              onClick={handleLogout}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        </nav>

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
      </div>

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
            {['Dashboard', 'Faculty', 'Appointments', 'About'].map((tab) => (
              <button
                key={tab}
                className={`drawer-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  handleTabChange(tab);
                  setIsMobileMenuOpen(false);
                }}
              >
                {tab}
              </button>
            ))}
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
    </>
  );
};

export default StudentDashboard;
