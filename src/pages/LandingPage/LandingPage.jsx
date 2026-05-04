import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Button from '../../components/Button';


const LandingPage = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('gcas_auth_theme') === 'dark');

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
    localStorage.setItem('gcas_auth_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <>
      <div className="auth-bg-wrapper"></div>
      <button className="auth-theme-toggle" onClick={() => setIsDark(!isDark)}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="app-container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <img src="/logo.png" alt="G-CAS Logo" style={{ width: 80, height: 'auto' }} />
            <h1 className="gcas-title" style={{ margin: 0 }}>G-CAS</h1>
          </div>
          <p className="subtitle">Gordon College Appointment System</p>
        </div>
        
        <div className="premium-card">
          <div style={{ marginTop: '1rem' }}>
            <Button onClick={() => navigate('/login/student')}>
              Get Started
            </Button>
          </div>
          
          <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Secure access for @gordoncollege.edu.ph
          </p>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
