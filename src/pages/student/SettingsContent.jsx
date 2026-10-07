import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabase';
import { updateProfile } from '../../supabase/api';

const Toggle = ({ checked, onChange, disabled }) => (
  <div
    onClick={disabled ? undefined : onChange}
    style={{
      width: 44, height: 24, borderRadius: 12, flexShrink: 0,
      background: checked ? '#1a2d5a' : '#d1d5db',
      position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 0.2s', opacity: disabled ? 0.5 : 1,
    }}
  >
    <div style={{
      position: 'absolute', top: 3, left: checked ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s',
    }} />
  </div>
);

const Row = ({ label, sub, checked, onChange, disabled }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.85rem 0', borderBottom: '1px solid var(--border-color, #e5e8f0)',
  }}>
    <div>
      <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</p>
      {sub && <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</p>}
    </div>
    <Toggle checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

const InfoRow = ({ label, value, badge }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.75rem 0', borderBottom: '1px solid var(--border-color, #e5e8f0)',
  }}>
    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {badge && (
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.55rem',
          borderRadius: 6, background: '#e8eef8', color: '#1a2d5a', border: '1px solid #c5cde0',
        }}>{badge}</span>
      )}
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  </div>
);

const SectionCard = ({ title, sub, children }) => (
  <div style={{
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--card-border, #e5e8f0)',
    borderRadius: 12, padding: '1rem 1.3rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <p style={{ margin: '0 0 0.15rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</p>
    {sub && <p style={{ margin: '0 0 0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</p>}
    {children}
  </div>
);

const SubLabel = ({ children }) => (
  <p style={{
    margin: '0.85rem 0 0', fontSize: '0.68rem', fontWeight: 800,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2e4a87',
  }}>{children}</p>
);

const TOPICS = ['Subject concern', 'Grades concern', 'Others (specify below)'];

const DEFAULT_PREFS = {
  inAppNotif: true,
  emailApproved: true,
  emailDeclined: true,
  emailCancelled: true,
  emailReminder: true,
  defaultTopic: 'Subject concern',
  googleCalendar: false,
};

const SettingsContent = ({ profileData, userId, userEmail, isDarkMode, setIsDarkMode, onLogout, onProfileSaved }) => {
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savedPrefs, setSavedPrefs] = useState(DEFAULT_PREFS);
  const [contact, setContact] = useState(profileData?.contact || '');
  const [savedContact, setSavedContact] = useState(profileData?.contact || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | null

  useEffect(() => {
    if (!userId) return;
    supabase.from('student_prefs').select('*').eq('user_id', userId).single().then(({ data }) => {
      if (data) {
        const merged = { ...DEFAULT_PREFS, ...data };
        setPrefs(merged);
        setSavedPrefs(merged);
      }
    });
  }, [userId]);

  useEffect(() => {
    const c = profileData?.contact || '';
    setContact(c);
    setSavedContact(c);
  }, [profileData]);

  const isDirty =
    contact !== savedContact ||
    JSON.stringify(prefs) !== JSON.stringify(savedPrefs);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from('student_prefs').upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' }),
      updateProfile(userId, { contact }),
    ]);
    setSaving(false);
    setSavedPrefs(prefs);
    setSavedContact(contact);
    setSaveStatus('saved');
    if (onProfileSaved) onProfileSaved({ contact });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCancel = () => {
    setContact(savedContact);
    setPrefs(savedPrefs);
    setSaveStatus(null);
  };

  const name = profileData?.full_name || '—';
  const email = userEmail || profileData?.email || '';
  const studentNumber = email ? email.split('@')[0] : '—';
  const program = profileData?.program || '—';
  const section = profileData?.section || '—';
  const programSection = [program, section].filter(Boolean).filter(v => v !== '—').join(' ') || '—';

  return (
    <>
      <style>{`
        .sc-wrap { display: flex; flex-direction: column; max-width: 700px; }
        .sc-page-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
        .sc-page-sub { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1.2rem; }
        .sc-contact-input {
          width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px;
          border: 1.5px solid var(--border-color, #d1d5db);
          background: var(--bg-primary, #f0f2f8);
          color: var(--text-primary); font-family: inherit; font-size: 0.9rem;
          outline: none; box-sizing: border-box; transition: border-color 0.15s;
          margin-top: 0.4rem;
        }
        .sc-contact-input:focus { border-color: #1a2d5a; }
        .sc-topic-select {
          width: 100%; padding: 0.65rem 0.9rem; border-radius: 8px;
          border: 1.5px solid var(--border-color, #d1d5db);
          background: var(--bg-primary, #f0f2f8);
          color: var(--text-primary); font-family: inherit; font-size: 0.9rem;
          outline: none; cursor: pointer; margin-top: 0.6rem;
        }
        .sc-privacy-row {
          display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.3rem;
        }
        .sc-privacy-chip {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.78rem; font-weight: 600;
        }
        .sc-dot { width: 8px; height: 8px; border-radius: 50%; }
        .sc-footer {
          display: flex; justify-content: flex-end; gap: 0.75rem;
          padding-top: 0.5rem;
        }
        .sc-btn-cancel {
          padding: 0.6rem 1.4rem; border-radius: 9px;
          border: 1.5px solid var(--border-color, #d1d5db);
          background: transparent; color: var(--text-secondary);
          font-weight: 600; font-size: 0.9rem; cursor: pointer; font-family: inherit;
          transition: border-color 0.15s;
        }
        .sc-btn-cancel:hover { border-color: #1a2d5a; color: #1a2d5a; }
        .sc-btn-save {
          padding: 0.6rem 1.6rem; border-radius: 9px;
          border: none; background: #1a2d5a; color: #fff;
          font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: inherit;
          transition: background 0.15s, opacity 0.15s;
        }
        .sc-btn-save:hover { background: #152348; }
        .sc-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

        .sc-change-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.65rem 1rem; border-radius: 10px; margin-bottom: 0.75rem;
          font-size: 0.85rem; font-weight: 600;
          animation: scBarIn 0.2s ease;
        }
        @keyframes scBarIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        .sc-change-bar.dirty {
          background: #fff8e1; border: 1.5px solid #ffe082; color: #92400e;
        }
        .sc-change-bar.saved {
          background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #166534;
        }
      `}</style>

      <div className="sc-wrap">
        <p className="sc-page-title">Settings</p>
        <p className="sc-page-sub">Your profile and notification preferences</p>

        {/* Profile */}
        <SectionCard title="Profile" sub="How you appear to faculty. Synced from your Google account.">
          <InfoRow label="Name" value={name} badge="Google" />
          <InfoRow label="Student number" value={studentNumber} />
          <InfoRow label="Program and section" value={programSection} />
          <div style={{ padding: '0.75rem 0' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Contact number
            </span>
            <p style={{ margin: '0.05rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Optional</p>
            <input
              className="sc-contact-input"
              type="tel"
              placeholder="e.g. 0917 123 4567"
              value={contact}
              onChange={e => setContact(e.target.value)}
            />
          </div>
        </SectionCard>

        {/* Preferences */}
        <SectionCard title="Preferences" sub="How you want to be notified and how you book.">
          <SubLabel>In-App (Bell)</SubLabel>
          <Row
            label="In-app notifications"
            sub="Approvals, declines, and cancellations always appear in the bell."
            checked={prefs.inAppNotif}
            onChange={() => toggle('inAppNotif')}
            disabled
          />

          <SubLabel>Email</SubLabel>
          <Row label="Request approved"   checked={prefs.emailApproved}  onChange={() => toggle('emailApproved')} />
          <Row label="Request declined"   checked={prefs.emailDeclined}  onChange={() => toggle('emailDeclined')} />
          <Row
            label="Cancelled by faculty"
            sub="Always on so you never miss a change."
            checked={prefs.emailCancelled}
            onChange={() => toggle('emailCancelled')}
            disabled
          />
          <Row label="Reminder 1 day before" checked={prefs.emailReminder} onChange={() => toggle('emailReminder')} />

          <SubLabel>Booking</SubLabel>
          <div style={{ paddingTop: '0.4rem' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Default consultation topic
            </p>
            <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pre-selected when you book.
            </p>
            <select
              className="sc-topic-select"
              value={prefs.defaultTopic}
              onChange={e => setPrefs(p => ({ ...p, defaultTopic: e.target.value }))}
            >
              {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Row
            label="Add approved appointments to Google Calendar"
            checked={prefs.googleCalendar}
            onChange={() => toggle('googleCalendar')}
          />
        </SectionCard>

        {/* Privacy */}
        <SectionCard title="Privacy" sub="Faculty see your student number alongside your name when reviewing requests.">
          <div className="sc-privacy-row">
            <span className="sc-privacy-chip">
              <span className="sc-dot" style={{ background: '#00c853' }} />
              <span style={{ color: '#166534', fontWeight: 600 }}>Visible: name, student number, section, request notes</span>
            </span>
            <span className="sc-privacy-chip">
              <span className="sc-dot" style={{ background: '#ff1744' }} />
              <span style={{ color: '#991b1b', fontWeight: 600 }}>Hidden: email, contact number</span>
            </span>
          </div>
        </SectionCard>

        {/* Change banner */}
        {(isDirty || saveStatus === 'saved') && (
          <div className={`sc-change-bar ${saveStatus === 'saved' ? 'saved' : 'dirty'}`}>
            <span>
              {saveStatus === 'saved'
                ? '✓ Changes saved successfully.'
                : '● You have unsaved changes.'}
            </span>
            {saveStatus !== 'saved' && (
              <span style={{ fontSize: '0.78rem', fontWeight: 500, opacity: 0.7 }}>
                Save or cancel to discard.
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="sc-footer">
          <button className="sc-btn-cancel" onClick={handleCancel} disabled={!isDirty && saveStatus !== 'saved'}>
            Cancel
          </button>
          <button className="sc-btn-save" onClick={handleSave} disabled={saving || !isDirty}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsContent;
