import { useEffect, useRef } from 'react';
import './HeroSection.css';

const quickActions = [
  {
    label: 'Start as Entrepreneur',
    desc: 'Build profile, get roadmap, apply for approvals',
    color: '#f97316',
    badge: 'New Registration',
    href: '/register',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    label: 'Entrepreneur Dashboard',
    desc: 'Track applications, respond to queries, view roadmap',
    color: '#1a3a8a',
    badge: 'My Account',
    href: '/dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: 'Track Application',
    desc: 'Real-time status, timeline, query updates',
    color: '#16a34a',
    badge: 'Status Check',
    href: '/track',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    label: 'Government Officer Portal',
    desc: 'Review applications, raise queries, schedule inspections',
    color: '#7c3aed',
    badge: 'Officers Only',
    href: '/gov',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
];

const stats = [
  { value: '4', suffix: '', label: 'Sectors Covered' },
  { value: '12', suffix: '', label: 'Sub-sectors' },
  { value: '18', suffix: '+', label: 'Modules' },
  { value: '9', suffix: '+', label: 'Approval Types' },
  { value: '1', suffix: '', label: 'Single Window' },
];

export default function HeroSection() {
  const particlesRef = useRef(null);

  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="hero" id="hero">
      {/* Canvas particles */}
      <canvas ref={particlesRef} className="hero-particles" aria-hidden="true" />

      {/* Animated background */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid" />
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="hero-bg-orb hero-bg-orb-3" />
        <div className="hero-diagonal-line hero-dl-1" />
        <div className="hero-diagonal-line hero-dl-2" />
      </div>

      {/* Main content */}
      <div className="hero-content">
        <div className="container hero-content-inner">

          {/* Left column */}
          <div className="hero-left">

            {/* Official pill */}
            <div className="hero-official-pill" style={{ animationDelay: '0ms' }}>
              <span className="hero-pill-sih">SIH 2026</span>
              <span className="hero-pill-dot" />
              Problem Statement #26130 · Maharashtra
            </div>

            {/* Heading */}
            <h1 className="hero-heading">
              One Platform.
              <br />
              Every Approval
              <br />
              <span className="hero-heading-accent">Simplified.</span>
            </h1>

            {/* Sub */}
            <p className="hero-sub">
              BuildX replaces fragmented department visits with a single intelligent window —
              personalized roadmaps, pre-validated applications, real-time tracking, and direct
              government officer connectivity.
            </p>

            {/* Trust signals row */}
            <div className="hero-trust-row">
              <div className="hero-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Govt. Verified</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>Real-time Tracking</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <span>SLA Guaranteed</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hero-ctas">
              <a href="/register" className="hero-cta-primary" id="hero-start-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Start Your Journey
              </a>
              <a href="/login?demo=entrepreneur" className="hero-cta-secondary" id="hero-demo-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                View Live Demo
              </a>
            </div>
          </div>

          {/* Right column — Quick Action Cards */}
          <div className="hero-right">
            <div className="hero-portal-label">
              <span className="portal-label-line" />
              <span>Quick Access</span>
              <span className="portal-label-line" />
            </div>
            <div className="hero-quick-actions">
              {quickActions.map((qa, idx) => (
                <a
                  key={qa.label}
                  href={qa.href}
                  className="quick-action-card"
                  style={{ '--qa-color': qa.color, animationDelay: `${idx * 80}ms` }}
                  id={`quick-action-${idx}`}
                >
                  <div className="qa-top">
                    <div className="qa-icon" style={{ background: `${qa.color}20`, border: `1.5px solid ${qa.color}30` }}>
                      <div style={{ color: qa.color }}>{qa.icon}</div>
                    </div>
                    <span className="qa-badge" style={{ color: qa.color, background: `${qa.color}15`, border: `1px solid ${qa.color}25` }}>
                      {qa.badge}
                    </span>
                  </div>
                  <div className="qa-label">{qa.label}</div>
                  <div className="qa-desc">{qa.desc}</div>
                  <div className="qa-footer">
                    <span className="qa-link-text">Access Portal</span>
                    <div className="qa-arrow" style={{ background: `${qa.color}20` }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Demo context badge */}
            <div className="hero-demo-badge">
              <div className="demo-badge-dot" />
              <div className="demo-badge-content">
                <span className="demo-badge-label">Hero Demo</span>
                <span className="demo-badge-name">FreshChain Cold Logistics Pvt. Ltd.</span>
              </div>
              <span className="demo-badge-id">APP-MH-2026-00124</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="hero-stats-bar">
        <div className="container">
          <div className="hero-stats-bar-inner">
            {stats.map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">
                  {s.value}
                  {s.suffix && <span>{s.suffix}</span>}
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
