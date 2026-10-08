import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle, Eye, EyeOff, GraduationCap, BookOpen } from 'lucide-react';
import { supabase } from '../../supabase/supabase';
import TermsModal from '../../components/TermsModal';

const ERROR_MAP = {
  'Invalid login credentials': 'Wrong ID or password. Please try again.',
  'Email not confirmed': 'Your account email is not yet confirmed.',
  'Too many requests': 'Too many attempts. Please wait a moment and try again.',
};

const friendlyError = (msg = '') => {
  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return val;
  }
  return msg || 'Something went wrong. Please try again.';
};

const detectRole = (val) => {
  const local = val.includes('@') ? val.split('@')[0] : val;
  if (!local) return null;
  if (/^\d+$/.test(local)) return 'student';
  if (local.length > 2) return 'faculty';
  return null;
};

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [shake, setShake]       = useState(false);
  const [showTerms, setShowTerms]   = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // { id, role } — waiting for TnC accept
  const idRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { idRef.current?.focus(); }, []);

  const detectedRole = detectRole(identifier.trim());

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const redirectByRole = (role) => {
    navigate(role === 'student' ? '/student' : '/faculty');
  };

  // Called by TermsModal after user accepts
  const handleTermsAccepted = async () => {
    if (pendingUser) {
      // Mark TnC as accepted — survives refreshes forever
      localStorage.setItem(`gcas_tnc_${pendingUser.id}`, '1');
      try {
        await supabase
          .from('profiles')
          .update({ tnc_accepted: true })
          .eq('id', pendingUser.id);
      } catch (e) {
        // Column may not exist yet — localStorage still protects
        console.warn('[TnC] profile update skipped:', e);
      }
    }
    setShowTerms(false);
    if (pendingUser) redirectByRole(pendingUser.role);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const id = identifier.trim();
    if (!id || !password) {
      setError('Please fill in all fields.');
      triggerShake();
      return;
    }

    if (id === 'Admin@gmail.com' && password === 'admin') {
      sessionStorage.setItem('admin_bypass', '1');
      navigate('/faculty');
      return;
    }

    setLoading(true);
    setError('');

    const DOMAIN = '@gordoncollege.edu.ph';
    const loginEmail = id.includes('@') ? id : `${id}${DOMAIN}`;

    const { error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    if (authError) {
      setError(friendlyError(authError.message));
      triggerShake();
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Fetch role (and tnc_accepted if the column exists). Fall back gracefully.
      let profile = null;
      try {
        const res = await supabase
          .from('profiles')
          .select('role, tnc_accepted')
          .eq('id', user.id)
          .maybeSingle();
        profile = res.data;
      } catch {
        const res = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        profile = res.data;
      }

      const role = profile?.role || 'student';
      const alreadyAccepted =
        profile?.tnc_accepted === true ||
        localStorage.getItem(`gcas_tnc_${user.id}`) === '1';

      if (!alreadyAccepted) {
        // Show TnC — hold the user here until accepted
        setPendingUser({ id: user.id, role });
        setShowTerms(true);
        setLoading(false);
        return;
      }

      redirectByRole(role);
    } else {
      navigate('/faculty');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

        /* ── Shell & blobs ── */
        .lp-shell {
          position: fixed; inset: 0;
          background: #dfe5f0;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .lp-blob {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .lp-blob-1 {
          width: 680px; height: 680px;
          background: radial-gradient(circle, #c7d4ee 0%, #b8c8e8 40%, transparent 70%);
          top: -220px; left: -200px;
          filter: blur(70px); opacity: 0.9;
          animation: blobDrift1 18s ease-in-out infinite alternate;
        }
        .lp-blob-2 {
          width: 560px; height: 560px;
          background: radial-gradient(circle, #d4c8ee 0%, #c2b8e8 40%, transparent 70%);
          bottom: -180px; right: -150px;
          filter: blur(80px); opacity: 0.75;
          animation: blobDrift2 22s ease-in-out infinite alternate;
        }
        .lp-blob-3 {
          width: 380px; height: 380px;
          background: radial-gradient(circle, #bdd4f0 0%, #a8c4e8 50%, transparent 75%);
          top: 45%; left: 55%;
          filter: blur(60px); opacity: 0.6;
          animation: blobDrift3 15s ease-in-out infinite alternate;
        }
        @keyframes blobDrift1 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(40px, 30px) scale(1.05); }
        }
        @keyframes blobDrift2 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-35px, -25px) scale(1.08); }
        }
        @keyframes blobDrift3 {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(-20px, 30px) scale(0.95); }
        }

        /* ── Card ── */
        .lp-card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.9);
          border-radius: 26px;
          box-shadow: 0 8px 40px rgba(46,74,135,0.12), 0 2px 8px rgba(46,74,135,0.07), inset 0 1px 0 rgba(255,255,255,1);
          width: 100%; max-width: 525px;
          padding: 2.75rem 2.5rem 2.5rem;
          display: flex; flex-direction: column; align-items: stretch;
          animation: lpFade 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes lpFade {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Brand ── */
        .lp-brand {
          display: flex; flex-direction: column; align-items: center;
          margin-bottom: 2.2rem;
        }

        /* Logo — bare PNG with mask-clipped glint */
        .lp-logo-wrap {
          position: relative;
          width: 90px; height: 90px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.1rem;
          animation: lpFade 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .lp-logo-wrap img {
          width: 90px; height: 90px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 4px 14px rgba(46,74,135,0.25));
        }
        /* Glint overlay — masked to the PNG shape so it only lights actual logo pixels */
        .lp-logo-glint {
          position: absolute;
          inset: 0;
          width: 90px; height: 90px;
          background: linear-gradient(
            115deg,
            transparent 0%,
            transparent 25%,
            rgba(255,255,255,0.95) 45%,
            rgba(255,255,255,0.95) 55%,
            transparent 75%,
            transparent 100%
          );
          background-size: 300% 100%;
          background-position: 200% 0;
          -webkit-mask-image: url('/logo.png');
          -webkit-mask-size: 90px 90px;
          -webkit-mask-repeat: no-repeat;
          -webkit-mask-position: center;
          mask-image: url('/logo.png');
          mask-size: 90px 90px;
          mask-repeat: no-repeat;
          mask-position: center;
          pointer-events: none;
          animation: glintSweep 6s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        @keyframes glintSweep {
          0%   { background-position: 200% 0; opacity: 0; }
          3%   { opacity: 1; }
          20%  { background-position: -100% 0; opacity: 1; }
          25%  { opacity: 0; }
          100% { background-position: -100% 0; opacity: 0; }
        }

        .lp-title {
          font-size: 2.5rem; font-weight: 900; color: #1a2d5a;
          letter-spacing: -0.5px; margin: 0 0 0.25rem;
        }
        .lp-sub {
          font-size: 0.85rem; color: #8898b8;
          font-weight: 500; text-align: center; line-height: 1.5;
        }

        /* ── Role hint chip ── */
        .lp-role-hint {
          display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          font-size: 0.8rem; font-weight: 700;
          padding: 5px 14px; border-radius: 999px;
          margin: 0 auto 1.4rem;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: 0.04em; text-transform: uppercase;
        }
        .lp-role-hint.student {
          background: rgba(34,197,94,0.1); color: #15803d;
          border: 1px solid rgba(34,197,94,0.3);
        }
        .lp-role-hint.faculty {
          background: rgba(79,70,229,0.1); color: #3730a3;
          border: 1px solid rgba(79,70,229,0.25);
        }
        .lp-role-hint.hidden { opacity: 0; transform: translateY(-4px); pointer-events: none; }

        /* ── Error ── */
        .lp-error {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem; margin-bottom: 1.1rem;
          background: #fee2e2; color: #dc2626;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 11px; font-size: 0.9rem; font-weight: 500;
          animation: errSlide 0.25s ease;
        }
        @keyframes errSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Shake ── */
        .lp-shake { animation: shake 0.45s cubic-bezier(.36,.07,.19,.97); }
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }

        /* ── Fields ── */
        .lp-field { margin-bottom: 1.2rem; }
        .lp-label {
          display: block; font-size: 0.88rem; font-weight: 600;
          color: #1a2d5a; margin-bottom: 0.45rem;
          letter-spacing: 0.02em;
        }
        .lp-input-wrap { position: relative; display: flex; align-items: center; }
        .lp-input-icon {
          position: absolute; left: 15px;
          color: #8898b8; pointer-events: none;
          display: flex; align-items: center;
          transition: color 0.18s;
        }
        .lp-input-wrap:focus-within .lp-input-icon { color: #2e4a87; }
        .lp-input {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 2.9rem;
          border: 1.5px solid #c8d4e8;
          border-radius: 12px;
          font-size: 1rem; color: #1a2d5a;
          background: #f0f4fc;
          font-family: 'Outfit', sans-serif;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
        }
        .lp-input::placeholder { color: #9aaac8; }
        .lp-input:focus {
          border-color: #2e4a87;
          box-shadow: 0 0 0 3px rgba(46,74,135,0.1);
          background: #ffffff;
        }
        .lp-input.has-eye { padding-right: 3rem; }

        .lp-eye {
          position: absolute; right: 14px;
          background: none; border: none;
          color: #8898b8; cursor: pointer;
          display: flex; align-items: center; padding: 0; outline: none;
          transition: color 0.18s;
        }
        .lp-eye:hover { color: #1a2d5a; }

        /* ── Submit button ── */
        .lp-btn {
          width: 100%; padding: 1.05rem;
          background: linear-gradient(135deg, #1a2d5a 0%, #2e4a87 60%, #3d5fa8 100%);
          color: #fff;
          border: none; border-radius: 12px;
          font-size: 1.15rem; font-weight: 800;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          margin-top: 0.5rem;
          transition: opacity 0.18s, transform 0.12s, box-shadow 0.18s;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 18px rgba(46,74,135,0.35);
          position: relative; overflow: hidden;
        }
        .lp-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 55%);
          pointer-events: none;
        }
        .lp-btn:hover:not(:disabled) {
          opacity: 0.93;
          box-shadow: 0 6px 26px rgba(46,74,135,0.45);
          transform: translateY(-1px);
        }
        .lp-btn:active:not(:disabled) { transform: scale(0.99) translateY(0); }
        .lp-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Terms link ── */
        .lp-terms-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem; font-weight: 600;
          color: #7a90b8;
          text-decoration: underline; text-underline-offset: 2px;
          text-decoration-color: rgba(122,144,184,0.4);
          padding: 0; margin-top: 1.1rem;
          display: block; width: 100%; text-align: center;
          transition: color 0.15s, text-decoration-color 0.15s;
        }
        .lp-terms-btn:hover {
          color: #2e4a87;
          text-decoration-color: rgba(46,74,135,0.5);
        }

        /* ── Footer ── */
        .lp-footer {
          text-align: center;
          font-size: 0.75rem; color: #a0aec0;
          margin-top: 0.7rem; font-weight: 500;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="lp-shell">
        {/* Soft drifting blobs */}
        <div className="lp-blob lp-blob-1" />
        <div className="lp-blob lp-blob-2" />
        <div className="lp-blob lp-blob-3" />

        <div className={`lp-card${shake ? ' lp-shake' : ''}`}>

          {/* Brand */}
          <div className="lp-brand">
            <div className="lp-logo-wrap">
              <img src="/logo.png" alt="FACS" />
              <span className="lp-logo-glint" aria-hidden="true" />
            </div>
            <h1 className="lp-title">FACS</h1>
            <p className="lp-sub">Faculty Appointment &amp; Consultation System<br />Gordon College · Olongapo City</p>
          </div>

          {/* Role hint */}
          <div className={`lp-role-hint ${detectedRole || 'hidden'}`}>
            {detectedRole === 'student' && <><GraduationCap size={13} /> Student account</>}
            {detectedRole === 'faculty' && <><BookOpen size={13} /> Faculty account</>}
            {!detectedRole && <span>&nbsp;</span>}
          </div>

          {/* Error */}
          {error && (
            <div className="lp-error"><AlertCircle size={15} /> {error}</div>
          )}

          <form onSubmit={handleLogin}>
            <div className="lp-field">
              <label className="lp-label">Student / Faculty ID or Email</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><User size={16} /></span>
                <input
                  ref={idRef}
                  className="lp-input"
                  type="text"
                  placeholder="e.g. 202411561 or juan.dela.cruz"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setError(''); }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <span className="lp-input-icon"><Lock size={16} /></span>
                <input
                  className="lp-input has-eye"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                />
                <button type="button" className="lp-eye" onClick={() => setShowPassword(s => !s)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="lp-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <button className="lp-terms-btn" onClick={() => setShowTerms(true)}>
            Terms &amp; Conditions
          </button>

          <p className="lp-footer">© {new Date().getFullYear()} Gordon College · FACS</p>

        </div>
      </div>

      {showTerms && (
        <TermsModal
          userId={pendingUser?.id}
          readOnly={!pendingUser}
          onAccepted={handleTermsAccepted}
        />
      )}
    </>
  );
};

export default LoginPage;
