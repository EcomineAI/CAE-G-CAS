import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabase';
import { updateProfile } from '../supabase/api';
import { FlaskConical, Type, CheckCircle2 } from 'lucide-react';

const styles = `
.ss-wrap { display: flex; flex-direction: column; max-width: 700px; width: 100%; }
.ss-page-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
.ss-page-sub   { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1.2rem; }

.ss-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 12px; padding: 1rem 1.3rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.ss-card-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
.ss-card-sub   { font-size: 0.78rem; color: var(--text-muted); margin: 0 0 0.85rem; }
.ss-card-sub-none { margin-bottom: 0; }

/* Info row */
.ss-info-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.75rem 0; border-bottom: 1px solid var(--border-color, #e5e8f0);
}
.ss-info-row:last-child { border-bottom: none; }
.ss-info-label { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
.ss-info-value { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
.ss-badge {
  font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.55rem;
  border-radius: 6px; background: #e8eef8; color: #1a2d5a; border: 1px solid #c5cde0;
}

/* Toggle row */
.ss-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.85rem 0; border-bottom: 1px solid var(--border-color, #e5e8f0);
}
.ss-row:last-child { border-bottom: none; }
.ss-row-label { font-size: 0.92rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.ss-row-sub   { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

/* Toggle switch */
.ss-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.ss-switch input { opacity: 0; width: 0; height: 0; }
.ss-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: var(--border-color, #d1d5db); border-radius: 24px; transition: 0.22s;
}
.ss-slider::before {
  content: ''; position: absolute;
  width: 18px; height: 18px; left: 3px; bottom: 3px;
  background: #fff; border-radius: 50%; transition: 0.22s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.ss-switch input:checked + .ss-slider { background: #1a2d5a; }
.ss-switch input:checked + .ss-slider::before { transform: translateX(20px); }
.ss-switch input:disabled + .ss-slider { opacity: 0.5; cursor: not-allowed; }

/* Sub label */
.ss-sub-label {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em;
  text-transform: uppercase; color: #2e4a87; margin: 0.85rem 0 0;
}

/* Select */
.ss-select-wrap { position: relative; }
.ss-select {
  width: 140px; padding: 0.5rem 2rem 0.5rem 0.75rem;
  border-radius: 8px; border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary); font-family: inherit; font-size: 0.88rem;
  outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
}
.ss-select-chevron {
  position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
  pointer-events: none; color: var(--text-muted); font-size: 0.75rem;
}
.ss-topic-select {
  width: 100%; padding: 0.65rem 0.9rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary); font-family: inherit; font-size: 0.9rem;
  outline: none; cursor: pointer; margin-top: 0.6rem;
}

/* Contact input */
.ss-input {
  width: 100%; padding: 0.6rem 0.8rem; border-radius: 8px;
  border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary); font-family: inherit; font-size: 0.9rem;
  outline: none; box-sizing: border-box; transition: border-color 0.15s;
  margin-top: 0.4rem;
}
.ss-input:focus { border-color: #1a2d5a; }

/* Privacy chips */
.ss-privacy-row { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.3rem; }
.ss-privacy-chip { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 600; }
.ss-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Text size grid */
.ss-size-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.65rem; margin-top: 0.75rem; }
.ss-size-card {
  display: flex; flex-direction: column; align-items: center; gap: 0.45rem;
  padding: 1rem 0.5rem; background: var(--bg-primary,#f0f2f8);
  border: 1.5px solid var(--border-color,#e5e8f0); border-radius: 11px;
  cursor: pointer; transition: all 0.14s; font-family: inherit;
  color: var(--text-secondary); position: relative;
}
.ss-size-card:hover { border-color: #1a2d5a; color: #1a2d5a; }
.ss-size-card.active { background: #1a2d5a; border-color: #1a2d5a; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.14); }
.ss-size-label { font-size: 0.75rem; font-weight: 800; }
.ss-size-px    { font-size: 0.63rem; opacity: 0.6; }
.ss-size-check { position: absolute; top: 6px; right: 6px; opacity: 0; }
.ss-size-card.active .ss-size-check { opacity: 1; }

/* Footer */
.ss-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.5rem; }
.ss-btn-cancel {
  padding: 0.6rem 1.4rem; border-radius: 9px;
  border: 1.5px solid var(--border-color,#d1d5db);
  background: transparent; color: var(--text-secondary);
  font-weight: 600; font-size: 0.9rem; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.ss-btn-cancel:hover { border-color: #1a2d5a; color: #1a2d5a; }
.ss-btn-cancel:disabled { opacity: 0.45; cursor: not-allowed; }
.ss-btn-save {
  padding: 0.6rem 1.6rem; border-radius: 9px;
  border: none; background: #1a2d5a; color: #fff;
  font-weight: 700; font-size: 0.9rem; cursor: pointer; font-family: inherit;
  transition: opacity 0.15s;
}
.ss-btn-save:hover { opacity: 0.88; }
.ss-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

/* Change bar */
.ss-change-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.65rem 1rem; border-radius: 10px; margin-bottom: 0.75rem;
  font-size: 0.85rem; font-weight: 600;
  animation: ssBarIn 0.2s ease;
}
@keyframes ssBarIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
.ss-change-bar.dirty { background: #fff8e1; border: 1.5px solid #ffe082; color: #92400e; }
.ss-change-bar.saved { background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #166534; }

/* Experimental card */
.ss-card-exp {
  background: var(--card-bg,#fff);
  border: 1.5px dashed #f59e0b;
  border-radius: 12px; padding: 1rem 1.3rem;
  margin-bottom: 1rem;
}
.ss-exp-header { display: flex; align-items: center; gap: 0.55rem; margin-bottom: 0.25rem; }
.ss-exp-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: #fef3c7; border: 1px solid #fde68a;
  display: flex; align-items: center; justify-content: center;
  color: #d97706; flex-shrink: 0;
}
.ss-exp-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.ss-exp-badge {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.07em;
  text-transform: uppercase; color: #d97706;
  background: #fef3c7; border: 1px solid #fde68a;
  padding: 0.15rem 0.5rem; border-radius: 20px;
}
.ss-exp-master-row {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 0.85rem; margin-bottom: 0.85rem;
  border-bottom: 1.5px solid #fde68a;
}
.ss-exp-master-label { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
.ss-exp-master-sub   { font-size: 0.73rem; color: var(--text-muted); margin: 0; }
.ss-switch-exp input:checked + .ss-slider { background: #f59e0b; }
.ss-exp-body { transition: opacity 0.2s, filter 0.2s; }
.ss-exp-body.disabled { opacity: 0.38; pointer-events: none; filter: grayscale(0.4); }
.ss-exp-sub { font-size: 0.76rem; color: var(--text-muted); margin: 0 0 0.1rem; line-height: 1.5; }
.ss-row-exp {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 0; border-bottom: 1px solid var(--border-color,#e5e8f0);
}
.ss-row-exp:last-child { border-bottom: none; }
.ss-exp-row-label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.ss-exp-row-sub   { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
.ss-exp-pill {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.05em;
  text-transform: uppercase; color: #d97706;
  background: #fef3c7; border: 1px solid #fde68a;
  padding: 0.1rem 0.4rem; border-radius: 10px;
  margin-left: 0.4rem; vertical-align: middle;
}
.ss-exp-warning {
  display: flex; align-items: flex-start; gap: 0.5rem;
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: 8px; padding: 0.55rem 0.75rem;
  font-size: 0.75rem; color: #92400e; line-height: 1.5; margin-top: 0.5rem;
}
.ss-exp-warning-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; margin-top: 4px; }
`;

