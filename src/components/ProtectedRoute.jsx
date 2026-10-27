import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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

  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'student' ? '/student' : '/faculty'} replace />;
  }

  return children;
};

export default ProtectedRoute;
