import React, { useState } from 'react';
import { Moon, Sun, Eye, Zap, Type, CheckCircle2, FlaskConical } from 'lucide-react';

const fsStyles = `
.fs-wrap {
  display: flex; flex-direction: column;
  max-width: 700px; width: 100%;
  animation: fsIn 0.25s ease;
}
@keyframes fsIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

.fs-page-title { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
.fs-page-sub   { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1.2rem; }

.fs-card {
  background: var(--card-bg, #fff);
  border: 1px solid var(--card-border, #e5e8f0);
  border-radius: 12px;
  padding: 1rem 1.3rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.fs-card-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 0 0 0.15rem; }
.fs-card-sub   { font-size: 0.78rem; color: var(--text-muted); margin: 0 0 0.85rem; }

.fs-sub-label {
  font-size: 0.68rem; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: #2e4a87; margin: 0.85rem 0 0;
}
.fs-sub-label:first-of-type { margin-top: 0; }

/* Row */
.fs-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
}
.fs-row:last-child { border-bottom: none; }
.fs-row-label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.fs-row-sub   { font-size: 0.75rem; color: var(--text-muted); margin: 0; }

/* Toggle switch */
.fs-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.fs-switch input { opacity: 0; width: 0; height: 0; }
.fs-slider {
  position: absolute; cursor: pointer; inset: 0;
  background: var(--border-color, #d1d5db);
  border-radius: 24px; transition: 0.22s;
}
.fs-slider::before {
  content: ''; position: absolute;
  width: 18px; height: 18px; left: 3px; bottom: 3px;
  background: #fff; border-radius: 50%; transition: 0.22s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.fs-switch input:checked + .fs-slider { background: #1a2d5a; }
.fs-switch input:checked + .fs-slider::before { transform: translateX(20px); }

/* Booking rule selects */
.fs-select-wrap { position: relative; margin-top: 0.35rem; }
.fs-select {
  width: 140px; padding: 0.5rem 2rem 0.5rem 0.75rem;
  border-radius: 8px; border: 1.5px solid var(--border-color, #d1d5db);
  background: var(--bg-primary, #f0f2f8);
  color: var(--text-primary); font-family: inherit; font-size: 0.88rem;
  outline: none; cursor: pointer; appearance: none; -webkit-appearance: none;
}
.fs-select-chevron {
  position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
  pointer-events: none; color: var(--text-muted); font-size: 0.75rem;
}

/* Text size grid */
.fs-size-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem; margin-top: 0.75rem;
}
.fs-size-card {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.45rem; padding: 1rem 0.5rem;
  background: var(--bg-primary, #f0f2f8);
  border: 1.5px solid var(--border-color, #e5e8f0);
  border-radius: 11px; cursor: pointer;
  transition: all 0.14s; font-family: inherit;
  color: var(--text-secondary); position: relative;
}
.fs-size-card:hover { border-color: #1a2d5a; color: #1a2d5a; }
.fs-size-card.active {
  background: #1a2d5a; border-color: #1a2d5a;
  color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.14);
}
.fs-size-label { font-size: 0.75rem; font-weight: 800; }
.fs-size-px    { font-size: 0.63rem; opacity: 0.6; }
.fs-size-check { position: absolute; top: 6px; right: 6px; opacity: 0; }
.fs-size-card.active .fs-size-check { opacity: 1; }

/* Privacy chips */
.fs-privacy-row { display: flex; gap: 1.2rem; flex-wrap: wrap; margin-top: 0.3rem; }
.fs-chip { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 600; }
.fs-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Experimental card */
.fs-card-experimental {
  background: var(--card-bg, #fff);
  border: 1.5px dashed #f59e0b;
  border-radius: 12px;
  padding: 1rem 1.3rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.fs-exp-header {
  display: flex; align-items: center; gap: 0.55rem;
  margin-bottom: 0.25rem;
}
.fs-exp-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: #fef3c7; border: 1px solid #fde68a;
  display: flex; align-items: center; justify-content: center;
  color: #d97706; flex-shrink: 0;
}
.fs-exp-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); margin: 0; }
.fs-exp-badge {
  font-size: 0.62rem; font-weight: 800; letter-spacing: 0.07em;
  text-transform: uppercase; color: #d97706;
  background: #fef3c7; border: 1px solid #fde68a;
  padding: 0.15rem 0.5rem; border-radius: 20px;
}
.fs-exp-sub {
  font-size: 0.76rem; color: var(--text-muted);
  margin: 0 0 0.85rem; line-height: 1.5;
}
.fs-exp-warning {
  display: flex; align-items: flex-start; gap: 0.5rem;
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: 8px; padding: 0.55rem 0.75rem;
  font-size: 0.75rem; color: #92400e; line-height: 1.5;
  margin-top: 0.5rem;
}
.fs-exp-warning-dot { width: 6px; height: 6px; border-radius: 50%; background: #f59e0b; flex-shrink: 0; margin-top: 4px; }

/* Experimental master toggle row */
.fs-exp-master-row {
  display: flex; align-items: center; justify-content: space-between;
  padding-bottom: 0.85rem;
  margin-bottom: 0.85rem;
  border-bottom: 1.5px solid #fde68a;
}
.fs-exp-master-label { font-size: 0.88rem; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; }
.fs-exp-master-sub   { font-size: 0.73rem; color: var(--text-muted); margin: 0; }

/* Experimental switch — amber when on */
.fs-switch-exp input:checked + .fs-slider { background: #f59e0b; }

/* Experimental features body — fades when off */
.fs-exp-body { transition: opacity 0.2s, filter 0.2s; }
.fs-exp-body.disabled { opacity: 0.38; pointer-events: none; filter: grayscale(0.4); }

/* Experimental row */
.fs-row-exp {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--border-color, #e5e8f0);
}
.fs-row-exp:last-child { border-bottom: none; }
.fs-exp-row-label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0 0 2px; }
.fs-exp-row-sub   { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
.fs-exp-pill {
  font-size: 0.6rem; font-weight: 800; letter-spacing: 0.05em;
  text-transform: uppercase; color: #d97706;
  background: #fef3c7; border: 1px solid #fde68a;
  padding: 0.1rem 0.4rem; border-radius: 10px;
  margin-left: 0.4rem; vertical-align: middle;
}
`;

