import React from 'react';

const buttonStyles = `
.custom-button {
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
}

.custom-button.primary {
  background: var(--primary);
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 0, 0.25);
}

.custom-button.primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 107, 0, 0.35);
}

.custom-button.primary:active {
  transform: translateY(0);
}

.custom-button.secondary {
  background: var(--secondary-btn-bg, #f1f3f4);
  color: var(--secondary-btn-text, #1a1a1a);
}

.custom-button.secondary:hover {
  background: var(--secondary-btn-hover, #e8eaed);
}
`;

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
  return (
    <>
      <style>{buttonStyles}</style>
      <button 
        type={type} 
        onClick={onClick} 
        className={`custom-button ${variant} ${className}`}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
