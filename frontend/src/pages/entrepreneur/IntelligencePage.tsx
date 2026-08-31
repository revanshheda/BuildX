

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { evaluateApprovalRules } from '@/lib/rule-engine';
import {
  SlidersHorizontal,
  ArrowRight,
  Building2,
  Scale,
  FolderOpen,
} from 'lucide-react';

export default function ApprovalIntelligencePage() {
  const { business, application } = useAppStore();
  const [filterStage, setFilterStage] = useState<string>('ALL');

  const evaluation = evaluateApprovalRules(business);

  const filteredRules =
    filterStage === 'ALL'
      ? evaluation.results
      : evaluation.results.filter((r) => r.stage === filterStage);

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">RULE ENGINE EVALUATION</span>
            <span className="badge badge-green">9 RULES EVALUATED • EXPLAINABLE</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            Approval Intelligence Analysis
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Automated rule matrix evaluation for <strong>{business.name}</strong> based on Maharashtra industrial regulatory framework.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/business-profile" className="btn btn-secondary">
            <SlidersHorizontal size={14} /> Adjust Parameters
          </Link>
          <Link to="/roadmap" className="btn btn-primary">
            View Personalized Roadmap <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Input Parameters Matrix Summary Card */}
      <div className="card" style={{ marginBottom: '20px', background: '#ffffff', borderLeft: '4px solid #1d4ed8' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={18} color="#1d4ed8" />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
              Evaluated Business Profile Parameters
            </span>
          </div>
          <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
            Source: Business Profile (20 Core Fields)
          </span>
        </div>

        <div className="grid-4" style={{ fontSize: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div>
            <span style={{ color: '#64748b' }}>Industry Sector:</span>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.sector}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Sub-Sector:</span>
            <div style={{ fontWeight: '600', color: '#1d4ed8' }}>{business.subSector}</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Location & Jurisdiction:</span>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.district}, MH ({business.locationType} - {business.industrialArea})</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Storage Scale / Capacity:</span>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.storageCapacityMt.toLocaleString()} MT ({business.storageType})</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Food Products Stored:</span>
            <div style={{ fontWeight: '600', color: business.isFoodStorage ? '#15803d' : '#b45309' }}>
              {business.isFoodStorage ? '✓ Yes (FSSAI Triggered)' : '✗ No (Non-food only)'}
            </div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Connected Power Demand:</span>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.powerRequirementKw} kW (HT Sanction Triggered)</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Total Capital Investment:</span>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>₹{(business.totalInvestmentInr / 10000000).toFixed(2)} Crores</div>
          </div>
          <div>
            <span style={{ color: '#64748b' }}>Project Stage:</span>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.projectStage}</div>
          </div>
        </div>
      </div>

      {/* Intelligence Summary KPIs */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <div className="card" style={{ borderTop: '3px solid #1d4ed8' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Applicable Clearances
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8', marginTop: '4px' }}>
            {evaluation.applicableCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Pre-construction & utility sanctions
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid #b45309' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Stage-Dependent
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#b45309', marginTop: '4px' }}>
            {evaluation.stageDependentCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Pre-commissioning / Final OC
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid #15803d' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Hero Focus Application
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d', marginTop: '4px' }}>
            FSSAI
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            APP-MH-2026-00124
          </div>
        </div>

        <div className="card" style={{ borderTop: '3px solid #475569' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
            Unconfigured Sub-sectors
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#475569', marginTop: '4px' }}>
            {evaluation.notConfiguredCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Marked NEEDS_REVIEW (No false negatives)
          </div>
        </div>
      </div>

      {/* Stage Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setFilterStage('ALL')}
          className={`btn btn-sm ${filterStage === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Requirements ({evaluation.results.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStage('PLANNING')}
          className={`btn btn-sm ${filterStage === 'PLANNING' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Stage 1: Pre-Construction & Planning
        </button>
        <button
          type="button"
          onClick={() => setFilterStage('UTILITIES')}
          className={`btn btn-sm ${filterStage === 'UTILITIES' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Stage 2: Utilities & Infrastructure
        </button>
        <button
          type="button"
          onClick={() => setFilterStage('PRE_COMMISSIONING')}
          className={`btn btn-sm ${filterStage === 'PRE_COMMISSIONING' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Stage 3: Pre-Commissioning & Occupancy
        </button>
      </div>

      {/* Evaluation Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredRules.map((rule) => {
          const isHero = rule.isHeroFocus;

          return (
            <div
              key={rule.id}
              className="card"
              style={{
                borderLeft: isHero ? '4px solid #15803d' : '1px solid #e2e8f0',
                background: isHero ? '#fcfdfd' : '#ffffff',
              }}
            >
              <div className="card-header" style={{ marginBottom: '10px', paddingBottom: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                      }}
                    >
                      {rule.sequenceOrder}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      {rule.name}
                    </span>
                    {isHero && (
                      <span className="badge badge-green" style={{ fontSize: '10px' }}>
                        HERO PROTOTYPE APPLICATION
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginLeft: '32px', marginTop: '2px' }}>
                    Authority: <strong>{rule.authorityName}</strong> • {rule.department}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    className={`badge ${
                      rule.status === 'APPLICABLE'
                        ? 'badge-blue'
                        : rule.status === 'STAGE_DEPENDENT'
                        ? 'badge-amber'
                        : rule.status === 'NOT_CONFIGURED'
                        ? 'badge-neutral'
                        : 'badge-neutral'
                    }`}
                  >
                    {rule.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Explainability Section */}
              <div style={{ marginLeft: '32px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '3px' }}>
                    Why This Applies (Profile Rationale):
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                    {rule.reason}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                    <Scale size={14} color="#64748b" />
                    <span>Legal Basis: <em>{rule.legalBasis}</em></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                    <FolderOpen size={14} color="#64748b" />
                    <span>Required Documents: <strong>{rule.mandatoryDocuments.join(', ')}</strong></span>
                  </div>
                </div>

                {isHero && (
                  <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
                      Ready to prepare application: APP-MH-2026-00124 (Status: {application.status})
                    </div>
                    <Link to={`/application/${application.id}`} className="btn btn-primary btn-sm">
                      Open Application Builder <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
        <Link to="/business-profile" className="btn btn-secondary">
          ← Back to Business Profile
        </Link>
        <Link to="/roadmap" className="btn btn-primary" style={{ padding: '10px 24px' }}>
          Proceed to Personalized Roadmap <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
