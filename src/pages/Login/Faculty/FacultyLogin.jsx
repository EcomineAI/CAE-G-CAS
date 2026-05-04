import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Moon, Sun } from 'lucide-react';
import ToggleRole from '../../../components/ToggleRole';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { supabase } from '../../../supabase/supabase';
import { isValidRoleEmail } from '../../../utils/authUtils';

const FacultyLogin = () => {
  const [activeRole, setActiveRole] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDark, setIsDark] = useState(() => localStorage.getItem('gcas_auth_theme') === 'dark');
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
    localStorage.setItem('gcas_auth_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'student') {
      navigate('/login/student');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    if (!isValidRoleEmail(email, 'faculty')) {
      setError('This login is for Faculty only. Please use the Student login page.');
      return;
    }
    
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Store user info or role if needed, then navigate
      navigate('/faculty');
    }
  };

  return (
    <>
      <div className="auth-bg-wrapper"></div>
      <button className="auth-theme-toggle" onClick={() => setIsDark(!isDark)}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="app-container">
        <div style={{ textAlign: 'center', margin: '2rem 0 1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
            <img src="/logo.png" alt="G-CAS Logo" style={{ width: 60, height: 'auto' }} />
            <h1 className="gcas-title" style={{ margin: 0 }}>G-CAS</h1>
          </div>
          <p className="subtitle">Gordon College Appointment System</p>
        </div>

        <ToggleRole activeRole={activeRole} onChange={handleRoleChange} />

        <div className="premium-card">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, textAlign: 'left', color: 'var(--heading-color)' }}>Faculty LogIn</h2>

          {error && (
            <div style={{ padding: '0.8rem', background: 'var(--error-bg)', color: 'var(--error-text)', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <Input 
              label="Institutional Email" 
              placeholder="email@gordoncollege.edu.ph" 
              icon={Mail} 
              type="email"
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
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default FacultyLogin;