const FSwitch = ({ checked, onChange, disabled }) => (
  <label className="fs-switch" onClick={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <span className="fs-slider" />
  </label>
);

const FRow = ({ label, sub, checked, onChange, disabled }) => (
  <div className="fs-row">
    <div>
      <p className="fs-row-label">{label}</p>
      {sub && <p className="fs-row-sub">{sub}</p>}
    </div>
    <FSwitch checked={checked} onChange={onChange} disabled={disabled} />
  </div>
);

const FacultySettingsContent = ({
  isDarkMode, setIsDarkMode,
  textSize, setTextSize,
  isHighContrast, setIsHighContrast,
  accessibilityPrefs = {}, updateAccessibilityPref = () => {},
}) => {
  const [minNotice, setMinNotice] = useState(() => localStorage.getItem('gcas_fac_min_notice') || '2 hours');
  const [bookingWindow, setBookingWindow] = useState(() => localStorage.getItem('gcas_fac_booking_window') || '2 weeks');
  const [inAppNotif, setInAppNotif] = useState(true);

  // Experimental features (UI-only, not wired to DB)
  const [expEnabled, setExpEnabled] = useState(() => localStorage.getItem('gcas_exp_enabled') === 'true');
  const saveExpEnabled = (v) => { setExpEnabled(v); localStorage.setItem('gcas_exp_enabled', v); };

  const [maxPerDay, setMaxPerDay] = useState(() => localStorage.getItem('gcas_exp_max_per_day') || '5');
  const [reminderBefore, setReminderBefore] = useState(() => localStorage.getItem('gcas_exp_reminder') || 'off');
  const [vacationMode, setVacationMode] = useState(() => localStorage.getItem('gcas_exp_vacation') === 'true');
  const [defaultMode, setDefaultMode] = useState(() => localStorage.getItem('gcas_exp_default_mode') || 'In-person');

  const saveMaxPerDay = (v) => { setMaxPerDay(v); localStorage.setItem('gcas_exp_max_per_day', v); };
  const saveReminder = (v) => { setReminderBefore(v); localStorage.setItem('gcas_exp_reminder', v); };
  const saveVacation = (v) => { setVacationMode(v); localStorage.setItem('gcas_exp_vacation', v); };
  const saveDefaultMode = (v) => { setDefaultMode(v); localStorage.setItem('gcas_exp_default_mode', v); };

  const saveMinNotice = (v) => { setMinNotice(v); localStorage.setItem('gcas_fac_min_notice', v); };
  const saveBookingWindow = (v) => { setBookingWindow(v); localStorage.setItem('gcas_fac_booking_window', v); };

  return (
    <>
      <style>{fsStyles}</style>
      <div className="fs-wrap">
        <p className="fs-page-title">Settings</p>
        <p className="fs-page-sub">Booking rules and notification preference</p>

        {/* Booking rules */}
        <div className="fs-card">
          <p className="fs-card-title">Booking rules</p>
          <p className="fs-card-sub">These apply to what students can book.</p>

          <div className="fs-row">
            <div>
              <p className="fs-row-label">Minimum notice</p>
              <p className="fs-row-sub">Students can't book slots that start sooner than this.</p>
            </div>
            <div className="fs-select-wrap">
              <select className="fs-select" value={minNotice} onChange={e => saveMinNotice(e.target.value)}>
                <option value="None">None</option>
                <option value="30 mins">30 mins</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="1 day">1 day</option>
              </select>
              <span className="fs-select-chevron">▾</span>
            </div>
          </div>

          <div className="fs-row" style={{ borderBottom: 'none' }}>
            <div>
              <p className="fs-row-label">Booking window</p>
              <p className="fs-row-sub">How far ahead students can book.</p>
            </div>
            <div className="fs-select-wrap">
              <select className="fs-select" value={bookingWindow} onChange={e => saveBookingWindow(e.target.value)}>
                <option value="3 days">3 days</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
              </select>
              <span className="fs-select-chevron">▾</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="fs-card">
          <p className="fs-card-title">Preferences</p>
          <p className="fs-card-sub" style={{ marginBottom: 0 }}></p>
          <FRow
            label="In-app notifications"
            sub="Show new requests and cancellations in the bell."
            checked={inAppNotif}
            onChange={() => setInAppNotif(v => !v)}
          />
        </div>

        {/* Privacy */}
        <div className="fs-card">
          <p className="fs-card-title">Privacy</p>
          <p className="fs-card-sub" style={{ marginBottom: '0.5rem' }}>
            Students only see your name, department, and availability status. Your email and contact details are never shown.
          </p>
        </div>

        {/* Appearance */}
        <div className="fs-card">
          <p className="fs-card-title">Appearance</p>
          <p className="fs-card-sub" style={{ marginBottom: 0 }}></p>
          <FRow
            label="Dark Mode"
            sub={isDarkMode ? 'Currently using dark theme' : 'Switch to a darker color scheme'}
            checked={isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
          />
          <FRow
            label="High Contrast"
            sub="Increase border and text contrast for better readability"
            checked={isHighContrast}
            onChange={() => setIsHighContrast(!isHighContrast)}
          />
        </div>

        {/* Text Size */}
        <div className="fs-card">
          <p className="fs-card-title">Text Size</p>
          <p className="fs-card-sub" style={{ marginBottom: 0 }}>Choose a comfortable reading size.</p>
          <div className="fs-size-grid">
            {[
              { id: 'small',  label: 'Small',  px: 13 },
              { id: 'medium', label: 'Medium', px: 17 },
              { id: 'large',  label: 'Large',  px: 21 },
            ].map(s => (
              <button
                key={s.id}
                className={`fs-size-card ${textSize === s.id ? 'active' : ''}`}
                onClick={() => setTextSize(s.id)}
              >
                <CheckCircle2 size={12} className="fs-size-check" />
                <Type size={s.px} style={{ position: 'relative' }} />
                <span className="fs-size-label">{s.label}</span>
                <span className="fs-size-px">{s.px}px</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="fs-card">
          <p className="fs-card-title">Accessibility</p>
          <p className="fs-card-sub" style={{ marginBottom: 0 }}></p>
          <FRow
            label="Reduced Motion"
            sub="Disable animations and transitions across the app"
            checked={accessibilityPrefs.reducedMotion || false}
            onChange={() => updateAccessibilityPref('reducedMotion', !accessibilityPrefs.reducedMotion)}
          />
          <FRow
            label="Dyslexia-Friendly Font"
            sub="Switches to OpenDyslexic typeface for easier reading"
            checked={accessibilityPrefs.dyslexicFont || false}
            onChange={() => updateAccessibilityPref('dyslexicFont', !accessibilityPrefs.dyslexicFont)}
          />
        </div>

        {/* Experimental */}
        <div className="fs-card-experimental">
          <div className="fs-exp-header">
            <div className="fs-exp-icon"><FlaskConical size={14} /></div>
            <p className="fs-exp-title">Experimental</p>
            <span className="fs-exp-badge">Beta</span>
          </div>

          {/* Master toggle */}
          <div className="fs-exp-master-row">
            <div>
              <p className="fs-exp-master-label">Enable experimental features</p>
              <p className="fs-exp-master-sub">Turn on to access early access settings below.</p>
            </div>
            <label className="fs-switch fs-switch-exp" onClick={e => e.stopPropagation()}>
              <input type="checkbox" checked={expEnabled} onChange={() => saveExpEnabled(!expEnabled)} />
              <span className="fs-slider" />
            </label>
          </div>

          <div className={`fs-exp-body${expEnabled ? '' : ' disabled'}`}>
          <p className="fs-exp-sub" style={{ marginBottom: '0.1rem' }}>
            These features are for UI and visual changes only. They are not connected to the database and will not affect actual booking behavior.
          </p>

          {/* Max appointments per day */}
          <div className="fs-row-exp">
            <div>
              <p className="fs-exp-row-label">
                Max appointments per day
                <span className="fs-exp-pill">experimental</span>
              </p>
              <p className="fs-exp-row-sub">Cap how many students can book you in a single day.</p>
            </div>
            <div className="fs-select-wrap">
              <select className="fs-select" value={maxPerDay} onChange={e => saveMaxPerDay(e.target.value)}>
                {['1','2','3','4','5','6','7','8','10','Unlimited'].map(v => (
                  <option key={v} value={v}>{v === 'Unlimited' ? 'Unlimited' : `${v} per day`}</option>
                ))}
              </select>
              <span className="fs-select-chevron">▾</span>
            </div>
          </div>

          {/* Reminder before appointment */}
          <div className="fs-row-exp">
            <div>
              <p className="fs-exp-row-label">
                Reminder before appointment
                <span className="fs-exp-pill">experimental</span>
              </p>
              <p className="fs-exp-row-sub">Get a bell notification before your appointment starts.</p>
            </div>
            <div className="fs-select-wrap">
              <select className="fs-select" value={reminderBefore} onChange={e => saveReminder(e.target.value)}>
                <option value="off">Off</option>
                <option value="15 mins">15 mins</option>
                <option value="30 mins">30 mins</option>
                <option value="1 hour">1 hour</option>
              </select>
              <span className="fs-select-chevron">▾</span>
            </div>
          </div>

          {/* Default consultation mode */}
          <div className="fs-row-exp">
            <div>
              <p className="fs-exp-row-label">
                Default consultation mode
                <span className="fs-exp-pill">experimental</span>
              </p>
              <p className="fs-exp-row-sub">Pre-fill mode when creating slots: In-person or Online.</p>
            </div>
            <div className="fs-select-wrap">
              <select className="fs-select" value={defaultMode} onChange={e => saveDefaultMode(e.target.value)}>
                <option value="In-person">In-person</option>
                <option value="Online">Online</option>
                <option value="Either">Either</option>
              </select>
              <span className="fs-select-chevron">▾</span>
            </div>
          </div>

          {/* Vacation mode */}
          <div className="fs-row-exp">
            <div>
              <p className="fs-exp-row-label">
                Vacation mode
                <span className="fs-exp-pill">experimental</span>
              </p>
              <p className="fs-exp-row-sub">Pause all incoming booking requests temporarily.</p>
            </div>
            <FSwitch checked={vacationMode} onChange={() => saveVacation(!vacationMode)} />
          </div>

          {vacationMode && (
            <div className="fs-exp-warning">
              <span className="fs-exp-warning-dot" />
              <span>Vacation mode is on. This is a visual change only and does not block students from booking.</span>
            </div>
          )}
          </div>{/* end fs-exp-body */}
        </div>
      </div>
    </>
  );
};

export default FacultySettingsContent;
