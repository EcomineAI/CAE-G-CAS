import React, { useState } from 'react';
import { X, Moon, Sun, Type, LogOut, Eye, Zap, Monitor, ALargeSmall, ChevronRight, CheckCircle2 } from 'lucide-react';

const smStyles = `
.sm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  animation: smFadeIn 0.18s ease;
}
@keyframes smFadeIn { from { opacity:0 } to { opacity:1 } }

.sm-card {
  background: var(--card-bg, #fff);
  width: 100%;
  max-width: 700px;
  min-height: 460px;
  max-height: 90vh;
  border-radius: 22px;
  border: 1px solid var(--border-color);
  box-shadow: 0 32px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: smSlideUp 0.24s cubic-bezier(0.16,1,0.3,1);
}
@keyframes smSlideUp {
  from { transform: translateY(20px) scale(0.98); opacity:0 }
  to   { transform: translateY(0)    scale(1);    opacity:1 }
}

/* ── Header ── */
.sm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 1.6rem;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}
.sm-header-icon {
  width: 34px; height: 34px;
  border-radius: 10px;
  background: var(--accent-light);
  border: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: center;
  color: var(--accent, #2e4a87);
  flex-shrink: 0;
}
.sm-header-text { flex: 1; }
.sm-header-text h2 {
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 1px;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}
.sm-header-text span { font-size: 0.72rem; color: var(--text-muted); }
.sm-close {
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
.sm-close:hover { background: var(--border-color); color: var(--text-primary); }

/* ── Body ── */
.sm-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }

/* ── Sidebar ── */
.sm-sidebar {
  width: 196px;
  flex-shrink: 0;
  background: var(--bg-primary, #f0f2f8);
  border-right: 1px solid var(--border-color);
  padding: 1rem 0.7rem;
  display: flex;
  flex-direction: column;
}
.sm-sidebar-group { margin-bottom: 1.2rem; }
.sm-sidebar-label {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 0.55rem;
  margin-bottom: 0.3rem;
  display: block;
}
.sm-sidebar-item {
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
}
.sm-nav-icon {
  width: 26px; height: 26px;
  border-radius: 7px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.14s;
}
.sm-nav-chevron { margin-left: auto; opacity: 0; transition: opacity 0.14s; }
.sm-sidebar-item:hover { background: var(--card-bg, #fff); color: var(--text-primary); }
.sm-sidebar-item:hover .sm-nav-icon { border-color: var(--accent, #2e4a87); color: var(--accent, #2e4a87); }
.sm-sidebar-item:hover .sm-nav-chevron { opacity: 0.45; }
.sm-sidebar-item.active { background: var(--accent-light); color: var(--accent, #2e4a87); }
.sm-sidebar-item.active .sm-nav-icon { background: var(--accent, #2e4a87); border-color: var(--accent, #2e4a87); color: #fff; }
.sm-sidebar-item.active .sm-nav-chevron { opacity: 0.45; }

.sm-sidebar-divider { height: 1px; background: var(--border-color); margin: 0.3rem 0.55rem 0.8rem; }
.sm-sidebar-spacer { flex: 1; }

.sm-sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.52rem 0.65rem;
  border-radius: 9px;
  border: 1px solid rgba(239,68,68,0.2);
  background: transparent;
  color: #ef4444;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
}
.sm-sidebar-logout:hover { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.4); }
.sm-logout-icon {
  width: 26px; height: 26px;
  border-radius: 7px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* ── Right content ── */
.sm-content {
  flex: 1;
  padding: 1.4rem 1.8rem 1.8rem;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}
.sm-content-header { margin-bottom: 1.4rem; }
.sm-content-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 3px;
  letter-spacing: -0.3px;
}
.sm-content-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

/* ── Section divider ── */
.sm-divider {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 1.3rem 0 0.85rem;
}
.sm-divider span {
  font-size: 0.63rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  white-space: nowrap;
}
.sm-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-color); }
.sm-divider:first-of-type { margin-top: 0; }

/* ── Toggle rows ── */
.sm-toggle-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  background: var(--bg-primary, #f0f2f8);
  border: 1.5px solid var(--border-color);
  border-radius: 13px;
  margin-bottom: 0.55rem;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.sm-toggle-row:last-child { margin-bottom: 0; }
.sm-toggle-row:hover { border-color: var(--accent, #2e4a87); }
.sm-toggle-row.on { border-color: var(--accent, #2e4a87); background: var(--accent-light); }

.sm-toggle-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--card-bg, #fff);
  border: 1px solid var(--border-color);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: all 0.15s;
}
.sm-toggle-row.on .sm-toggle-icon {
  background: var(--accent, #2e4a87);
  border-color: var(--accent, #2e4a87);
  color: #fff;
}
.sm-toggle-info { flex: 1; min-width: 0; }
.sm-toggle-title {
  font-size: 0.87rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 2px;
}
.sm-toggle-desc {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}
.sm-toggle-row.on .sm-toggle-title { color: var(--accent, #2e4a87); }

/* ── Toggle switch ── */
.sm-switch {
  position: relative;
  display: inline-block;
  width: 42px; height: 24px;
  flex-shrink: 0;
}
.sm-switch input { opacity: 0; width: 0; height: 0; }
.sm-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--border-color);
  border-radius: 24px;
  transition: 0.25s;
}
.sm-slider::before {
  content: "";
  position: absolute;
  width: 18px; height: 18px;
  left: 3px; bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.25s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.sm-switch input:checked + .sm-slider { background: var(--accent, #2e4a87); }
.sm-switch input:checked + .sm-slider::before { transform: translateX(18px); }

/* ── Text size grid ── */
.sm-size-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.7rem;
  margin-bottom: 1.2rem;
}
.sm-size-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  padding: 1.1rem 0.5rem;
  background: var(--bg-primary, #f0f2f8);
  border: 1.5px solid var(--border-color);
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-secondary);
  font-family: inherit;
  position: relative;
  overflow: hidden;
}
.sm-size-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--accent-light) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.15s;
}
.sm-size-card:hover { border-color: var(--accent, #2e4a87); color: var(--accent, #2e4a87); }
.sm-size-card:hover::before { opacity: 1; }
.sm-size-card.active {
  background: var(--accent, #2e4a87);
  border-color: var(--accent, #2e4a87);
  color: #fff;
  box-shadow: 0 6px 16px rgba(0,0,0,0.14);
}
.sm-size-card.active::before { opacity: 0; }
.sm-size-card-label {
  font-size: 0.75rem;
  font-weight: 800;
  position: relative;
}
.sm-size-card-sample {
  font-size: 0.65rem;
  opacity: 0.6;
  position: relative;
  line-height: 1.3;
  text-align: center;
}
.sm-size-check {
  position: absolute;
  top: 7px; right: 7px;
  opacity: 0;
  transition: opacity 0.15s;
}
.sm-size-card.active .sm-size-check { opacity: 1; }

/* ── Active setting summary badge ── */
.sm-active-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  font-weight: 700;
  color: #16a34a;
  background: rgba(22,163,74,0.1);
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  margin-left: 0.5rem;
}

/* ── Mobile ── */
@media (max-width: 580px) {
  .sm-card { max-width: 100%; border-radius: 18px; min-height: unset; }
  .sm-body { flex-direction: column; }
  .sm-sidebar {
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
  .sm-sidebar::-webkit-scrollbar { display: none; }
  .sm-sidebar-group { display: contents; }
  .sm-sidebar-label { display: none; }
  .sm-sidebar-divider { display: none; }
  .sm-sidebar-spacer { display: none; }
  .sm-sidebar-item { width: auto; flex-shrink: 0; padding: 0.38rem 0.65rem; font-size: 0.76rem; border-radius: 20px; }
  .sm-nav-icon { width: 20px; height: 20px; }
  .sm-nav-chevron { display: none; }
  .sm-sidebar-item.active { background: var(--accent, #2e4a87); color: #fff; }
  .sm-sidebar-item.active .sm-nav-icon { background: rgba(255,255,255,0.2); border-color: transparent; color: #fff; }
  .sm-sidebar-logout { width: auto; flex-shrink: 0; font-size: 0.75rem; padding: 0.38rem 0.65rem; border-radius: 20px; }
  .sm-logout-icon { width: 20px; height: 20px; }
  .sm-content { padding: 1rem; }
  .sm-size-grid { gap: 0.5rem; }
}
`;

