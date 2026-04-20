import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import ToggleRole from '../../../components/ToggleRole';
import Input from '../../../components/Input';
import Button from '../../../components/Button';


const FacultyLogin = () => {
  const [activeRole, setActiveRole] = useState('faculty');
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'student') {
      navigate('/login/student');
    }
  };

  return (
    <div className="app-container">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
          <img src="/src/pages/logo.png" alt="G-CAS Logo" style={{ width: 60, height: 'auto' }} />
          <h1 className="gcas-title" style={{ margin: 0 }}>G-CAS</h1>
        </div>
        <p className="subtitle">Gordon College Appointment System</p>
      </div>

      <ToggleRole activeRole={activeRole} onChange={handleRoleChange} />

      <div className="premium-card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, textAlign: 'left', color: '#000' }}>Faculty LogIn</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          <Input 
            label="Institutional Email" 
            placeholder="email@gordoncollege.edu.ph" 
            icon={Mail} 
            type="email"
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            icon={Lock} 
          />
          
          <div style={{ marginTop: '1rem' }}>
            <Button type="submit">
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyLogin;
