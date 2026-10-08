import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Catches any uncaught render error in children and shows a readable fallback
// instead of leaving the user staring at a blank white screen.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '2rem',
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{
          background: '#fff', border: '1px solid #e5e8f0', borderRadius: 16,
          maxWidth: 460, width: '100%', padding: '2rem',
          boxShadow: '0 4px 16px rgba(26,45,90,0.08)', textAlign: 'center',
        }}>
          <div style={{
            width: 54, height: 54, margin: '0 auto 1rem',
            background: '#fee2e2', color: '#dc2626',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={26} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2d5a', margin: '0 0 0.4rem' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            This section crashed while loading. Please try reloading the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.7rem 1.3rem', background: '#1a2d5a', color: '#fff',
              border: 'none', borderRadius: 10, fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={15} /> Reload page
          </button>
          {this.state.error && (
            <details style={{ marginTop: '1.2rem', textAlign: 'left', fontSize: '0.72rem', color: '#9ca3af' }}>
              <summary style={{ cursor: 'pointer' }}>Technical details</summary>
              <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {String(this.state.error?.message || this.state.error)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
