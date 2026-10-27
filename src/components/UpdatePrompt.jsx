import React, { useEffect, useState, useRef } from 'react';

const styles = `
.up-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: upFadeIn 0.2s ease;
}
@keyframes upFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.up-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  padding: 2rem 2rem 1.6rem;
  max-width: 420px; width: 100%;
  text-align: center;
  animation: upSlideUp 0.22s ease;
}
@keyframes upSlideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.dark .up-card { background: #1e263c; }
.up-icon {
  width: 52px; height: 52px; border-radius: 14px;
  background: #e8eef8; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1rem;
}
.up-title {
  font-size: 1.1rem; font-weight: 800; color: #1a2d5a;
  margin: 0 0 0.5rem;
}
.dark .up-title { color: #e0e7ff; }
.up-body {
  font-size: 0.85rem; color: #4b5563; line-height: 1.55;
  margin: 0 0 1.4rem;
}
.dark .up-body { color: #9ca3af; }
.up-btn {
  width: 100%; padding: 0.85rem;
  background: #1a2d5a; color: #fff;
  border: none; border-radius: 10px;
  font-size: 0.95rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.up-btn:hover { background: #152348; }
.up-hash {
  margin-top: 0.75rem;
  font-size: 0.7rem; color: #9ca3af;
  font-family: ui-monospace, monospace;
}
`;

const POLL_INTERVAL_MS = 5 * 60 * 1000;

export default function UpdatePrompt() {
  const [ready, setReady] = useState(false);
  const [newHash, setNewHash] = useState(null);
  const currentHash = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : null;
  const pollingRef = useRef(null);

  const checkVersion = async () => {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.hash && currentHash && data.hash !== currentHash && data.hash !== 'dev') {
        setNewHash(data.hash);
        setReady(true);
      }
    } catch {
      // network error — skip
    }
  };

  useEffect(() => {
    // Service worker update: new SW takes control → show prompt
    const handleControllerChange = () => setReady(true);
    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

    // Poll on window focus
    const handleFocus = () => checkVersion();
    window.addEventListener('focus', handleFocus);

    // Background polling
    pollingRef.current = setInterval(checkVersion, POLL_INTERVAL_MS);

    // Initial check after a short delay (let SW register first)
    const t = setTimeout(checkVersion, 8000);

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollingRef.current);
      clearTimeout(t);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="up-overlay">
        <div className="up-card">
          <div className="up-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a2d5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </div>
          <p className="up-title">Update Available</p>
          <p className="up-body">
            A new version of Askademic is available! Please refresh to apply the latest updates and prevent data synchronization errors.
          </p>
          <button className="up-btn" onClick={() => window.location.reload()}>
            Refresh Now
          </button>
          {newHash && <p className="up-hash">v{newHash}</p>}
        </div>
      </div>
    </>
  );
}
