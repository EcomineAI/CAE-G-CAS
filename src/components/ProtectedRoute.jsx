import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'var(--text-muted)'
      }}>
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to={`/login/${allowedRole}`} replace />;
  }

  // Wrong role
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'student' ? '/student' : '/faculty'} replace />;
  }

  return children;
};

export default ProtectedRoute;
