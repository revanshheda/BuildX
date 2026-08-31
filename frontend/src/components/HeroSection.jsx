import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import './HeroSection.css';

const stats = [
  { value: '4', suffix: '', label: 'Sectors Covered' },
  { value: '12', suffix: '', label: 'Sub-sectors' },
  { value: '18', suffix: '+', label: 'Modules' },
  { value: '9', suffix: '+', label: 'Approval Types' },
  { value: '1', suffix: '', label: 'Single Window' },
];

const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CheckCircle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default function HeroSection({ onOpenAuth }) {
  const navigate = useNavigate();
  const { setPersona } = useAppStore();

  const handleStartJourney = (e) => {
    e.preventDefault();
    if (onOpenAuth) {
      onOpenAuth('ENTREPRENEUR');
    } else {
      setPersona('persona_entrepreneur');
      navigate('/dashboard');
    }
  };

  const handleViewDemo = (e) => {
    e.preventDefault();
    setPersona('persona_entrepreneur');
    navigate('/dashboard');
  };

  const handleQuickAction = (id, e) => {
    e.preventDefault();
    if (id === 'quick-start') {
      if (onOpenAuth) onOpenAuth('ENTREPRENEUR');
      else {
        setPersona('persona_entrepreneur');
        navigate('/business-profile');
      }
    } else if (id === 'quick-dash') {
      setPersona('persona_entrepreneur');
      navigate('/dashboard');
    } else if (id === 'quick-track') {
      setPersona('persona_entrepreneur');
      navigate('/application/hero-fssai-01');
    } else if (id === 'quick-gov') {
      setPersona('persona_officer');
      navigate('/government/dashboard');
    }
  };

  return (
    <section className="hero" id="hero">
      {/* Main content */}
      <div className="hero-content">
        <div className="container hero-content-inner">

          {/* ── Left column ── */}
          <div className="hero-left">
            {/* Orange accent rule above heading */}
            <div className="hero-accent-rule" aria-hidden="true" />

            {/* Heading */}
            <h1 className="hero-heading">
              One Platform.<br />
              Every Approval.<br />
              <span className="hero-heading-accent">Simplified.</span>
            </h1>

            {/* Sub */}
            <p className="hero-sub">
              BuildX replaces fragmented department visits with a single intelligent window
              personalised roadmaps, prevalidated applications, realtime tracking, and direct
              government officer connectivity.
            </p>

            {/* Trust signals */}
            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <CheckCircle />
                <span>Govt. Verified</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle />
                <span>Realtime Tracking</span>
              </div>
              <div className="hero-trust-item">
                <CheckCircle />
                <span>SLA Guaranteed</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hero-ctas">
              <button onClick={handleStartJourney} className="hero-cta-primary" id="hero-start-btn">
                Start Your Journey
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={handleViewDemo} className="hero-cta-secondary" id="hero-demo-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                View Demo
              </button>
            </div>
          </div>

          {/* ── Right column — Quick Access cards ── */}
          <div className="hero-right">
            <div className="hero-panel-header">
              <span className="hero-panel-title">QUICK ACCESS</span>
            </div>

            <div className="hero-quick-actions">
              {/* 1. Start as Entrepreneur */}
              <div
                onClick={(e) => handleQuickAction('quick-start', e)}
                id="quick-action-0"
                className="quick-action-card"
              >
                <div className="qa-icon">
                  <div className="qa-icon-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  </div>
                </div>
                <div className="qa-body">
                  <div className="qa-label">Start as Entrepreneur</div>
                  <div className="qa-desc">Register your business, get a personalised approval road...</div>
                </div>
                <div className="qa-chevron">
                  <ChevronRight />
                </div>
              </div>

              {/* 2. Entrepreneur Dashboard */}
              <div
                onClick={(e) => handleQuickAction('quick-dash', e)}
                id="quick-action-1"
                className="quick-action-card"
              >
                <div className="qa-icon">
                  <div className="qa-icon-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                </div>
                <div className="qa-body">
                  <div className="qa-label">Entrepreneur Dashboard</div>
                  <div className="qa-desc">Track applications, respond to queries, view your roadmap</div>
                </div>
                <div className="qa-chevron">
                  <ChevronRight />
                </div>
              </div>

              {/* 3. Track Application */}
              <div
                onClick={(e) => handleQuickAction('quick-track', e)}
                id="quick-action-2"
                className="quick-action-card quick-action-active"
              >
                <div className="qa-icon">
                  <div className="qa-icon-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  </div>
                </div>
                <div className="qa-body">
                  <div className="qa-label">Track Application</div>
                  <div className="qa-desc">View real-time status, timeline and query updates</div>
                </div>
                <div className="qa-chevron">
                  <ChevronRight />
                </div>
              </div>

              {/* 4. Government Officer Portal */}
              <div
                onClick={(e) => handleQuickAction('quick-gov', e)}
                id="quick-action-3"
                className="quick-action-card"
              >
                <div className="qa-icon">
                  <div className="qa-icon-inner">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                </div>
                <div className="qa-body">
                  <div className="qa-label">Government Officer Portal</div>
                  <div className="qa-desc">Review applications, raise queries, schedule inspections</div>
                </div>
                <div className="qa-chevron">
                  <ChevronRight />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div className="hero-stats-bar">
        <div className="container">
          <div className="hero-stats-bar-inner">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">
                  {s.value}{s.suffix && <span style={{ color: '#F28C00', fontWeight: 800 }}>{s.suffix}</span>}
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
