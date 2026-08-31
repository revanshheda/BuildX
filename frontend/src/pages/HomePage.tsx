// Adapted from src/app/page.tsx
// 'use client' removed, next/link → react-router-dom Link (href → to)

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { Building2, ShieldCheck, ArrowRight, CheckCircle2, MapPin } from 'lucide-react';

export default function HomePage() {
  const { setPersona } = useAppStore();

  return (
    <div className="page-body">
      {/* Hero Welcome Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="badge badge-blue">SIH 26130 PROTOTYPE • MAHARASHTRA SCOPE</span>
          <span className="badge badge-green">LOCKED HERO WORKFLOW READY</span>
        </div>
        
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>
          Intelligent Single-Window Approval &amp; Compliance Platform
        </h1>
        
        <p style={{ color: '#475569', fontSize: '14px', maxWidth: '780px', marginTop: '8px', lineHeight: '1.6' }}>
          Enter your business details once. BuildX analyzes sector requirements, generates an explainable regulatory roadmap, pre-validates documents, and synchronizes seamless round-trip officer scrutiny across Maharashtra single-window workflows.
        </p>

        {/* Hero Business Spotlight */}
        <div
          style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                background: '#eff6ff',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                Hero Record: FreshChain Cold Logistics Pvt. Ltd.
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span><MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Pune (MIDC Chakan)</span>
                <span>•</span>
                <span>Cold Storage (5,000 MT)</span>
                <span>•</span>
                <span>FSSAI APP-MH-2026-00124</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/business-profile"
              onClick={() => setPersona('persona_entrepreneur')}
              className="btn btn-primary"
            >
              Start Hero Journey <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Entry Persona Cards */}
      <div className="grid-2">
        {/* Entrepreneur Entry Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building2 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Entrepreneur Portal</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Applicant: Vikram Malhotra (FreshChain)</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', margin: '16px 0' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Structured 20-Field Business Profile
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Explainable Approval Intelligence &amp; Roadmap
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Document Vault &amp; Instant Pre-validation Blocker
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Live Query Response &amp; Status Synchronization
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
            <Link
              to="/business-profile"
              onClick={() => setPersona('persona_entrepreneur')}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Enter as Entrepreneur
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setPersona('persona_entrepreneur')}
              className="btn btn-secondary"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Government Officer Entry Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '6px',
                  background: '#f0fdf4',
                  color: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Government Scrutiny Portal</h2>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Officer: Rajesh Kumar (FSSAI / MIDC Unit)</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#475569', margin: '16px 0' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Unified Application Queue &amp; Dossier Review
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Official Query Mechanism (&quot;Revised Process Flow&quot;)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Site Inspection Scheduling &amp; Checklist Outcome
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} color="#15803d" /> Final Approval Decision &amp; Audit Trail Generation
              </li>
            </ul>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
            <Link
              to="/government/dashboard"
              onClick={() => setPersona('persona_officer')}
              className="btn btn-secondary"
              style={{ flex: 1, borderColor: '#15803d', color: '#15803d' }}
            >
              Enter Government Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
