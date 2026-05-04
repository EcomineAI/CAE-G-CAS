import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const inputStyles = `
.input-group {
  margin-bottom: 0.8rem;
  width: 100%;
  text-align: left;
}

.input-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-muted);
  margin-bottom: 0.3rem;
  margin-left: 2px;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: var(--input-icon, #5f6368);
  pointer-events: none;
}

.custom-input {
  width: 100%;
  padding: 13px 16px;
  border: 1px solid var(--input-border, #d1d5db);
  border-radius: 10px;
  font-size: 16px;
  color: var(--input-text, #1e293b);
  transition: var(--transition);
  background: var(--input-bg, #ffffff);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.custom-input::placeholder {
  color: var(--input-placeholder, #94a3b8);
}

.custom-input:-webkit-autofill,
.custom-input:-webkit-autofill:hover, 
.custom-input:-webkit-autofill:focus {
  -webkit-text-fill-color: var(--input-text);
  -webkit-box-shadow: 0 0 0px 1000px var(--input-bg) inset;
  transition: background-color 5000s ease-in-out 0s;
}

.custom-input.with-icon {
  padding-left: 45px;
}

.custom-input.with-toggle {
  padding-right: 45px;
}

.custom-input:focus {
  outline: none;
  border-color: var(--primary, #FF6B00);
  background: var(--input-focus-bg, #ffffff);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02), 0 0 0 3px rgba(255, 107, 0, 0.1);
}

.password-toggle {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--input-icon, #5f6368);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
}

.password-toggle:hover {
  color: var(--password-hover, #000);
}
`;

const Input = ({ label, icon: Icon, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type || 'text';

  return (
    <>
      <style>{inputStyles}</style>
      <div className="input-group">
        {label && <label className="input-label">{label}</label>}
        <div className="input-container">
          {Icon && <Icon size={18} className="input-icon" />}
          <input 
            className={`custom-input ${Icon ? 'with-icon' : ''} ${isPassword ? 'with-toggle' : ''}`} 
            type={inputType} 
            {...props} 
          />
          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Input;
