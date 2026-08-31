import { useState } from 'react';
import './Features.css';

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const roadmapItems = [
  { name: 'MIDC Building Plan + Provisional Fire NOC', authority: 'MIDC / Fire Dept.', status: 'done', badge: 'Approved' },
  { name: 'FSSAI Registration / Licence', authority: 'FSSAI', status: 'active', badge: 'Under Review' },
  { name: 'MPCB Consent to Establish', authority: 'MPCB', status: 'todo', badge: 'Pending' },
  { name: 'Industrial Electricity Connection', authority: 'MSEDCL', status: 'todo', badge: 'Pending' },
  { name: 'MIDC Water Connection', authority: 'MIDC', status: 'todo', badge: 'Pending' },
  { name: 'Factory Licence', authority: 'Labour Department', status: 'review', badge: 'Needs Review' },
];

const validationRows = [
  { label: 'Required fields complete', pass: true },
  { label: 'Applicant details verified', pass: true },
  { label: 'Business info consistent', pass: true },
  { label: 'Process Flow document uploaded', pass: false },
  { label: 'Declaration signed', pass: true },
];

const dashboardActions = [
  { label: 'Respond to Process Flow query', meta: 'FSSAI · Action required', tone: 'warning' },
  { label: 'Inspection scheduled', meta: '05 Sep 2026 · 11:00 AM', tone: 'navy' },
  { label: 'FSSAI application', meta: 'Under departmental review', tone: 'success' },
];

const queryItems = [
  { label: 'Revised Process Flow Required', meta: 'FSSAI · Response due on configured date', state: 'Action required' },
  { label: 'Site inspection', meta: 'Pune MIDC · 05 Sep 2026, 11:00 AM', state: 'Scheduled' },
  { label: 'MPCB clarification', meta: 'Response submitted on 02 Sep 2026', state: 'Under review' },
];

const governmentQueue = [
  { id: 'APP-MH-2026-00124', business: 'FreshChain Cold Logistics', status: 'Under Review' },
  { id: 'APP-MH-2026-00119', business: 'Sahyadri Food Processors', status: 'Query Response' },
  { id: 'APP-MH-2026-00112', business: 'Pune Distribution Hub', status: 'Final Review' },
];

