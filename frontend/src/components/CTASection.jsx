import './CTASection.css';

const trustItems = [
  'Reusable document vault',
  'Pre-submission validation',
  'Connected officer workflow',
  'Application timeline',
];

const metrics = [
  { value: '4', label: 'Sector groups' },
  { value: '12', label: 'Sub-sectors' },
  { value: '1', label: 'Configured hero pathway' },
];

export default function CTASection() {
  return (
    <section className="cta-section" id="about">
      <div className="container">
        <div className="cta-inner">
          <div className="cta-content">
            <div className="cta-badge">
              Smart India Hackathon 2026 <span>Problem statement 26130</span>
            </div>

            <div className="cta-main">
              <div className="cta-copy">
                <div className="cta-kicker">Continue to the platform</div>
                <h2 className="cta-heading">Prepare and follow your approval journey in one place.</h2>
                <p className="cta-sub">
                  Explore the FreshChain Cold Logistics demonstration to see how a business
                  profile, roadmap, documents and departmental workflow stay connected.
                </p>

                <div className="cta-buttons">
                  <a href="/register" className="cta-btn-primary" id="cta-entrepreneur-btn">
                    Start as Entrepreneur
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                  <a href="/login?role=officer" className="cta-btn-secondary" id="cta-officer-btn">
                    Government Officer Login
                  </a>
                </div>
              </div>

              <aside className="cta-scope" aria-label="Prototype coverage">
                <div className="cta-scope-title">Prototype coverage</div>
                <div className="cta-metrics">
                  {metrics.map((m) => (
                    <div key={m.label} className="cta-metric">
                      <div className="cta-metric-value">{m.value}</div>
                      <div className="cta-metric-label">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="cta-scope-note">Maharashtra demonstration dataset</div>
              </aside>
            </div>

            <div className="cta-trust">
              {trustItems.map((item) => (
                <div key={item} className="cta-trust-item">
                  <span className="cta-trust-marker" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
