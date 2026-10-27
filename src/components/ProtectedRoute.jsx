import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabase/supabase';

const pendingStyles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');
.pr-pending-shell {
  position: fixed; inset: 0;
  background: #f0f2f8;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Outfit', sans-serif;
  padding: 1rem;
}
.pr-pending-card {
  background: #fff;
  border: 1.5px solid #fca5a5;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(220,38,38,0.12), 0 2px 8px rgba(0,0,0,0.06);
  padding: 2.5rem 2rem 2rem;
  max-width: 480px; width: 100%;
  text-align: center;
  animation: prFadeIn 0.35s cubic-bezier(0.22,1,0.36,1);
}
@keyframes prFadeIn {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.pr-pending-icon {
  width: 64px; height: 64px; border-radius: 50%;
  background: #fee2e2;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.4rem;
  font-size: 2rem;
}
.pr-pending-title {
  font-size: 1.3rem; font-weight: 800; color: #dc2626;
  margin: 0 0 0.6rem; letter-spacing: -0.3px;
}
.pr-pending-msg {
  font-size: 0.9rem; color: #6b7280; line-height: 1.6;
  margin: 0 0 1.6rem;
}
.pr-pending-email {
  font-size: 0.78rem; color: #9ca3af;
  background: #f9fafb; border: 1px solid #e5e7eb;
  border-radius: 8px; padding: 0.5rem 0.9rem;
  margin-bottom: 1.6rem; font-family: monospace;
  word-break: break-all;
}
.pr-pending-logout {
  padding: 0.65rem 1.6rem;
  border-radius: 10px; border: 1.5px solid #e5e7eb;
  background: #fff; color: #374151;
  font-size: 0.9rem; font-weight: 700; cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.15s;
}
.pr-pending-logout:hover { border-color: #dc2626; color: #dc2626; }
`;

const PendingRoleWall = ({ email }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };
  return (
    <>
      <style>{pendingStyles}</style>
      <div className="pr-pending-shell">
        <div className="pr-pending-card">
          <div className="pr-pending-icon">🔒</div>
          <h2 className="pr-pending-title">Account Pending Role Assignment</h2>
          <p className="pr-pending-msg">
            Your account has been created but a role has not been assigned yet.
            Please contact your administrator to be assigned as a <strong>Student</strong> or <strong>Faculty</strong> member before you can access the system.
          </p>
          {email && <div className="pr-pending-email">{email}</div>}
          <button className="pr-pending-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f0f2f8',
      }}>
        <style>{`
          @keyframes pr-spin { to { transform: rotate(360deg); } }
          .pr-spinner {
            width: 80px; height: 80px;
            border-radius: 50%;
            border: 7px solid rgba(26,45,90,0.15);
            border-top-color: #1a2d5a;
            animation: pr-spin 0.8s linear infinite;
          }
        `}</style>
        <div className="pr-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Null / unassigned role — show blocking wall regardless of which route they hit
  if (!user.role) {
    return <PendingRoleWall email={user.email} />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'student' ? '/student' : '/faculty'} replace />;
  }

  return children;
};

export default ProtectedRoute;
