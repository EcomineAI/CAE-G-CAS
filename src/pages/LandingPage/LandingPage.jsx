import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';


const LandingPage = () => {
  const navigate = useNavigate();

  return (
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
        
        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#888', textAlign: 'center' }}>
          Secure access for @gordoncollege.edu.ph
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
