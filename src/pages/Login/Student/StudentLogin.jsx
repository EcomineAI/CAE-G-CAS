import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle } from 'lucide-react';
import ToggleRole from '../../../components/ToggleRole';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { supabase } from '../../../supabase/supabase';
import { isValidRoleEmail } from '../../../utils/authUtils';

const StudentLogin = () => {
  const [activeRole, setActiveRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'faculty') {
      navigate('/login/faculty');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError('');

    // Assuming the students use their ID as an email prefix: 2024123456@gordoncollege.edu.ph
    const loginEmail = email.includes('@') ? email : `${email}@gordoncollege.edu.ph`;

    if (!isValidRoleEmail(loginEmail, 'student')) {
      setError('This login is for Students only. Please use the Faculty login page.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/student');
    }
  };

  return (
    <div className="app-container">
      <div style={{ textAlign: 'center', margin: '2rem 0 1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
          <img src="/src/pages/logo.png" alt="G-CAS Logo" style={{ width: 60, height: 'auto' }} />
          <h1 className="gcas-title" style={{ margin: 0 }}>G-CAS</h1>
        </div>
        <p className="subtitle">Gordon College Appointment System</p>
      </div>

      <ToggleRole activeRole={activeRole} onChange={handleRoleChange} />

      <div className="premium-card">
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, textAlign: 'left', color: '#000' }}>Student LogIn</h2>

        {error && (
          <div style={{ padding: '0.8rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <Input
            label="Username or Email"
            placeholder="e.g. 2024123456"
            icon={User}
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
