import React from 'react';
import './Input.css';

const Input = ({ label, icon: Icon, ...props }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {Icon && <Icon size={18} className="input-icon" />}
        <input className={`custom-input ${Icon ? 'with-icon' : ''}`} {...props} />
      </div>
    </div>
  );
};

export default Input;
