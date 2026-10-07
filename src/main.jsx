import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'

const indexStyles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

/* ── Design Tokens ── */
:root {
  /* Palette — original blue/indigo */
  --bg:        #f0f4ff;
  --surface:   #FFFFFF;
  --ink:       #1a1a1a;
  --muted:     #6b7280;
  --accent:    #4f46e5;
  --border:    #c7d2fe;
  --accent-light: rgba(67, 56, 202, 0.08);
  --accent-hover: #4338ca;

  /* Dark mode palette */
  --dark-bg:      #0c0e1a;
  --dark-surface: rgba(26, 31, 78, 0.92);
  --dark-ink:     #e4e4e7;
  --dark-muted:   #9ca3af;
  --dark-border:  rgba(255,255,255,0.08);
  --dark-accent-light: rgba(129, 140, 248, 0.15);

  /* Typography */
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-body:    'Outfit', 'Inter', system-ui, sans-serif;
  --font-data:    ui-monospace, Consolas, monospace;

  /* Spacing scale */
  --sp-1:  4px;
  --sp-2:  8px;
  --sp-3:  16px;
  --sp-4:  24px;
  --sp-5:  40px;
  --sp-6:  64px;

  /* Radii */
  --r-sm: 4px;
  --r-md: 8px;
  --r-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(79,70,229,0.06), 0 1px 2px rgba(79,70,229,0.04);
  --shadow-md: 0 2px 12px rgba(79,70,229,0.06), 0 1px 4px rgba(79,70,229,0.04);

  /* Transition */
  --ease: all 0.15s ease;

  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.5;
  color: var(--ink);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:root::-webkit-scrollbar { display: none; }

/* ── Global dark mode ── */
.dark, [data-theme="dark"] {
  --bg:           var(--dark-bg);
  --surface:      var(--dark-surface);
  --ink:          var(--dark-ink);
  --muted:        var(--dark-muted);
  --border:       var(--dark-border);
  --accent-light: var(--dark-accent-light);
}

body { margin: 0; background: var(--bg); color: var(--ink); }

#root {
  width: 100%;
  margin: 0;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* ── Typography resets ── */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--ink);
  margin: 0;
  line-height: 1.2;
}

p { margin: 0; }

/* ── Focus visible (global) ── */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: var(--r-sm);
}

input, textarea, select {
  font-size: 16px !important;
  font-family: var(--font-body);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <style>{indexStyles}</style>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
