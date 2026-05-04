import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, ensureProfile } from '../../supabase/supabase';
import { getProfile } from '../../supabase/api';
import { Layout, Calendar, Clock, Bell, User, Moon, Sun, ChevronDown, CheckCircle, AlertCircle, XCircle, Settings, Menu, X as CloseIcon } from 'lucide-react';
import FacultyDashboardContent from './FacultyDashboardContent';
import FacultyScheduleContent from './FacultyScheduleContent';
import FacultyRequestsContent from './FacultyRequestsContent';
import FacultyAboutContent from './FacultyAboutContent';
import { useAuth } from '../../hooks/useAuth';
import logo from '../logo.png';

const facultyDashStyles = `
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

.faculty-dashboard-wrapper.dark {
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

.faculty-dashboard-wrapper {
  min-height: 100vh;
  background-color: var(--bg-primary);
  background-image: radial-gradient(var(--border-color) 1px, transparent 1px);
  background-size: 30px 30px;
  font-family: 'Inter', sans-serif;
  color: var(--text-primary);
}

.faculty-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 2rem;
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
}

.nav-brand img {
  width: 40px;
  height: auto;
}

.brand-text-full {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-muted);
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-link {
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
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.faculty-main-content {
  max-width: 1050px;
  margin: 0 auto;
  padding: 3.5rem 1.5rem;
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

@media (max-width: 900px) {
  .faculty-navbar {
    padding: 0.6rem 1rem;
    overflow-x: auto;
    justify-content: flex-start;
    gap: 1.5rem;
    white-space: nowrap;
    scrollbar-width: none;
  }
  .faculty-navbar::-webkit-scrollbar { display: none; }
  .brand-text-full { display: none; }
  .nav-user-section { margin-left: auto; }
  .prof-info { display: none; }
  .nav-links { display: none; }
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
`;

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [requestFilter, setRequestFilter] = useState('Pending');
  const [profileName, setProfileName] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileDept, setProfileDept] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editDept, setEditDept] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  // 20 clean, modern avatars using Lorelei style (no specific gender labels or cultural identifiers)
  const allAvatars = Array.from({ length: 20 }, (_, i) => `https://api.dicebear.com/7.x/lorelei/svg?seed=Prof${i + 1}&backgroundColor=e5e7eb,f3f4f6`);

  useEffect(() => {
    if (!user) return;
    // Ensure profile exists (handles pre-trigger users)
    ensureProfile();
    // Load profile for display name
    getProfile(user.id).then(p => {
      if (p) {
        setProfileName(p.full_name || user.displayName || 'Faculty Member');
        setProfileAvatar(p.avatar_url || user.avatarUrl);
        setProfileDept(p.department || 'CCS');
      }
    });
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
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleTabChange = (tab, filter = null) => {
    setActiveTab(tab);
    if (filter) setRequestFilter(filter);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <FacultyDashboardContent onTabChange={handleTabChange} />;
      case 'Schedule': return <FacultyScheduleContent />;
      case 'Requests': return <FacultyRequestsContent initialFilter={requestFilter} />;
      case 'About': return <FacultyAboutContent />;
      default: return <FacultyDashboardContent onTabChange={handleTabChange} />;
    }
  };

  return (
    <div className={`faculty-dashboard-wrapper ${isDarkMode ? 'dark' : ''}`}>
      <style>{facultyDashStyles}</style>
      
      <nav className="faculty-navbar">
        <div className="nav-brand">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <img src={logo} alt="GCAS" />
          <span className="brand-text-full">Gordon College Appointment System</span>
        </div>

        <div className="nav-links">
          {['Dashboard', 'Schedule', 'Requests', 'About'].map((tab) => (
            <button
              key={tab}
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="nav-user-section">
          <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="user-profile-badge">
            <div className="prof-info">
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{profileName || user?.displayName || 'Faculty Member'}</p>
              <p className="prof-role">{profileDept}</p>
            </div>
            <div className="prof-avatar" style={{ overflow: 'hidden' }} onClick={openProfileModal} title="Edit Profile">
              {profileAvatar ? <img src={profileAvatar} alt="avatar" style={{ width: '100%' }} /> : <User size={20} />}
            </div>
            <button className="edit-profile-btn" onClick={openProfileModal} title="Settings">
              <Settings size={16} />
            </button>
          </div>

          <button 
            onClick={handleLogout}
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
            {['Dashboard', 'Schedule', 'Requests', 'About'].map((tab) => (
              <button
                key={tab}
                className={`drawer-link ${activeTab === tab ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab);
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
    </div>
  );
};

export default FacultyDashboard;
