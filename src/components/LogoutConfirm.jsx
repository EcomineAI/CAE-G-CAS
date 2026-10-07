import React from 'react';
import { LogOut, X } from 'lucide-react';

const styles = `
.lc-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999; padding: 1rem;
  font-family: 'Outfit', sans-serif;
  animation: lcFade 0.18s ease;
}
@keyframes lcFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.lc-card {
  background: #fff;
  border-radius: 14px;
  width: 100%; max-width: 380px;
  padding: 1.6rem 1.6rem 1.3rem;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  animation: lcPop 0.22s cubic-bezier(0.22,1,0.36,1);
  text-align: center;
}
@keyframes lcPop {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.lc-icon {
  width: 54px; height: 54px; margin: 0 auto 0.8rem;
  background: #fee2e2; color: #dc2626;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

.lc-title {
  font-size: 1.15rem; font-weight: 800;
  color: #1a2d5a; margin: 0 0 0.3rem;
}
.lc-text {
  font-size: 0.85rem; color: #6b7280;
  margin: 0 0 1.3rem; line-height: 1.5;
}

.lc-footer {
  display: flex; gap: 0.6rem; justify-content: center;
}
.lc-btn {
  flex: 1; padding: 0.6rem 1.1rem;
  border-radius: 9px; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s, border-color 0.15s, color 0.15s, opacity 0.15s;
}
.lc-btn-cancel {
  background: transparent; border: 1.5px solid #d1d5db; color: #374151;
}
.lc-btn-cancel:hover { border-color: #1a2d5a; color: #1a2d5a; }
.lc-btn-confirm {
  background: #dc2626; border: none; color: #fff;
}
.lc-btn-confirm:hover:not(:disabled) { opacity: 0.9; }
.lc-btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const LogoutConfirm = ({ onConfirm, onCancel, loading = false }) => (
  <div className="lc-overlay" onClick={onCancel}>
    <style>{styles}</style>
    <div className="lc-card" onClick={e => e.stopPropagation()}>
      <div className="lc-icon"><LogOut size={24} /></div>
      <h3 className="lc-title">Log out of FACS?</h3>
      <p className="lc-text">You will need to sign in again to use your account.</p>

      <div className="lc-footer">
        <button className="lc-btn lc-btn-cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="lc-btn lc-btn-confirm" onClick={onConfirm} disabled={loading}>
          {loading ? 'Logging out…' : 'Log Out'}
        </button>
      </div>
    </div>
  </div>
);

export default LogoutConfirm;
