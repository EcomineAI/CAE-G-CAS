import React from 'react';
import { Type, CheckCircle2 } from 'lucide-react';

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

/* Privacy chips */
.ss-privacy-row { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 0.3rem; }
.ss-privacy-chip { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 600; }
.ss-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
`;

const SSwitch = ({ checked, onChange, disabled }) => (
  <label className="ss-switch" onClick={e => e.stopPropagation()}>
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

const SharedSettingsContent = ({
  role = 'student',
  profileData,
  userEmail,
  textSize, setTextSize,
  accessibilityPrefs = {}, updateAccessibilityPref = () => {},
}) => {
  const isFaculty = role === 'faculty';

  const name     = profileData?.full_name || '—';
  const email    = userEmail || profileData?.email || '';
  const idFromEmail = email ? email.split('@')[0] : '—';
  const program  = profileData?.program || '—';
  const section  = profileData?.section || '—';
  const department = profileData?.department || '—';
  const programSection = [program, section].filter(Boolean).filter(v => v !== '—').join(' ') || '—';

  return (
    <>
      <style>{styles}</style>
      <div className="ss-wrap">
        <p className="ss-page-title">Settings</p>
        <p className="ss-page-sub">
          {isFaculty ? 'Your profile and display settings.' : 'Your profile and display settings.'}
        </p>

        {/* Profile */}
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
        </div>

        {/* Text Size */}
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

        {/* Accessibility */}
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

        {/* Privacy */}
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

      </div>
    </>
  );
};

export default SharedSettingsContent;
