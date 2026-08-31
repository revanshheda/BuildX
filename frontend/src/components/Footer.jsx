import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import './CTASection.css';

export default function Footer({ onOpenAuth }) {
  const navigate = useNavigate();
  const { setPersona } = useAppStore();

  const handleOfficerLogin = (e) => {
    e.preventDefault();
    if (onOpenAuth) {
      onOpenAuth('OFFICER');
    } else {
      setPersona('persona_officer');
      navigate('/government/dashboard');
    }
  };

  const handleEntrepreneurAction = (path, e) => {
    e.preventDefault();
    setPersona('persona_entrepreneur');
    navigate(path);
  };

  const handleGovAction = (path, e) => {
    e.preventDefault();
    setPersona('persona_officer');
    navigate(path);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand-logo">
              <div className="footer-brand-mark">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div className="footer-brand-text">
                <div className="footer-brand-name">Build<span className="footer-brand-name-x">X</span></div>
                <div className="footer-brand-tagline">Maharashtra · SIH 2026</div>
              </div>
            </div>

            <p className="footer-brand-desc">
              Intelligent Approval &amp; Compliance Management Platform for Maharashtra businesses.
              One profile. Every approval. No more fragmented visits.
            </p>

            <div className="footer-pills">
              <span className="footer-pill">SIH 2026</span>
              <span className="footer-pill">Problem #26130</span>
              <span className="footer-pill">Maharashtra Gov</span>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="footer-col-title">Platform</div>
            <div className="footer-links">
              <a href="#how-it-works">How It Works</a>
              <a href="#features">Features</a>
              <a href="#sectors">Sectors Covered</a>
              <a href="#about">About Prototype</a>
            </div>
          </div>

          {/* Entrepreneurs */}
          <div>
            <div className="footer-col-title">Entrepreneurs</div>
            <div className="footer-links">
              <span onClick={(e) => handleEntrepreneurAction('/business-profile', e)} style={{ cursor: 'pointer' }}>Create Account / Profile</span>
              <span onClick={(e) => handleEntrepreneurAction('/dashboard', e)} style={{ cursor: 'pointer' }}>Entrepreneur Dashboard</span>
              <span onClick={(e) => handleEntrepreneurAction('/roadmap', e)} style={{ cursor: 'pointer' }}>My Roadmap</span>
              <span onClick={(e) => handleEntrepreneurAction('/vault', e)} style={{ cursor: 'pointer' }}>Document Vault</span>
            </div>
          </div>

          {/* Government */}
          <div>
            <div className="footer-col-title">Government</div>
            <div className="footer-links">
              <span onClick={handleOfficerLogin} style={{ cursor: 'pointer' }}>Officer Login</span>
              <span onClick={(e) => handleGovAction('/government/applications', e)} style={{ cursor: 'pointer' }}>Application Scrutiny</span>
              <span onClick={(e) => handleGovAction('/government/analytics', e)} style={{ cursor: 'pointer' }}>Analytics Dashboard</span>
              <span onClick={(e) => handleGovAction('/government/dashboard', e)} style={{ cursor: 'pointer' }}>Single Window Portal</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span className="footer-copy">
              © 2026 BuildX · Smart India Hackathon Prototype
            </span>
            <span className="footer-disclaimer">
              Not an official government portal. Built for SIH 2026 demonstration purposes.
            </span>
          </div>
          <div className="footer-live">
            <span className="footer-live-dot" />
            Maharashtra Prototype · Live
          </div>
        </div>
      </div>
    </footer>
  );
}