const SSwitch = ({ checked, onChange, disabled, amber }) => (
  <label className={`ss-switch${amber ? ' ss-switch-exp' : ''}`} onClick={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="ss-slider" />
  </label>
);

const SRow = ({ label, sub, checked, onChange, disabled }) => (
  <div className="ss-row">
    <div>
      <p className="ss-row-label">{label}</p>
      {sub && <p className="ss-row-sub">{sub}</p>}
    </div>
    <SSwitch checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

const InfoRow = ({ label, value, badge }) => (
  <div className="ss-info-row">
    <span className="ss-info-label">{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {badge && <span className="ss-badge">{badge}</span>}
      <span className="ss-info-value">{value || '—'}</span>
    </div>
  </div>
);

const STUDENT_TOPICS = ['Subject concern', 'Grades concern', 'Others (specify below)'];

const DEFAULT_PREFS = {
  inAppNotif: true,
  emailApproved: true,
  emailDeclined: true,
  emailCancelled: true,
  emailReminder: true,
  defaultTopic: 'Subject concern',
  googleCalendar: false,
};

const SharedSettingsContent = ({
  role = 'student',          // 'student' | 'faculty'
  profileData,
  userId,
  userEmail,
  textSize, setTextSize,
  accessibilityPrefs = {}, updateAccessibilityPref = () => {},
  onProfileSaved,
}) => {
  const isFaculty = role === 'faculty';
  const prefsTable = isFaculty ? 'faculty_prefs' : 'student_prefs';

  // ── Profile / contact ──
  const [contact, setContact] = useState(profileData?.contact || '');
  const [savedContact, setSavedContact] = useState(profileData?.contact || '');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // ── Notification prefs ──
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [savedPrefs, setSavedPrefs] = useState(DEFAULT_PREFS);

  // ── Faculty booking rules (localStorage, UI only for now) ──
  const [minNotice, setMinNotice] = useState(() => localStorage.getItem('gcas_fac_min_notice') || '2 hours');
  const [bookingWindow, setBookingWindow] = useState(() => localStorage.getItem('gcas_fac_booking_window') || '2 weeks');

  // ── Experimental (faculty only) ──
  const [expEnabled, setExpEnabled] = useState(() => localStorage.getItem('gcas_exp_enabled') === 'true');
  const [maxPerDay, setMaxPerDay] = useState(() => localStorage.getItem('gcas_exp_max_per_day') || '5');
  const [reminderBefore, setReminderBefore] = useState(() => localStorage.getItem('gcas_exp_reminder') || 'off');
  const [vacationMode, setVacationMode] = useState(() => localStorage.getItem('gcas_exp_vacation') === 'true');
  const [defaultMode, setDefaultMode] = useState(() => localStorage.getItem('gcas_exp_default_mode') || 'In-person');

  useEffect(() => {
    if (!userId) return;
    supabase.from(prefsTable).select('*').eq('user_id', userId).single().then(({ data }) => {
      if (data) { const m = { ...DEFAULT_PREFS, ...data }; setPrefs(m); setSavedPrefs(m); }
    });
  }, [userId]);

  useEffect(() => {
    const c = profileData?.contact || '';
    setContact(c); setSavedContact(c);
  }, [profileData]);

  const isDirty = contact !== savedContact || JSON.stringify(prefs) !== JSON.stringify(savedPrefs);
  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from(prefsTable).upsert({ user_id: userId, ...prefs }, { onConflict: 'user_id' }),
      updateProfile(userId, { contact }),
    ]);
    setSaving(false);
    setSavedPrefs(prefs); setSavedContact(contact);
    setSaveStatus('saved');
    if (onProfileSaved) onProfileSaved({ contact });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCancel = () => { setContact(savedContact); setPrefs(savedPrefs); setSaveStatus(null); };

  // Profile fields
  const name = profileData?.full_name || '—';
  const email = userEmail || profileData?.email || '';
  const idFromEmail = email ? email.split('@')[0] : '—';
  const program = profileData?.program || '—';
  const section = profileData?.section || '—';
  const department = profileData?.department || '—';
  const programSection = [program, section].filter(Boolean).filter(v => v !== '—').join(' ') || '—';

  return (
    <>
      <style>{styles}</style>
      <div className="ss-wrap">
        <p className="ss-page-title">Settings</p>
        <p className="ss-page-sub">
          {isFaculty ? 'Booking rules and notification preference' : 'Your profile and notification preferences'}
        </p>

        {/* ── Profile ── */}
        <div className="ss-card">
          <p className="ss-card-title">Profile</p>
          <p className="ss-card-sub">
            {isFaculty ? 'How students see you.' : 'How you appear to faculty. Synced from your Google account.'}
          </p>
          <InfoRow label="Name" value={name} badge={isFaculty ? undefined : 'Google'} />
          {isFaculty
            ? <InfoRow label="Faculty ID" value={idFromEmail} />
            : <InfoRow label="Student number" value={idFromEmail} />
          }
          {isFaculty
            ? <InfoRow label="Department" value={department} />
            : <InfoRow label="Program and section" value={programSection} />
          }
          <div style={{ padding: '0.75rem 0' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Contact number</span>
            <p style={{ margin: '0.05rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Optional</p>
            <input className="ss-input" type="tel" placeholder="e.g. 0917 123 4567" value={contact} onChange={e => setContact(e.target.value)} />
          </div>
        </div>

        {/* ── Faculty: Booking rules ── */}
        {isFaculty && (
          <div className="ss-card">
            <p className="ss-card-title">Booking rules</p>
            <p className="ss-card-sub">These apply to what students can book.</p>
            <div className="ss-row">
              <div>
                <p className="ss-row-label">Minimum notice</p>
                <p className="ss-row-sub">Students can't book slots that start sooner than this.</p>
              </div>
              <div className="ss-select-wrap">
                <select className="ss-select" value={minNotice} onChange={e => { setMinNotice(e.target.value); localStorage.setItem('gcas_fac_min_notice', e.target.value); }}>
                  {['None','30 mins','1 hour','2 hours','1 day'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <span className="ss-select-chevron">▾</span>
              </div>
            </div>
            <div className="ss-row" style={{ borderBottom: 'none' }}>
              <div>
                <p className="ss-row-label">Booking window</p>
                <p className="ss-row-sub">How far ahead students can book.</p>
              </div>
              <div className="ss-select-wrap">
                <select className="ss-select" value={bookingWindow} onChange={e => { setBookingWindow(e.target.value); localStorage.setItem('gcas_fac_booking_window', e.target.value); }}>
                  {['3 days','1 week','2 weeks','1 month'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <span className="ss-select-chevron">▾</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Preferences ── */}
        <div className="ss-card">
          <p className="ss-card-title">Preferences</p>
          <p className="ss-card-sub ss-card-sub-none"></p>

          <p className="ss-sub-label" style={{ marginTop: 0 }}>In-App (Bell)</p>
          <SRow
            label="In-app notifications"
            sub={isFaculty ? 'Show new requests and cancellations in the bell.' : 'Approvals, declines, and cancellations always appear in the bell.'}
            checked={prefs.inAppNotif}
            onChange={() => toggle('inAppNotif')}
            disabled
          />

          <p className="ss-sub-label">Email</p>
          <SRow label="Request approved"  checked={prefs.emailApproved}  onChange={() => toggle('emailApproved')} />
          <SRow label="Request declined"  checked={prefs.emailDeclined}  onChange={() => toggle('emailDeclined')} />
          <SRow
            label={isFaculty ? 'Cancelled by student' : 'Cancelled by faculty'}
            sub="Always on so you never miss a change."
            checked={prefs.emailCancelled}
            onChange={() => toggle('emailCancelled')}
            disabled
          />
          <SRow label="Reminder 1 day before" checked={prefs.emailReminder} onChange={() => toggle('emailReminder')} />

          {!isFaculty && (
            <>
              <p className="ss-sub-label">Booking</p>
              <div style={{ paddingTop: '0.4rem' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Default consultation topic</p>
                <p style={{ margin: '0.1rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pre-selected when you book.</p>
                <select className="ss-topic-select" value={prefs.defaultTopic} onChange={e => setPrefs(p => ({ ...p, defaultTopic: e.target.value }))}>
                  {STUDENT_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <SRow label="Add approved appointments to Google Calendar" checked={prefs.googleCalendar} onChange={() => toggle('googleCalendar')} />
            </>
          )}
        </div>

        {/* ── Text Size ── */}
        <div className="ss-card">
          <p className="ss-card-title">Text Size</p>
          <p className="ss-card-sub" style={{ marginBottom: 0 }}>Choose a comfortable reading size.</p>
          <div className="ss-size-grid">
            {[{ id:'small', label:'Small', px:13 }, { id:'medium', label:'Medium', px:17 }, { id:'large', label:'Large', px:21 }].map(s => (
              <button key={s.id} className={`ss-size-card ${textSize === s.id ? 'active' : ''}`} onClick={() => setTextSize(s.id)}>
                <CheckCircle2 size={12} className="ss-size-check" />
                <Type size={s.px} style={{ position: 'relative' }} />
                <span className="ss-size-label">{s.label}</span>
                <span className="ss-size-px">{s.px}px</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Accessibility ── */}
        <div className="ss-card">
          <p className="ss-card-title">Accessibility</p>
          <p className="ss-card-sub ss-card-sub-none"></p>
          <SRow
            label="Reduced Motion"
            sub="Disable animations and transitions across the app"
            checked={accessibilityPrefs.reducedMotion || false}
            onChange={() => updateAccessibilityPref('reducedMotion', !accessibilityPrefs.reducedMotion)}
          />
          <SRow
            label="Dyslexia-Friendly Font"
            sub="Switches to OpenDyslexic typeface for easier reading"
            checked={accessibilityPrefs.dyslexicFont || false}
            onChange={() => updateAccessibilityPref('dyslexicFont', !accessibilityPrefs.dyslexicFont)}
          />
        </div>

        {/* ── Privacy ── */}
        <div className="ss-card">
          <p className="ss-card-title">Privacy</p>
          <p className="ss-card-sub" style={{ marginBottom: '0.5rem' }}>
            {isFaculty
              ? 'Students only see your name, department, and availability status. Your email and contact details are never shown.'
              : 'Faculty see your student number alongside your name when reviewing requests.'}
          </p>
          {!isFaculty && (
            <div className="ss-privacy-row">
              <span className="ss-privacy-chip">
                <span className="ss-dot" style={{ background: '#00c853' }} />
                <span style={{ color: '#166534', fontWeight: 600 }}>Visible: name, student number, section, request notes</span>
              </span>
              <span className="ss-privacy-chip">
                <span className="ss-dot" style={{ background: '#ff1744' }} />
                <span style={{ color: '#991b1b', fontWeight: 600 }}>Hidden: email, contact number</span>
              </span>
            </div>
          )}
        </div>

        {/* ── Experimental (faculty only) ── */}
        {isFaculty && (
          <div className="ss-card-exp">
            <div className="ss-exp-header">
              <div className="ss-exp-icon"><FlaskConical size={14} /></div>
              <p className="ss-exp-title">Experimental</p>
              <span className="ss-exp-badge">Beta</span>
            </div>
            <div className="ss-exp-master-row">
              <div>
                <p className="ss-exp-master-label">Enable experimental features</p>
                <p className="ss-exp-master-sub">Turn on to access early access settings below.</p>
              </div>
              <label className={`ss-switch ss-switch-exp`} onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={expEnabled} onChange={() => { const v = !expEnabled; setExpEnabled(v); localStorage.setItem('gcas_exp_enabled', v); }} />
                <span className="ss-slider" />
              </label>
            </div>
            <div className={`ss-exp-body${expEnabled ? '' : ' disabled'}`}>
              <p className="ss-exp-sub">These features are for UI and visual changes only. They are not connected to the database and will not affect actual booking behavior.</p>
              {[
                { key:'maxPerDay', label:'Max appointments per day', sub:'Cap how many students can book you in a single day.', type:'select', opts:['1','2','3','4','5','6','7','8','10','Unlimited'].map(v => ({ value:v, label: v==='Unlimited'?'Unlimited':`${v} per day` })), value: maxPerDay, onChange: v => { setMaxPerDay(v); localStorage.setItem('gcas_exp_max_per_day',v); } },
                { key:'reminder', label:'Reminder before appointment', sub:'Get a bell notification before your appointment starts.', type:'select', opts:[{value:'off',label:'Off'},{value:'15 mins',label:'15 mins'},{value:'30 mins',label:'30 mins'},{value:'1 hour',label:'1 hour'}], value: reminderBefore, onChange: v => { setReminderBefore(v); localStorage.setItem('gcas_exp_reminder',v); } },
                { key:'mode', label:'Default consultation mode', sub:'Pre-fill mode when creating slots: In-person or Online.', type:'select', opts:[{value:'In-person',label:'In-person'},{value:'Online',label:'Online'},{value:'Either',label:'Either'}], value: defaultMode, onChange: v => { setDefaultMode(v); localStorage.setItem('gcas_exp_default_mode',v); } },
              ].map(item => (
                <div className="ss-row-exp" key={item.key}>
                  <div>
                    <p className="ss-exp-row-label">{item.label}<span className="ss-exp-pill">experimental</span></p>
                    <p className="ss-exp-row-sub">{item.sub}</p>
                  </div>
                  <div className="ss-select-wrap">
                    <select className="ss-select" value={item.value} onChange={e => item.onChange(e.target.value)}>
                      {item.opts.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                    </select>
                    <span className="ss-select-chevron">▾</span>
                  </div>
                </div>
              ))}
              <div className="ss-row-exp">
                <div>
                  <p className="ss-exp-row-label">Vacation mode<span className="ss-exp-pill">experimental</span></p>
                  <p className="ss-exp-row-sub">Pause all incoming booking requests temporarily.</p>
                </div>
                <SSwitch checked={vacationMode} onChange={() => { const v = !vacationMode; setVacationMode(v); localStorage.setItem('gcas_exp_vacation', v); }} />
              </div>
              {vacationMode && (
                <div className="ss-exp-warning">
                  <span className="ss-exp-warning-dot" />
                  <span>Vacation mode is on. This is a visual change only and does not block students from booking.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Change bar ── */}
        {(isDirty || saveStatus === 'saved') && (
          <div className={`ss-change-bar ${saveStatus === 'saved' ? 'saved' : 'dirty'}`}>
            <span>{saveStatus === 'saved' ? '✓ Changes saved successfully.' : '● You have unsaved changes.'}</span>
            {saveStatus !== 'saved' && <span style={{ fontSize: '0.78rem', fontWeight: 500, opacity: 0.7 }}>Save or cancel to discard.</span>}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="ss-footer">
          <button className="ss-btn-cancel" onClick={handleCancel} disabled={!isDirty && saveStatus !== 'saved'}>Cancel</button>
          <button className="ss-btn-save" onClick={handleSave} disabled={saving || !isDirty}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>
    </>
  );
};

export default SharedSettingsContent;