const NAV = [
  {
    group: 'CUSTOMIZE',
    items: [
      { id: 'appearance',    label: 'Appearance',    icon: Monitor },
      { id: 'textsize',      label: 'Text Size',     icon: ALargeSmall },
    ],
  },
  {
    group: 'ACCESSIBILITY',
    items: [
      { id: 'accessibility', label: 'Motion & Font', icon: Zap },
    ],
  },
];

const Toggle = ({ checked, onChange }) => (
  <label className="sm-switch" onClick={e => e.stopPropagation()}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="sm-slider" />
  </label>
);

const ToggleRow = ({ icon: Icon, title, desc, checked, onChange }) => (
  <div className={`sm-toggle-row ${checked ? 'on' : ''}`} onClick={onChange}>
    <div className="sm-toggle-icon"><Icon size={17} /></div>
    <div className="sm-toggle-info">
      <p className="sm-toggle-title">{title}</p>
      <p className="sm-toggle-desc">{desc}</p>
    </div>
    <Toggle checked={checked} onChange={e => { e.stopPropagation(); onChange(); }} />
  </div>
);

const SettingsModal = ({
  isOpen,
  onClose,
  isDarkMode,
  setIsDarkMode,
  textSize,
  setTextSize,
  isHighContrast,
  setIsHighContrast,
  accessibilityPrefs = {},
  updateAccessibilityPref = () => {},
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState('appearance');

  if (!isOpen) return null;

  const activeCount = [isDarkMode, isHighContrast, accessibilityPrefs.reducedMotion, accessibilityPrefs.dyslexicFont].filter(Boolean).length;

  const renderContent = () => {
    switch (activeSection) {

      case 'appearance':
        return (
          <>
            <div className="sm-content-header">
              <p className="sm-content-title">
                Appearance
                {(isDarkMode || isHighContrast) && (
                  <span className="sm-active-badge">
                    <CheckCircle2 size={10} />
                    {[isDarkMode && 'Dark', isHighContrast && 'High Contrast'].filter(Boolean).join(', ')}
                  </span>
                )}
              </p>
              <p className="sm-content-sub">Adjust how FACS looks on your screen</p>
            </div>

            <div className="sm-divider"><span>Display</span></div>
            <ToggleRow
              icon={isDarkMode ? Moon : Sun}
              title="Dark Mode"
              desc={isDarkMode ? 'Currently using dark theme — easier on the eyes at night' : 'Switch to a darker color scheme'}
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
            />
            <ToggleRow
              icon={Eye}
              title="High Contrast"
              desc="Increase border and text contrast for better readability"
              checked={isHighContrast}
              onChange={() => setIsHighContrast(!isHighContrast)}
            />
          </>
        );

      case 'textsize':
        return (
          <>
            <div className="sm-content-header">
              <p className="sm-content-title">Text Size</p>
              <p className="sm-content-sub">Choose a comfortable reading size</p>
            </div>

            <div className="sm-divider"><span>Size Options</span></div>
            <div className="sm-size-grid">
              {[
                { id: 'small',  label: 'Small',  px: 13, sample: 'Aa' },
                { id: 'medium', label: 'Medium', px: 17, sample: 'Aa' },
                { id: 'large',  label: 'Large',  px: 21, sample: 'Aa' },
              ].map(s => (
                <button
                  key={s.id}
                  className={`sm-size-card ${textSize === s.id ? 'active' : ''}`}
                  onClick={() => setTextSize(s.id)}
                >
                  <CheckCircle2 size={13} className="sm-size-check" />
                  <Type size={s.px} style={{ position: 'relative' }} />
                  <span className="sm-size-card-label">{s.label}</span>
                  <span className="sm-size-card-sample">{s.px}px</span>
                </button>
              ))}
            </div>
          </>
        );

      case 'accessibility':
        return (
          <>
            <div className="sm-content-header">
              <p className="sm-content-title">Accessibility</p>
              <p className="sm-content-sub">Options to reduce strain and improve readability</p>
            </div>

            <div className="sm-divider"><span>Motion</span></div>
            <ToggleRow
              icon={Zap}
              title="Reduced Motion"
              desc="Disable animations and transitions across the app"
              checked={accessibilityPrefs.reducedMotion || false}
              onChange={() => updateAccessibilityPref('reducedMotion', !accessibilityPrefs.reducedMotion)}
            />

            <div className="sm-divider"><span>Typography</span></div>
            <ToggleRow
              icon={Type}
              title="Dyslexia-Friendly Font"
              desc="Switches to OpenDyslexic typeface for easier reading"
              checked={accessibilityPrefs.dyslexicFont || false}
              onChange={() => updateAccessibilityPref('dyslexicFont', !accessibilityPrefs.dyslexicFont)}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sm-overlay" onClick={onClose}>
      <style>{smStyles}</style>
      <div className="sm-card" onClick={e => e.stopPropagation()}>

        <div className="sm-header">
          <div className="sm-header-icon"><Monitor size={17} /></div>
          <div className="sm-header-text">
            <h2>Settings</h2>
            <span>
              Customize your FACS experience
              {activeCount > 0 && ` · ${activeCount} option${activeCount > 1 ? 's' : ''} active`}
            </span>
          </div>
          <button className="sm-close" onClick={onClose}><X size={15} /></button>
        </div>

        <div className="sm-body">
          <div className="sm-sidebar">
            {NAV.map((group, gi) => (
              <div className="sm-sidebar-group" key={group.group}>
                <span className="sm-sidebar-label">{group.group}</span>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    className={`sm-sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(item.id)}
                  >
                    <span className="sm-nav-icon"><item.icon size={13} /></span>
                    {item.label}
                    <ChevronRight size={12} className="sm-nav-chevron" />
                  </button>
                ))}
                {gi < NAV.length - 1 && <div className="sm-sidebar-divider" />}
              </div>
            ))}

            <div className="sm-sidebar-spacer" />

            <button className="sm-sidebar-logout" onClick={onLogout}>
              <span className="sm-logout-icon"><LogOut size={13} /></span>
              Sign Out
            </button>
          </div>

          <div className="sm-content">
            {renderContent()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
