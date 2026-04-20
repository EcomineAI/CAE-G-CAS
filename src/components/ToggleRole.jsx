import React from 'react';

const toggleRoleStyles = `
.toggle-wrapper {
  margin-bottom: 2rem;
  width: 100%;
}

.toggle-container {
  display: flex;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  position: relative;
  padding: 4px;
  user-select: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toggle-slider {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 9px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 1;
}

.toggle-slider.right {
  transform: translateX(100%);
}

.toggle-btn {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 600;
  color: #5f6368;
  cursor: pointer;
  z-index: 2;
  transition: color 0.2s ease;
}

.toggle-btn.active {
  color: var(--primary);
}
`;

const ToggleRole = ({ activeRole, onChange }) => {
  return (
    <>
      <style>{toggleRoleStyles}</style>
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
    </>
  );
};

export default ToggleRole;
