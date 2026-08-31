import './CTASection.css';

const trustItems = [
  { icon: '🔐', text: 'Document Vault (Upload Once)' },
  { icon: '⚡', text: 'Real-time SLA Alerts' },
  { icon: '🏛️', text: 'Unified Government Portal' },
  { icon: '🪟', text: 'Single Window System' },
];

const metrics = [
  { value: '3x', label: 'Faster Approvals' },
  { value: '0', label: 'Repeat Submissions' },
  { value: '100%', label: 'Status Visibility' },
];

export default function CTASection() {
  return (
    <section className="cta-section" id="about">
      <div className="container">
        <div className="cta-inner">
          <div className="cta-grid" aria-hidden="true" />
          <div className="cta-orb-1" aria-hidden="true" />
          <div className="cta-orb-2" aria-hidden="true" />
          <div className="cta-shine" aria-hidden="true" />

          <div className="cta-content">
            {/* Badge */}
            <div className="cta-badge">
              <span className="cta-badge-icon">🏆</span>
              Smart India Hackathon 2026 · Problem #26130
            </div>

            {/* Metrics row */}
            <div className="cta-metrics">
              {metrics.map((m) => (
                <div key={m.label} className="cta-metric">
                  <div className="cta-metric-value">{m.value}</div>
                  <div className="cta-metric-label">{m.label}</div>
                </div>
              ))}
            </div>

            <h2 className="cta-heading">
              Your business approvals,{' '}
              <span className="cta-heading-accent">simplified.</span>
            </h2>

            <p className="cta-sub">
              FreshChain Cold Logistics completed their full approval roadmap on BuildX in days.
              Enter your business profile and get your personalized roadmap in minutes.
            </p>

            <div className="cta-buttons">
              <a href="/register" className="cta-btn-primary" id="cta-entrepreneur-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Start as Entrepreneur
              </a>
              <a href="/login?role=officer" className="cta-btn-secondary" id="cta-officer-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                Government Officer Login
              </a>
            </div>

            <div className="cta-trust">
              {trustItems.map((item) => (
                <div key={item.text} className="cta-trust-item">
                  <span className="cta-trust-icon">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
