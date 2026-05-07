import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { getProfile } from '../../supabase/api';
import { subscribeToMyProfile } from '../../supabase/realtime';
import { Layout, Calendar, Clock, Bell, User, Moon, Sun, ChevronDown, CheckCircle, AlertCircle, XCircle, Settings, Menu, X as CloseIcon } from 'lucide-react';
import FacultyDashboardContent from './FacultyDashboardContent';
import FacultyScheduleContent from './FacultyScheduleContent';
import FacultyRequestsContent from './FacultyRequestsContent';
import FacultyAboutContent from './FacultyAboutContent';
import { useAuth } from '../../hooks/useAuth';
import logo from '../logo.png';
import SettingsModal from '../../components/SettingsModal';

const facultyDashStyles = `
.faculty-dashboard-wrapper.dark {
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

.faculty-dashboard-wrapper.text-small { font-size: 0.85rem; }
.faculty-dashboard-wrapper.text-medium { font-size: 1rem; }
.faculty-dashboard-wrapper.text-large { font-size: 1.15rem; }

.faculty-dashboard-wrapper.text-small .nav-link,
.faculty-dashboard-wrapper.text-small .nav-tab { font-size: 0.8rem; }
.faculty-dashboard-wrapper.text-large .nav-link,
.faculty-dashboard-wrapper.text-large .nav-tab { font-size: 1.1rem; }

.faculty-dashboard-wrapper.text-small h1,
.faculty-dashboard-wrapper.text-small h2 { font-size: 1.2rem; }
.faculty-dashboard-wrapper.text-large h1,
.faculty-dashboard-wrapper.text-large h2 { font-size: 2rem; }

.faculty-dashboard-wrapper {
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

.faculty-dashboard-wrapper::-webkit-scrollbar {
  display: none;
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

.faculty-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  background: var(--bg-secondary);
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
  color: var(--accent-orange);
}

.nav-link.active {
  background: var(--accent-orange);
  color: #fff;
  border-color: var(--accent-orange);
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

.prof-avatar.available { border-color: #22c55e; animation: pulse-available 2s infinite; }
.prof-avatar.busy { border-color: #eab308; animation: pulse-busy 2s infinite; }
.prof-avatar.unavailable { border-color: #ef4444; }

@keyframes pulse-available {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

@keyframes pulse-busy {
  0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(234, 179, 8, 0); }
  100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
}

.faculty-main-content {
  max-width: 1050px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
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
  background: var(--bg-primary);
  overflow: hidden;
}

.avatar-option:hover {
  transform: scale(1.1);
}

.avatar-option.selected {
  border-color: var(--accent-orange);
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
  background: var(--bg-primary);
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

.brand-text-mobile {
  font-weight: 800;
  font-size: 1rem;
  color: var(--accent-orange);
  display: none;
}

@media (max-width: 768px) {
  .brand-text-mobile { display: block; }
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
  const [requestFilter, setRequestFilter] = useState('Pending');
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [profileStatus, setProfileStatus] = useState('Available');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editDept, setEditDept] = useState('');

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
  const allAvatars = Array.from({ length: 20 }, (_, i) => `https://api.dicebear.com/7.x/lorelei/svg?seed=Prof${i + 1}&backgroundColor=e5e7eb,f3f4f6`);

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
        setProfileAvatar(p.avatar_url || user.avatarUrl);
        setProfileDept(p.department || 'CCS');
        setProfileStatus(p.status || 'Available');
      }
    });

    return () => {};
  }, [user]);

  const openProfileModal = () => {
    setEditName(profileName);
    setEditAvatar(profileAvatar);
    setEditDept(profileDept);
    setShowProfileModal(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    const { updateProfile } = await import('../../supabase/api');
    const updated = await updateProfile(user.id, {
      full_name: editName,
      avatar_url: editAvatar,
      department: editDept
    });
    if (updated) {
      setProfileName(editName);
      setProfileAvatar(editAvatar);
      setProfileDept(editDept);
      setShowProfileModal(false);
      import('../../supabase/ux').then(({ toast }) => toast.success('Profile updated successfully!'));
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('gcas_faculty_tab');
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
      case 'Schedule':
        return <FacultyScheduleContent />;
      case 'Requests':
        return <FacultyRequestsContent initialFilter={requestFilter} />;
      case 'About':
        return <FacultyAboutContent />;
      default:
        return <FacultyDashboardContent onTabChange={handleTabChange} onStatusChange={setProfileStatus} />;
    }
  };

  return (
    <div className={`faculty-dashboard-wrapper ${isDarkMode ? 'dark' : ''} ${isHighContrast ? 'high-contrast' : ''} text-${textSize}`}>
      <style>{facultyDashStyles}</style>
      <div className="dashboard-bg-layer"></div>
      <div className="dashboard-overlay"></div>

      <nav className="faculty-navbar">
        <div className="nav-brand">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <img src={logo} alt="GCAS" />
          <span className="brand-text-full">Gordon College Appointment System</span>
          <span className="brand-text-mobile mobile-only">GCAS</span>
        </div>

        <div className="nav-links">
          {['Dashboard', 'Schedule', 'Requests', 'About'].map((tab) => (
            <button
              key={tab}
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleActiveTabSet(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="nav-user-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="edit-profile-btn" onClick={() => setIsSettingsModalOpen(true)} title="Settings">
              <Settings size={20} />
            </button>
          </div>
          
          <div className="user-profile-badge" onClick={() => {
            if (window.innerWidth <= 768) {
              setIsMobileMenuOpen(true);
            }
          }}>
            <div className="prof-info">
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{profileName || user?.displayName || 'Faculty Member'}</p>
              <p className="prof-role">{profileDept}</p>
            </div>
            <div className={`prof-avatar ${profileStatus?.toLowerCase()}`} onClick={(e) => {
              if (window.innerWidth > 768) {
                e.stopPropagation();
                openProfileModal();
              }
            }} title="Edit Profile">
              {profileAvatar ? <img src={profileAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} />}
            </div>
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
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="bottom-nav">
        {[
          { id: 'Dashboard', icon: Layout },
          { id: 'Schedule', icon: Calendar },
          { id: 'Requests', icon: Clock }
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

      <main className="faculty-main-content">
        {renderContent()}
      </main>

      {showProfileModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="modal-card" style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '16px', width: '95%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--card-border)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', textAlign: 'left', color: 'var(--text-primary)', fontSize: '1.4rem' }}>Edit Profile</h2>
            
            <label className="modal-label">Full Name</label>
            <input 
              type="text" 
              className="profile-input" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. John Doe"
            />

            <label className="modal-label">Choose Avatar</label>
            <div className="avatar-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
              {allAvatars.map((url, i) => (
                <img 
                  key={`avatar-${i}`} src={url} alt={`Avatar option ${i+1}`} 
                  className={`avatar-option ${editAvatar === url ? 'selected' : ''}`}
                  onClick={() => setEditAvatar(url)}
                />
              ))}
            </div>

            <label className="modal-label">Department / Title</label>
            <input 
              type="text" 
              className="profile-input" 
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              placeholder="e.g. CCS Faculty"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button onClick={() => setShowProfileModal(false)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveProfile} style={{ padding: '0.8rem', borderRadius: '8px', border: 'none', background: 'var(--accent-orange)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="mobile-drawer">
          <div className="drawer-header">
            <div className="nav-brand">
              <img src={logo} alt="GCAS" style={{ width: '40px' }} />
              <span style={{ fontWeight: 700, fontSize: '1.2rem' }}>GCAS</span>
            </div>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>
              <CloseIcon size={28} />
            </button>
          </div>
          <div className="drawer-links">
            <div className="mobile-profile-section">
              <div className="prof-avatar" style={{ width: '60px', height: '60px', overflow: 'hidden' }}>
                {profileAvatar ? <img src={profileAvatar} alt="avatar" style={{ width: '100%' }} /> : <User size={30} />}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{profileName}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{profileDept}</p>
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
                <Bell size={24} />
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
  );
};

export default FacultyDashboard;