const features = [
  {
    title: 'Entrepreneur Dashboard',
    desc: 'Single-window command center prioritizing action items, upcoming inspections, and queries.',
    visual: 'dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    title: 'Personalized Roadmap',
    desc: 'An ordered, dynamic approval pathway tracking progress across all departments in real-time.',
    visual: 'roadmap',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    title: 'Document Pre-validation',
    desc: 'Catches missing documents and format errors before submission — preventing rejections at the source.',
    visual: 'validation',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 12 18 15 15"/>
      </svg>
    ),
  },
  {
    title: 'Query & Inspection',
    desc: 'Respond to officer queries with vault documents and schedule physical site inspections online.',
    visual: 'query',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    title: 'Government Portal',
    desc: 'Unified officer workspace for reviewing, querying, inspecting, and deciding applications.',
    visual: 'government',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    title: 'Analytics & SLA Alerts',
    desc: 'Operational intelligence tracking processing times, pending renewals, and status distributions.',
    visual: 'analytics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

function RoadmapVisual() {
  const completed = roadmapItems.filter((item) => item.status === 'done').length;
  const inProgress = roadmapItems.filter((item) => item.status === 'active').length;

  return (
    <div>
      <div className="fp-summary-grid">
        <div><strong>{roadmapItems.length}</strong><span>Configured pathways</span></div>
        <div><strong>{completed}</strong><span>Completed</span></div>
        <div><strong>{inProgress}</strong><span>Currently in progress</span></div>
      </div>
      <div className="fp-section-label">Approval sequence</div>
      <div className="fp-table fp-roadmap-table">
        <div className="fp-table-head"><span>Requirement</span><span>Authority</span><span>Status</span></div>
        {roadmapItems.map((item, index) => (
          <div className="fp-table-row" key={item.name}>
            <div className="fp-requirement-name">
              <span className="fp-index">{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.name}</strong>
            </div>
            <span>{item.authority}</span>
            <span className={`fp-status-text ${item.status}`}>{item.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationVisual() {
  const passedChecks = validationRows.filter((row) => row.pass).length;
  const issueCount = validationRows.length - passedChecks;

  return (
    <div>
      <div className="fp-summary-grid">
        <div><strong>{validationRows.length}</strong><span>Checks completed</span></div>
        <div><strong>{passedChecks}</strong><span>Checks passed</span></div>
        <div><strong>{issueCount}</strong><span>Blocking issue</span></div>
      </div>
      <div className="fp-section-label">Submission readiness</div>
      <div className="fp-record-list">
        {validationRows.map((row) => (
          <div key={row.label} className="fp-record">
            <span className={`fp-check-box ${row.pass ? 'pass' : 'fail'}`}>
              {row.pass ? <CheckIcon /> : <XIcon />}
            </span>
            <div>
              <strong>{row.label}</strong>
              <span>{row.pass ? 'Configured check completed' : 'Required before submission'}</span>
            </div>
            <span className={`fp-status-text ${row.pass ? 'done' : 'blocked'}`}>
              {row.pass ? 'Passed' : 'Action required'}
            </span>
          </div>
        ))}
      </div>
      <button className="fp-submit-btn" disabled>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        </svg>
        Upload Process Flow to Enable Submit
      </button>
    </div>
  );
}

function DashboardVisual() {
  return (
    <div className="fp-dashboard">
      <div className="fp-summary-grid">
        <div><strong>9</strong><span>Approvals identified</span></div>
        <div><strong>1</strong><span>Action required</span></div>
        <div><strong>1</strong><span>Application in progress</span></div>
      </div>
      <div className="fp-section-label">Current priorities</div>
      <div className="fp-record-list">
        {dashboardActions.map((item) => (
          <div className="fp-record" key={item.label}>
            <span className={`fp-record-marker ${item.tone}`} />
            <div><strong>{item.label}</strong><span>{item.meta}</span></div>
            <span className="fp-record-action">View</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueryVisual() {
  return (
    <div>
      <div className="fp-context-strip">
        <div><span>Application</span><strong>APP-MH-2026-00124</strong></div>
        <div><span>Business</span><strong>FreshChain Cold Logistics</strong></div>
      </div>
      <div className="fp-record-list">
        {queryItems.map((item, index) => (
          <div className="fp-record" key={item.label}>
            <span className="fp-index">{String(index + 1).padStart(2, '0')}</span>
            <div><strong>{item.label}</strong><span>{item.meta}</span></div>
            <span className="fp-state">{item.state}</span>
          </div>
        ))}
      </div>
      <button className="fp-primary-action">Open query response</button>
    </div>
  );
}

function GovernmentVisual() {
  return (
    <div>
      <div className="fp-summary-grid fp-summary-grid-four">
        <div><strong>3</strong><span>New</span></div>
        <div><strong>5</strong><span>Under review</span></div>
        <div><strong>2</strong><span>Queries</span></div>
        <div><strong>1</strong><span>Inspection</span></div>
      </div>
      <div className="fp-section-label">Assigned application queue</div>
      <div className="fp-table">
        <div className="fp-table-head"><span>Application</span><span>Business</span><span>Status</span></div>
        {governmentQueue.map((item) => (
          <div className="fp-table-row" key={item.id}>
            <span>{item.id}</span><strong>{item.business}</strong><span>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [42, 68, 55, 82, 73, 91];
  return (
    <div className="fp-analytics">
      <div className="fp-summary-grid fp-summary-grid-four">
        <div><strong>124</strong><span>Applications</span></div>
        <div><strong>67</strong><span>Approved</span></div>
        <div><strong>38</strong><span>Under review</span></div>
        <div><strong>8</strong><span>Target overdue</span></div>
      </div>
      <div className="fp-chart-card">
        <div className="fp-chart-heading"><strong>Application volume</strong><span>Configured demo dataset · 30 days</span></div>
        <div className="fp-bars" aria-label="Application volume bar chart">
          {bars.map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
        </div>
        <div className="fp-chart-axis"><span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span></div>
      </div>
    </div>
  );
}

function FeaturePreview({ visual }) {
  if (visual === 'dashboard') return <DashboardVisual />;
  if (visual === 'roadmap') return <RoadmapVisual />;
  if (visual === 'validation') return <ValidationVisual />;
  if (visual === 'query') return <QueryVisual />;
  if (visual === 'government') return <GovernmentVisual />;
  return <AnalyticsVisual />;
}

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);
  const active = features[activeFeature];

  return (
    <section className="features" id="features">
      <div className="container">
        {/* Header */}
        <div className="features-header">
          <div className="eyebrow">Platform Features</div>
          <h2 className="h2">Everything you need,<br />in one connected system</h2>
          <p className="lead" style={{ marginTop: 14 }}>
            From intelligence to approval — BuildX connects every step for
            entrepreneurs and government officers alike.
          </p>
        </div>

        <div className="features-layout">
          {/* Feature list */}
          <div className="feature-list">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`feat-item ${activeFeature === i ? 'active' : ''}`}
                onClick={() => setActiveFeature(i)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActiveFeature(i)}
                id={`feature-tab-${i}`}
                aria-pressed={activeFeature === i}
              >
                <div className="feat-item-icon">{f.icon}</div>
                <div className="feat-item-body">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
                <div className="feat-item-chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Right panel */}
          <div className="feat-panel" key={activeFeature}>
            <div className="feat-panel-card">
              <div className="feat-panel-header">
                <div className="feat-panel-title">
                  <div className="feat-panel-icon">{active.icon}</div>
                  <span className="feat-panel-name">{active.title}</span>
                </div>
              </div>
              <div className="feat-panel-body">
                <FeaturePreview visual={active.visual} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
