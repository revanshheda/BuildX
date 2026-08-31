import { StrictMode } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    localStorage.removeItem('buildx_sih_state_v1');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            background: '#f8fafc',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              background: '#fff',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <div style={{ fontSize: '13px', color: '#dc2626', fontWeight: 700, marginBottom: '8px' }}>
              RUNTIME ERROR — BUILDX
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Application crashed
            </h1>
            <pre
              style={{
                fontSize: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                padding: '12px',
                overflowX: 'auto',
                color: '#991b1b',
                marginBottom: '20px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack?.split('\n').slice(0, 6).join('\n')}
            </pre>
            <button
              onClick={this.handleReset}
              style={{
                background: '#1d4ed8',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Clear State &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
