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
  transition: var(--transition, all 0.2s ease-in-out);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;
}

.custom-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-button.primary {
  background: var(--primary, #4f46e5);
  color: white;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.25);
}

.custom-button.primary:hover:not(:disabled) {
  background: var(--primary-hover, #4338ca);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
}

.custom-button.primary:active:not(:disabled) {
  transform: translateY(0);
}

.custom-button.secondary {
  background: var(--secondary-btn-bg, #eef2ff);
  color: var(--secondary-btn-text, #4f46e5);
}

.custom-button.secondary:hover:not(:disabled) {
  background: var(--secondary-btn-hover, #e0e7ff);
}
`;

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) => {
  return (
    <>
      <style>{buttonStyles}</style>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`custom-button ${variant} ${className}`}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
