import React from 'react';
import { X, Moon, Sun, Type, LogOut, Eye, Check } from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  setIsDarkMode, 
  textSize, 
  setTextSize, 
  isHighContrast, 
  setIsHighContrast,
  onLogout 
}) => {
  if (!isOpen) return null;

  const textSizes = [
    { id: 'small', label: 'Small', icon: <Type size={14} /> },
    { id: 'medium', label: 'Medium', icon: <Type size={18} /> },
    { id: 'large', label: 'Large', icon: <Type size={22} /> }
  ];

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <style>{`
        .settings-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.2s ease-out;
        }

        .settings-modal-card {
          background: var(--bg-secondary);
          width: 90%;
          max-width: 400px;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--text-primary);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .settings-header h2 {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }

        .close-btn {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--bg-primary);
          color: var(--text-primary);
          transform: rotate(90deg);
        }

        .settings-section {
          margin-bottom: 2rem;
        }

        .section-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.8rem;
          display: block;
        }

        .settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-primary);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          margin-bottom: 0.75rem;
          transition: all 0.2s;
        }

        .settings-row:hover {
          border-color: var(--text-primary);
        }

        .row-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .row-icon {
          width: 34px;
          height: 34px;
          background: var(--bg-secondary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .row-text h3 {
          font-size: 0.9rem;
          margin: 0;
          font-weight: 600;
        }

        .row-text p {
          font-size: 0.75rem;
          margin: 0;
          color: var(--text-muted);
        }

        /* Toggle Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        input:checked + .slider {
          background-color: var(--text-primary);
        }

        input:checked + .slider:before {
          transform: translateX(20px);
        }

        /* Text Size Selector */
        .text-size-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .size-option {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 1rem 0.5rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .size-option:hover {
          border-color: var(--text-primary);
          background: var(--bg-primary);
        }

        .size-option.active {
          background: var(--text-primary);
          color: var(--bg-secondary);
          border-color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .size-option span {
          font-size: 0.75rem;
          font-weight: 600;
        }

        .logout-btn {
          width: 100%;
          padding: 0.9rem;
          background: var(--bg-primary);
          color: #ef4444;
          border: 1px solid #ef4444;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        .logout-btn:hover {
          background: #fecaca;
          transform: translateY(-2px);
        }

        .dark .logout-btn {
          background: #450a0a;
          color: #f87171;
        }
      `}</style>

      <div className="settings-modal-card" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-section">
          <span className="section-label">Appearance</span>
          
          <div className="settings-row">
            <div className="row-info">
              <div className="row-icon">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div className="row-text">
                <h3>Dark Mode</h3>
                <p>Reduce eye strain at night</p>
              </div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isDarkMode} 
                onChange={() => setIsDarkMode(!isDarkMode)} 
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="settings-row">
            <div className="row-info">
              <div className="row-icon">
                <Eye size={20} />
              </div>
              <div className="row-text">
                <h3>High Contrast</h3>
                <p>Enhanced visibility</p>
              </div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isHighContrast} 
                onChange={() => setIsHighContrast(!isHighContrast)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <span className="section-label">Text Size</span>
          <div className="text-size-options">
            {textSizes.map((size) => (
              <div 
                key={size.id}
                className={`size-option ${textSize === size.id ? 'active' : ''}`}
                onClick={() => setTextSize(size.id)}
              >
                {size.icon}
                <span>{size.label}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={20} />
          Sign Out of Account
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
