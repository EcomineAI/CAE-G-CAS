import React, { useState, useEffect } from 'react';
import { User, X, UserCircle, Briefcase, Tag, CheckCircle2, ChevronRight } from 'lucide-react';
import { PH_PREFIXES, PH_SUFFIXES, FACULTY_TITLES } from '../utils/constants';
import { updateProfile } from '../supabase/api';

const STUDENT_PREFIXES = ['Mr.', 'Ms.', 'Mrs.', 'Miss', 'Mx.'];
const STUDENT_SUFFIXES = ['Jr.', 'Sr.', 'II', 'III', 'IV'];

const pemStyles = `
.pem-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding: 1rem;
  animation: pemFadeIn 0.18s ease;
}
@keyframes pemFadeIn { from { opacity:0 } to { opacity:1 } }

.pem-card {
  background: var(--card-bg, #fff);
  width: 100%;
  max-width: 700px;
  min-height: 480px;
  max-height: 90vh;
  border-radius: 22px;
  border: 1px solid var(--border-color);
  box-shadow: 0 32px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: pemSlideUp 0.24s cubic-bezier(0.16,1,0.3,1);
}
@keyframes pemSlideUp {
  from { transform: translateY(20px) scale(0.98); opacity:0 }
  to   { transform: translateY(0)    scale(1);    opacity:1 }
}

/* ── Header ── */
.pem-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 1.6rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  background: var(--card-bg, #fff);
}
.pem-header-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--accent-light);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent, #2e4a87);
  flex-shrink: 0;
}
.pem-header-text { flex: 1; min-width: 0; }
.pem-header-text h2 {
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 1px;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}
.pem-header-text span {
  font-size: 0.72rem;
  color: var(--text-muted);
}
.pem-close {
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.pem-close:hover { background: var(--border-color); color: var(--text-primary); }

/* ── Body ── */
.pem-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ── Sidebar ── */
.pem-sidebar {
  width: 196px;
  flex-shrink: 0;
  background: var(--bg-primary, #f0f2f8);
  border-right: 1px solid var(--border-color);
  padding: 1rem 0.7rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.pem-sidebar-group { margin-bottom: 1.2rem; }
.pem-sidebar-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 0.55rem;
  margin-bottom: 0.3rem;
  display: block;
}
.pem-sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.52rem 0.65rem;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.83rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.14s;
  text-align: left;
  font-family: inherit;
  position: relative;
}
.pem-sidebar-item .pem-nav-icon {
  width: 26px; height: 26px;
  border-radius: 7px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.14s;
}
.pem-sidebar-item:hover {
  background: var(--card-bg, #fff);
  color: var(--text-primary);
}
.pem-sidebar-item:hover .pem-nav-icon {
  border-color: var(--accent, #2e4a87);
  color: var(--accent, #2e4a87);
}
.pem-sidebar-item.active {
  background: var(--accent-light);
  color: var(--accent, #2e4a87);
}
.pem-sidebar-item.active .pem-nav-icon {
  background: var(--accent, #2e4a87);
  border-color: var(--accent, #2e4a87);
  color: #fff;
}
.pem-sidebar-item .pem-nav-chevron {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.14s;
}
.pem-sidebar-item.active .pem-nav-chevron,
.pem-sidebar-item:hover .pem-nav-chevron { opacity: 0.5; }

.pem-sidebar-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0.55rem 0.8rem;
}
.pem-sidebar-spacer { flex: 1; }

.pem-sidebar-save {
  width: 100%;
  padding: 0.62rem 0.7rem;
  border-radius: 9px;
  border: none;
  background: var(--accent, #2e4a87);
  color: #fff;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
}
.pem-sidebar-save:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.pem-sidebar-save:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
.pem-sidebar-save.saved { background: #16a34a; }

.pem-sidebar-cancel {
  width: 100%;
  padding: 0.5rem 0.7rem;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.14s;
  margin-top: 0.4rem;
  text-align: center;
}
.pem-sidebar-cancel:hover { border-color: var(--accent, #2e4a87); color: var(--accent, #2e4a87); }

/* ── Right content ── */
.pem-content {
  flex: 1;
  padding: 1.4rem 1.8rem 1.8rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}
.pem-content-header { margin-bottom: 1.4rem; }
.pem-content-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 3px;
  letter-spacing: -0.3px;
}
.pem-content-sub {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
}

/* ── Section divider ── */
.pem-divider {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1.3rem 0 0.85rem;
}
.pem-divider span {
  font-size: 0.63rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.pem-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}
.pem-divider:first-of-type { margin-top: 0; }

/* ── Fields ── */
.pem-field { margin-bottom: 1rem; }
.pem-field:last-child { margin-bottom: 0; }
.pem-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 0.38rem;
}
.pem-label-hint {
  font-size: 0.68rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-left: auto;
}
.pem-input, .pem-select {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid var(--border-color);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.88rem;
  box-sizing: border-box;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}
.pem-select { cursor: pointer; }
.pem-input:focus, .pem-select:focus {
  border-color: var(--accent, #2e4a87);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.pem-input::placeholder { color: var(--text-muted); opacity: 0.6; }
.pem-input-hint {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.3rem;
  display: block;
  line-height: 1.4;
}

.pem-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
  margin-bottom: 1rem;
}
.pem-three-col {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.7rem;
  margin-bottom: 1rem;
}

/* ── Avatar card ── */
.pem-avatar-card {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.1rem 1.2rem;
  background: var(--bg-primary, #f0f2f8);
  border-radius: 14px;
  border: 1.5px solid var(--border-color);
  margin-bottom: 0.2rem;
  position: relative;
  overflow: hidden;
}
.pem-avatar-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-light) 0%, transparent 60%);
  opacity: 0.5;
  pointer-events: none;
}
.pem-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.pem-avatar-circle {
  width: 64px; height: 64px;
  border-radius: 50%;
  border: 3px solid var(--accent, #2e4a87);
  overflow: hidden;
  background: var(--card-bg, #fff);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent, #2e4a87);
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -1px;
}
.pem-avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.pem-avatar-badge {
  position: absolute;
  bottom: 1px; right: 1px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #16a34a;
  border: 2px solid var(--bg-primary, #f0f2f8);
  display: flex; align-items: center; justify-content: center;
}
.pem-avatar-details { flex: 1; min-width: 0; position: relative; }
.pem-avatar-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pem-avatar-meta {
  font-size: 0.73rem;
  color: var(--text-muted);
  margin: 0 0 6px;
}
.pem-avatar-sync {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 600;
  color: #16a34a;
  background: rgba(22,163,74,0.1);
  padding: 0.18rem 0.5rem;
  border-radius: 20px;
}

/* ── Name preview ── */
.pem-name-preview {
  padding: 0.9rem 1.1rem;
  background: var(--bg-primary, #f0f2f8);
  border: 1.5px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.pem-name-preview-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
  flex-shrink: 0;
}
.pem-name-preview-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--accent, #2e4a87);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pem-name-preview-empty {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-style: italic;
}

/* ── Notice / info box ── */
.pem-notice {
  font-size: 0.77rem;
  color: var(--text-secondary);
  padding: 0.7rem 0.9rem;
  background: var(--accent-light);
  border-radius: 10px;
  border-left: 3px solid var(--accent, #2e4a87);
  line-height: 1.5;
  margin-bottom: 1rem;
}
.pem-notice strong { color: var(--accent, #2e4a87); }

/* ── Info row (read-only display) ── */
.pem-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  background: var(--bg-primary, #f0f2f8);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  margin-bottom: 0.5rem;
}
.pem-info-row-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
}
.pem-info-row-value {
  font-size: 0.82rem;
  color: var(--text-primary);
  font-weight: 700;
}

/* ── Mobile ── */
@media (max-width: 580px) {
  .pem-card { max-width: 100%; border-radius: 18px; min-height: unset; max-height: 95vh; }
  .pem-body { flex-direction: column; }
  .pem-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 0.55rem 0.75rem;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    gap: 0.3rem;
    scrollbar-width: none;
  }
  .pem-sidebar::-webkit-scrollbar { display: none; }
  .pem-sidebar-group { display: contents; }
  .pem-sidebar-label { display: none; }
  .pem-sidebar-divider { display: none; }
  .pem-sidebar-spacer { display: none; }
  .pem-sidebar-item { width: auto; flex-shrink: 0; padding: 0.38rem 0.65rem; font-size: 0.76rem; border-radius: 20px; }
  .pem-sidebar-item .pem-nav-icon { width: 20px; height: 20px; }
  .pem-sidebar-item .pem-nav-chevron { display: none; }
  .pem-sidebar-item.active { background: var(--accent, #2e4a87); color: #fff; }
  .pem-sidebar-item.active .pem-nav-icon { background: rgba(255,255,255,0.2); border-color: transparent; color: #fff; }
  .pem-sidebar-save { display: none; }
  .pem-sidebar-cancel { display: none; }
  .pem-content { padding: 1rem 1rem 1.5rem; }
  .pem-two-col { grid-template-columns: 1fr; gap: 0.6rem; }
  .pem-three-col { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
  .pem-mobile-save {
    display: flex !important;
    position: sticky;
    bottom: 0;
    padding: 0.75rem 1rem;
    background: var(--card-bg, #fff);
    border-top: 1px solid var(--border-color);
    gap: 0.5rem;
  }
  .pem-mobile-save button { flex: 1; padding: 0.65rem; border-radius: 10px; font-family: inherit; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; }
  .pem-mobile-save .save-btn { background: var(--accent, #2e4a87); color: #fff; }
  .pem-mobile-save .cancel-btn { background: var(--bg-primary, #f0f2f8); border: 1px solid var(--border-color) !important; color: var(--text-secondary); }
}
.pem-mobile-save { display: none; }
`;

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  onSaved,
  role,
  userId,
  initialData,
  forceComplete,
}) {
  const isFaculty = role === 'faculty';

  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [prefix, setPrefix]         = useState('');
  const [suffix, setSuffix]         = useState('');
  const [firstName, setFirstName]   = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName]     = useState('');
  const [fullName, setFullName]     = useState('');
  const [dept, setDept]             = useState('');
  const [title, setTitle]           = useState('');
  const [avatarUrl, setAvatarUrl]   = useState('');

  useEffect(() => {
    if (!isOpen || !initialData) return;
    setActiveSection('profile');
    setSaved(false);
    setPrefix(initialData.name_prefix || '');
    setSuffix(initialData.name_suffix || '');
    setAvatarUrl(initialData.avatar_url || '');

    if (isFaculty) {
      setFullName(initialData.full_name || '');
      setDept(initialData.department || '');
      setTitle(initialData.title || '');
    } else {
      const name = initialData.full_name || '';
      const parts = name.split(' ').filter(Boolean);
      if (parts.length >= 3) {
        setFirstName(parts.slice(0, -2).join(' '));
        setMiddleName(parts[parts.length - 2]);
        setLastName(parts[parts.length - 1]);
      } else if (parts.length === 2) {
        setFirstName(parts[0]);
        setMiddleName('');
        setLastName(parts[1]);
      } else {
        setFirstName(name);
        setMiddleName('');
        setLastName('');
      }
    }
  }, [isOpen, initialData, isFaculty]);

  const computedName = isFaculty
    ? fullName.trim()
    : `${firstName.trim()} ${middleName.trim()} ${lastName.trim()}`.replace(/\s+/g, ' ').trim();

  const displayName = [prefix, computedName, suffix].filter(Boolean).join(' ');

  const handleSave = async () => {
    if (!isFaculty && (!firstName.trim() || !lastName.trim())) {
      import('../supabase/ux').then(({ toast }) => toast.error('First name and Last name are required.'));
      return;
    }
    setSaving(true);
    const payload = {
      full_name: computedName,
      name_prefix: prefix,
      name_suffix: suffix,
      avatar_url: avatarUrl,
      ...(isFaculty && { department: dept, title }),
    };
    const updated = await updateProfile(userId, payload);
    setSaving(false);
    if (updated) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      onSaved({ ...payload, full_name: computedName, avatar_url: avatarUrl });
      import('../supabase/ux').then(({ toast }) => toast.success('Profile updated!'));
    }
  };

  if (!isOpen) return null;

  const NAV = [
    {
      group: 'PROFILE',
      items: [
        { id: 'profile', label: 'Profile Info', icon: UserCircle },
        { id: 'name',    label: 'Name & Title', icon: Tag },
      ],
    },
    ...(isFaculty ? [{
      group: 'WORK',
      items: [
        { id: 'professional', label: 'Professional', icon: Briefcase },
      ],
    }] : []),
  ];

  const renderContent = () => {
    switch (activeSection) {

      case 'profile':
        return (
          <>
            <div className="pem-content-header">
              <p className="pem-content-title">Profile Info</p>
              <p className="pem-content-sub">How you appear across the system</p>
            </div>

            <div className="pem-avatar-card">
              <div className="pem-avatar-wrap">
                <div className="pem-avatar-circle">
                  {getInitials(computedName) || <User size={26} strokeWidth={1.5} />}
                </div>
                <div className="pem-avatar-badge">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className="pem-avatar-details">
                <p className="pem-avatar-name">{displayName || 'Your Name'}</p>
                <p className="pem-avatar-meta">{isFaculty ? (dept || 'No department set') : 'Student'}</p>
                <span className="pem-avatar-sync">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 2v6h-6M3 12a9 9 0 0115-6.7L21 8M3 22v-6h6M21 12a9 9 0 01-15 6.7L3 16"/>
                  </svg>
                  Synced from Google
                </span>
              </div>
            </div>

            <div className="pem-divider"><span>Account Details</span></div>

            <div className="pem-info-row">
              <span className="pem-info-row-label">Role</span>
              <span className="pem-info-row-value" style={{ textTransform: 'capitalize' }}>{role}</span>
            </div>
            <div className="pem-info-row">
              <span className="pem-info-row-label">Display Name</span>
              <span className="pem-info-row-value" style={{ color: 'var(--accent, #2e4a87)' }}>{displayName || '—'}</span>
            </div>
            {isFaculty && title && (
              <div className="pem-info-row">
                <span className="pem-info-row-label">Title</span>
                <span className="pem-info-row-value">{title}</span>
              </div>
            )}

            {!isFaculty && (
              <div className="pem-notice" style={{ marginTop: '1rem' }}>
                Use your real legal name. <strong>Faculty see your student number alongside your name</strong> when reviewing your requests.
              </div>
            )}
          </>
        );

      case 'name':
        return (
          <>
            <div className="pem-content-header">
              <p className="pem-content-title">Name &amp; Title</p>
              <p className="pem-content-sub">{isFaculty ? 'How your name appears to students' : 'Your full legal name'}</p>
            </div>

            <div className="pem-name-preview">
              <span className="pem-name-preview-label">Preview</span>
              {displayName
                ? <span className="pem-name-preview-value">{displayName}</span>
                : <span className="pem-name-preview-empty">Fill in your name below…</span>
              }
            </div>

            <div className="pem-divider"><span>Honorifics</span></div>
            <div className="pem-two-col">
              <div className="pem-field">
                <label className="pem-label">
                  Prefix
                  {prefix && <span className="pem-label-hint" style={{ color: 'var(--accent, #2e4a87)' }}>{prefix}</span>}
                </label>
                {isFaculty ? (
                  <select className="pem-select" value={prefix} onChange={e => setPrefix(e.target.value)}>
                    <option value="">None</option>
                    {Object.entries(PH_PREFIXES).map(([group, list]) => (
                      <optgroup key={group} label={group}>
                        {list.map(p => <option key={p} value={p}>{p}</option>)}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <select className="pem-select" value={prefix} onChange={e => setPrefix(e.target.value)}>
                    <option value="">None</option>
                    {STUDENT_PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>
              <div className="pem-field">
                <label className="pem-label">
                  Suffix
                  {suffix && <span className="pem-label-hint" style={{ color: 'var(--accent, #2e4a87)' }}>{suffix}</span>}
                </label>
                {isFaculty ? (
                  <select className="pem-select" value={suffix} onChange={e => setSuffix(e.target.value)}>
                    <option value="">None</option>
                    {Object.entries(PH_SUFFIXES).map(([group, list]) => (
                      <optgroup key={group} label={group}>
                        {list.map(s => <option key={s} value={s}>{s}</option>)}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <select className="pem-select" value={suffix} onChange={e => setSuffix(e.target.value)}>
                    <option value="">None</option>
                    {STUDENT_SUFFIXES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
            </div>

            <div className="pem-divider"><span>{isFaculty ? 'Full Name' : 'Name'}</span></div>
            {isFaculty ? (
              <div className="pem-field">
                <label className="pem-label">Display Name</label>
                <input
                  type="text"
                  className="pem-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                />
                <span className="pem-input-hint">This is shown on all appointments and the faculty directory.</span>
              </div>
            ) : (
              <>
                <div className="pem-three-col">
                  <div className="pem-field" style={{ marginBottom: 0 }}>
                    <label className="pem-label">First</label>
                    <input type="text" className="pem-input" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Juan" />
                  </div>
                  <div className="pem-field" style={{ marginBottom: 0 }}>
                    <label className="pem-label">
                      Middle
                      <span className="pem-label-hint">optional</span>
                    </label>
                    <input type="text" className="pem-input" value={middleName} onChange={e => setMiddleName(e.target.value)} placeholder="M." />
                  </div>
                  <div className="pem-field" style={{ marginBottom: 0 }}>
                    <label className="pem-label">Last</label>
                    <input type="text" className="pem-input" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Dela Cruz" />
                  </div>
                </div>
              </>
            )}
          </>
        );

      case 'professional':
        return (
          <>
            <div className="pem-content-header">
              <p className="pem-content-title">Professional</p>
              <p className="pem-content-sub">Your academic role and department</p>
            </div>

            <div className="pem-divider"><span>Academic Role</span></div>
            <div className="pem-field">
              <label className="pem-label">Professional Title</label>
              <select className="pem-select" value={title} onChange={e => setTitle(e.target.value)}>
                <option value="">None / Not set</option>
                {Object.entries(FACULTY_TITLES).map(([group, list]) => (
                  <optgroup key={group} label={group}>
                    {list.map(t => <option key={t} value={t}>{t}</option>)}
                  </optgroup>
                ))}
              </select>
              <span className="pem-input-hint">Shown in the faculty directory and on appointment receipts.</span>
            </div>

            <div className="pem-divider"><span>Department</span></div>
            <div className="pem-field">
              <label className="pem-label">Department / College</label>
              <input
                type="text"
                className="pem-input"
                value={dept}
                onChange={e => setDept(e.target.value)}
                placeholder="e.g. College of Computing"
              />
              <span className="pem-input-hint">Students see this when browsing the faculty directory.</span>
            </div>

            {(title || dept) && (
              <>
                <div className="pem-divider"><span>Summary</span></div>
                <div className="pem-info-row">
                  <span className="pem-info-row-label">Will appear as</span>
                  <span className="pem-info-row-value" style={{ color: 'var(--accent, #2e4a87)' }}>
                    {[title, dept].filter(Boolean).join(' · ') || '—'}
                  </span>
                </div>
              </>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>{pemStyles}</style>
      <div className="pem-overlay" onClick={forceComplete ? undefined : onClose}>
        <div className="pem-card" onClick={e => e.stopPropagation()}>

          <div className="pem-header">
            <div className="pem-header-icon"><UserCircle size={17} /></div>
            <div className="pem-header-text">
              <h2>{forceComplete ? 'Complete Your Profile' : 'Edit Profile'}</h2>
              <span>{forceComplete ? 'Set up your account before continuing' : 'Manage your personal information'}</span>
            </div>
            {!forceComplete && (
              <button className="pem-close" onClick={onClose}><X size={15} /></button>
            )}
          </div>

          <div className="pem-body">
            <div className="pem-sidebar">
              {NAV.map((group, gi) => (
                <div className="pem-sidebar-group" key={group.group}>
                  <span className="pem-sidebar-label">{group.group}</span>
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      className={`pem-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <span className="pem-nav-icon"><item.icon size={13} /></span>
                      {item.label}
                      <ChevronRight size={12} className="pem-nav-chevron" />
                    </button>
                  ))}
                  {gi < NAV.length - 1 && <div className="pem-sidebar-divider" />}
                </div>
              ))}

              <div className="pem-sidebar-spacer" />

              <button
                className={`pem-sidebar-save ${saved ? 'saved' : ''}`}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.7s linear infinite' }}>
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Saving…
                  </>
                ) : saved ? (
                  <><CheckCircle2 size={13} /> Saved!</>
                ) : (
                  'Save Changes'
                )}
              </button>
              {!forceComplete && (
                <button className="pem-sidebar-cancel" onClick={onClose}>Cancel</button>
              )}
            </div>

            <div className="pem-content">
              {renderContent()}
            </div>
          </div>

          <div className="pem-mobile-save">
            <button className="cancel-btn" onClick={onClose} style={{ display: forceComplete ? 'none' : undefined }}>Cancel</button>
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
