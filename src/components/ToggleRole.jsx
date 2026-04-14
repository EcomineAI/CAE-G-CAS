import React from 'react';
import './ToggleRole.css';

const ToggleRole = ({ activeRole, onChange }) => {
  return (
    <div className="toggle-wrapper">
      <div className="toggle-container">
        <div 
          className={`toggle-slider ${activeRole === 'faculty' ? 'right' : ''}`}
        ></div>
        <button 
          className={`toggle-btn ${activeRole === 'student' ? 'active' : ''}`}
          onClick={() => onChange('student')}
        >
          Student
        </button>
        <button 
          className={`toggle-btn ${activeRole === 'faculty' ? 'active' : ''}`}
          onClick={() => onChange('faculty')}
        >
          Faculty
        </button>
      </div>
    </div>
  );
};

export default ToggleRole;
