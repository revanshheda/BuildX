import React from 'react';
import './HowItWorks.css';

const entSteps = [
  {
    num: '1',
    title: 'Build Your Profile',
    desc: 'Provide your business, project, activity and Maharashtra location details.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    num: '2',
    title: 'Review Approval Requirements',
    desc: 'Configured rules identify relevant, conditional and stage-based requirements.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    num: '3',
    title: 'Follow Your Roadmap',
    desc: 'See the responsible authority, required documents, sequence and next action.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    num: '4',
    title: 'Pre-validate & Submit',
    desc: 'Check required fields, documents and declarations before sending the application.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
  },
  {
    num: '5',
    title: 'Track and Respond',
    desc: 'View workflow updates, answer queries, prepare for inspections and see the decision.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
];

const govSteps = [
  {
    num: 'STEP A',
    title: 'Review Application',
    desc: 'Officer receives and reviews documents, business info, and pre-validation results in a unified dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    num: 'STEP B',
    title: 'Query & Inspect',
    desc: 'Raise queries, review entrepreneur responses, schedule and complete physical site inspections',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    num: 'STEP C',
    title: 'Decide & Notify',
    desc: 'Approve or reject. Entrepreneur is notified instantly. Roadmap and compliance status auto-updates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="hiw" id="how-it-works">
      <div className="container">
        <div className="hiw-header">
          <div className="eyebrow">How It Works</div>
          <h2 className="h2">From Profile to Approval in 5 Steps</h2>
          <p className="lead" style={{ maxWidth: 520, margin: '14px auto 0' }}>
            A clear, connected process for preparing an application and following it
            through departmental review.
          </p>
        </div>

        {/* Entrepreneur Steps */}
        <div className="hiw-steps-wrapper">
          <div className="hiw-process-heading">
            <div>
              <span className="hiw-process-kicker">ENTREPRENEUR PROCESS</span>
              <h3>One application journey, from preparation to decision</h3>
            </div>
            <span className="hiw-process-note">Maharashtra prototype workflow</span>
          </div>
          <div className="hiw-steps">
            {entSteps.map((step) => (
              <article key={step.num} className="hiw-step">
                <div className="hiw-step-topline">
                  <span className="hiw-step-num">{step.num.padStart(2, '0')}</span>
                  <span className="hiw-step-icon-wrap">{step.icon}</span>
                </div>
                <div className="hiw-step-body">
                  <h4 className="hiw-step-title">{step.title}</h4>
                  <p className="hiw-step-desc">{step.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Section divider */}
        <div className="hiw-divider">
          <div className="hiw-divider-line" />
          <div className="hiw-divider-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            DEPARTMENT PROCESSING
          </div>
          <div className="hiw-divider-line" />
        </div>

        {/* Gov Steps */}
        <div className="hiw-gov-steps">
          {govSteps.map((step) => (
            <article key={step.title} className="hiw-gov-card">
              <div className="hiw-gov-icon">{step.icon}</div>
              <div className="hiw-gov-step-num">{step.num}</div>
              <div className="hiw-gov-title">{step.title}</div>
              <div className="hiw-gov-desc">{step.desc}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
