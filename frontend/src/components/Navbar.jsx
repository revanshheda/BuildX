import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import './Navbar.css';

export default function Navbar({ onOpenAuth }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { setPersona } = useAppStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (onOpenAuth) {
      onOpenAuth('ENTREPRENEUR');
    } else {
      setPersona('persona_entrepreneur');
      navigate('/dashboard');
    }
  };

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (onOpenAuth) {
      onOpenAuth('ENTREPRENEUR');
    } else {
      setPersona('persona_entrepreneur');
      navigate('/business-profile');
    }
  };

  return (
    <>
      {/* Tricolor stripe — always at very top */}
      <div className="tricolor-bar" aria-hidden="true" />

      {/* Single unified navbar */}
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container navbar-inner">

          {/* ── LEFT: Ashoka Emblem + BuildX title ── */}
          <Link to="/" className="navbar-brand" aria-label="BuildX — Government of Maharashtra">
            {/* Ashoka emblem */}
            <div className="navbar-emblem" aria-hidden="true">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="16" r="11" stroke="#F28C00" strokeWidth="1.4" fill="none" opacity="0.9"/>
                <circle cx="18" cy="16" r="2.8" fill="#F28C00"/>
                {Array.from({ length: 24 }, (_, i) => {
                  const angle = (i * 15 - 90) * Math.PI / 180;
                  return (
                    <line
                      key={i}
                      x1={18 + 3.2 * Math.cos(angle)}
                      y1={16 + 3.2 * Math.sin(angle)}
                      x2={18 + 9.5 * Math.cos(angle)}
                      y2={16 + 9.5 * Math.sin(angle)}
                      stroke="#F28C00"
                      strokeWidth="0.9"
                      opacity="0.8"
                    />
                  );
                })}
                <rect x="8" y="29" width="20" height="2.2" rx="1.1" fill="#F28C00" opacity="0.85"/>
                <rect x="11" y="32.5" width="14" height="2" rx="1" fill="#F28C00" opacity="0.6"/>
              </svg>
            </div>

            {/* BuildX + Gov of Maharashtra stacked */}
            <div className="navbar-identity">
              <span className="navbar-buildx-name">Build<span className="navbar-x">X</span></span>
              <span className="navbar-gov-sub">Government of Maharashtra</span>
            </div>
          </Link>

          {/* ── CENTER: Nav links ── */}
          <div className="navbar-links">
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#sectors" className="nav-link">Sectors</a>
            <a href="#about" className="nav-link">About</a>
          </div>

          {/* ── RIGHT: Utility + Actions ── */}
          <div className="navbar-actions">
            {/* Language switcher */}
            <div className="navbar-lang">
              <span className="lang-link" lang="hi" style={{ cursor: 'pointer' }}>हिंदी</span>
              <span className="lang-sep">|</span>
              <span className="lang-link" lang="mr" style={{ cursor: 'pointer' }}>मराठी</span>
            </div>

            <div className="navbar-actions-divider" aria-hidden="true" />

            {/* Live indicator */}
            <div className="navbar-live">
              <span className="live-dot" />
              <span className="live-text">Live</span>
            </div>

            {/* Sign In */}
            <button
              onClick={handleSignIn}
              className="navbar-btn-login"
              id="nav-login-btn"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Sign In
            </button>

            {/* Register CTA */}
            <button
              onClick={handleGetStarted}
              className="navbar-btn-register"
              id="nav-register-btn"
            >
              Get Started
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Hamburger */}
            <button
              className="navbar-hamburger"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className={`hb ${mobileOpen ? 'open' : ''}`} />
              <span className={`hb ${mobileOpen ? 'open' : ''}`} />
              <span className={`hb ${mobileOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="navbar-mobile-menu">
            <div className="container">
              <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How It Works</a>
              <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
              <a href="#sectors" onClick={() => setMobileOpen(false)}>Sectors</a>
              <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
              <div className="mobile-divider" />
              <div className="mobile-lang">
                <span lang="hi">हिंदी</span>
                <span lang="mr">मराठी</span>
              </div>
              <button onClick={(e) => { setMobileOpen(false); handleSignIn(e); }} className="mobile-login" style={{ width: '100%', padding: '10px', background: 'transparent', color: '#fff', cursor: 'pointer', borderRadius: '6px' }}>Sign In</button>
              <button onClick={(e) => { setMobileOpen(false); handleGetStarted(e); }} className="mobile-register" style={{ width: '100%', padding: '10px', background: '#F28C00', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', marginTop: '6px' }}>Get Started →</button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
