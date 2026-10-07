import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => localStorage.getItem('gcas_auth_theme') === 'dark');

  useEffect(() => {
    document.documentElement.className = isDark ? 'dark' : '';
    localStorage.setItem('gcas_auth_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <>
      <style>{`
        .landing-shell {
          position: fixed; inset: 0;
          background: #cdd0d8;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem; font-family: 'Outfit', sans-serif;
        }
        .dark .landing-shell { background: #1a1f2e; }

        .landing-theme-btn {
          position: absolute; top: 1.1rem; right: 1.4rem;
          width: 34px; height: 34px; border-radius: 50%;
          border: none; background: rgba(0,0,0,0.07);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6b7280; z-index: 10;
          transition: background 0.18s;
        }
        .dark .landing-theme-btn { background: rgba(255,255,255,0.08); color: #9ca3af; }
        .landing-theme-btn:hover { background: rgba(0,0,0,0.13); color: #1a2d5a; }

        .landing-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 48px rgba(0,0,0,0.14);
          width: 100%; max-width: 480px;
          padding: 2.8rem 2.6rem 2.4rem 2.6rem;
          display: flex; flex-direction: column; align-items: center;
          position: relative;
          animation: landingFade 0.35s ease;
        }
        .dark .landing-card {
          background: #1e2640;
          box-shadow: 0 10px 48px rgba(0,0,0,0.45);
        }
        @keyframes landingFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .landing-logo-row {
          display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.3rem;
        }
        .landing-title {
          font-weight: 900; font-size: 2.6rem; color: #1a2d5a;
          letter-spacing: -0.5px; line-height: 1; margin: 0;
        }
        .dark .landing-title { color: #7b9fd8; }

        .landing-sub {
          font-size: 0.8rem; color: #9ca3af; text-align: center;
          margin: 0 0 2.2rem 0; letter-spacing: 0.3px;
        }

        .landing-divider {
          width: 100%; height: 1px; background: #e5e7eb; margin-bottom: 1.6rem;
        }
        .dark .landing-divider { background: rgba(255,255,255,0.08); }

        .landing-cta-group { display: flex; flex-direction: column; gap: 0.9rem; width: 100%; }

        .landing-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.92rem 1.5rem;
          background: #1a2d5a; color: #ffffff;
          border: none; border-radius: 11px;
          font-family: 'Outfit', sans-serif; font-size: 0.98rem; font-weight: 700;
          cursor: pointer; transition: background 0.18s, transform 0.1s;
          box-shadow: 0 4px 16px rgba(26,45,90,0.22);
        }
        .landing-btn-primary:hover { background: #152348; transform: translateY(-1px); }
        .landing-btn-primary:active { transform: translateY(0); }

        .landing-btn-secondary {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          width: 100%; padding: 0.92rem 1.5rem;
          background: #f1f3f8; color: #1a2d5a;
          border: 1.5px solid #d1d5db; border-radius: 11px;
          font-family: 'Outfit', sans-serif; font-size: 0.98rem; font-weight: 700;
          cursor: pointer; transition: background 0.18s, border-color 0.18s, transform 0.1s;
        }
        .dark .landing-btn-secondary {
          background: rgba(255,255,255,0.06); color: #c7d9f5;
          border-color: rgba(255,255,255,0.1);
        }
        .landing-btn-secondary:hover {
          background: #e5e8f0; border-color: #1a2d5a; transform: translateY(-1px);
        }
        .dark .landing-btn-secondary:hover { background: rgba(255,255,255,0.1); }
        .landing-btn-secondary:active { transform: translateY(0); }

        .landing-footer {
          margin-top: 1.6rem; font-size: 0.72rem;
          color: #b0b8c8; text-align: center; letter-spacing: 0.3px;
        }
      `}</style>

      <div className={`landing-shell${isDark ? ' dark' : ''}`}>
        <button className="landing-theme-btn" onClick={() => setIsDark(d => !d)} title="Toggle theme">
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="landing-card">
          <div className="landing-logo-row">
            <img src="/logo.png" alt="FACS Logo" style={{ width: 56, height: 'auto' }} />
            <h1 className="landing-title">FACS</h1>
          </div>
          <p className="landing-sub">Faculty Appointment &amp; Consultation System</p>

          <div className="landing-divider" />

          <div className="landing-cta-group">
            <button className="landing-btn-primary" onClick={() => navigate('/login')}>
              Get Started <ArrowRight size={17} />
            </button>
          </div>

          <p className="landing-footer">Gordon College · Olongapo City</p>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
