import React, { useEffect, useState, useRef } from 'react';

const styles = `
.up-overlay {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,0.65);
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
  border-radius: 18px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.28);
  padding: 2.2rem 2rem 1.8rem;
  max-width: 400px; width: 100%;
  text-align: center;
  animation: upSlideUp 0.22s ease;
}
@keyframes upSlideUp {
  from { transform: translateY(18px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.dark .up-card { background: #1e263c; }
.up-icon {
  width: 54px; height: 54px; border-radius: 15px;
  background: #e8eef8; display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.1rem;
}
.up-title {
  font-size: 1.15rem; font-weight: 800; color: #1a2d5a;
  margin: 0 0 0.5rem;
}
.dark .up-title { color: #e0e7ff; }
.up-body {
  font-size: 0.855rem; color: #4b5563; line-height: 1.6;
  margin: 0 0 1.5rem;
}
.dark .up-body { color: #9ca3af; }
.up-btn {
  width: 100%; padding: 0.9rem;
  background: #1a2d5a; color: #fff;
  border: none; border-radius: 10px;
  font-size: 0.95rem; font-weight: 700;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s;
  letter-spacing: 0.01em;
}
.up-btn:hover { background: #152348; }
.up-version {
  margin-top: 0.8rem;
  font-size: 0.68rem; color: #9ca3af;
  font-family: ui-monospace, monospace;
}
`;

// How often to poll in the background (ms)
const POLL_MS = 60 * 1000;

// The build hash baked into THIS bundle at Vite build time
const CURRENT_VERSION = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : null;

// Fetch /index.html and extract the app-version meta tag content
const fetchDeployedVersion = async () => {
  try {
    const res = await fetch(`/?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<meta name="app-version" content="([^"]+)"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
};

export default function UpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);
  const [deployedVersion, setDeployedVersion] = useState(null);
  const timerRef = useRef(null);
  const checkedRef = useRef(false); // prevent double-fire

  const check = async () => {
    // If no version baked in (local dev), skip
    if (!CURRENT_VERSION || CURRENT_VERSION === 'dev') return;
    const deployed = await fetchDeployedVersion();
    if (!deployed || deployed === 'dev') return;
    if (deployed !== CURRENT_VERSION && !checkedRef.current) {
      checkedRef.current = true;
      setDeployedVersion(deployed);
      setUpdateReady(true);
    }
  };

  useEffect(() => {
    // SW controller change = new service worker activated = new deploy
    const onControllerChange = () => {
      if (!checkedRef.current) {
        checkedRef.current = true;
        setUpdateReady(true);
      }
    };
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);

    // Check on tab becoming visible (user switching back to the tab)
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Also check on window focus (desktop browser tab switch)
    window.addEventListener('focus', check);

    // Background polling every 60s
    timerRef.current = setInterval(check, POLL_MS);

    // Initial check after 10s (let the app fully load first)
    const boot = setTimeout(check, 10_000);

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', check);
      clearInterval(timerRef.current);
      clearTimeout(boot);
    };
  }, []);

  if (!updateReady) return null;

  return (
    <>
      <style>{styles}</style>
      <div className="up-overlay">
        <div className="up-card">
          <div className="up-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#1a2d5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6"/>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
              <path d="M3 22v-6h6"/>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
          </div>
          <p className="up-title">Update Available</p>
          <p className="up-body">
            A new version of Askademic is available! Please refresh to apply
            the latest updates and prevent data synchronization errors.
          </p>
          <button className="up-btn" onClick={() => window.location.reload()}>
            Refresh Now
          </button>
          {deployedVersion && (
            <p className="up-version">
              {CURRENT_VERSION} → {deployedVersion}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
