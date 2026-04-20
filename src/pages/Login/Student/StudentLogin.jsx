import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import ToggleRole from '../../../components/ToggleRole';
import Input from '../../../components/Input';
import Button from '../../../components/Button';


const StudentLogin = () => {
  const [activeRole, setActiveRole] = useState('student');
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'faculty') {
      navigate('/login/faculty');
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
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, textAlign: 'left', color: '#000' }}>Student LogIn</h2>

        <form onSubmit={(e) => e.preventDefault()}>
          <Input
            label="Username"
            placeholder="e.g. 2024123456"
            icon={User}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
          />

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button type="submit">
              Login
            </Button>
            <button 
              type="button" 
              onClick={() => navigate('/student')}
              style={{ 
                padding: '12px', 
                borderRadius: '10px', 
                border: '1px solid #d1d5db', 
                background: 'transparent', 
                cursor: 'pointer', 
                color: '#5f6368', 
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              Skip (Test Dashboard)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
