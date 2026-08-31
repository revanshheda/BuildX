

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Building2,
  FileCheck2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Gift,
  Award,
} from 'lucide-react';

export default function EntrepreneurDashboardPage() {
  const { business, application, queries, events, inspection } = useAppStore();

  const openQueries = queries.filter((q) => q.status === 'OPEN');
  const isApproved = application.status === 'APPROVED';
  const hasActiveQuery = openQueries.length > 0 && !isApproved;

  return (
    <div className="page-body">
      {/* Header Banner with Business Context */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-blue">MAHARASHTRA SINGLE WINDOW</span>
            <span className="badge badge-green">PROFILE VERIFIED (92%)</span>
            {isApproved && <span className="badge badge-green">CLEARANCE ACTIVE</span>}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px' }}>
            {business.name}
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span>
              <MapPin size={13} style={{ display: 'inline', verticalAlign: '-2px' }} /> {business.plotNumber},{' '}
              {business.industrialArea}, {business.district}, {business.state} ({business.locationType})
            </span>
            <span>•</span>
            <span>{business.sector} &gt; {business.subSector}</span>
            <span>•</span>
            <span>Capacity: {business.storageCapacityMt?.toLocaleString()} MT</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/business-profile" className="btn btn-secondary">
            <Building2 size={14} /> Business Profile
          </Link>
          <Link to="/roadmap" className="btn btn-primary">
            Regulatory Roadmap <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 1. HERO CLEARANCE & ACTION REQUIRED BANNER */}
      {isApproved ? (
        <div
          style={{
            marginBottom: '24px',
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #86efac',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                background: '#15803d',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(21, 128, 61, 0.2)',
              }}
            >
              <Award size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#14532d' }}>
                  FSSAI Central Licence Clearance Approved
                </span>
                <span className="badge badge-green" style={{ fontSize: '11px' }}>
                  APR-MH-2026-00124
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#166534', marginTop: '3px', lineHeight: '1.4' }}>
                Statutory food storage clearance granted for 5,000 MT facility at MIDC Chakan Phase II. Official reference:{' '}
                <strong>{application.decisionReason || 'APR-MH-2026-00124'}</strong>.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={`/application/${application.id}`} className="btn btn-primary btn-sm">
              <ShieldCheck size={14} /> View Approved Dossier & Certificate
            </Link>
          </div>
        </div>
      ) : hasActiveQuery ? (
        <div
          style={{
            marginBottom: '24px',
            padding: '18px 20px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#92400e' }}>
                ACTION REQUIRED: Department Clarification Requested
              </div>
              <div style={{ fontSize: '13px', color: '#b45309', marginTop: '2px' }}>
                {openQueries[0]?.title || 'Officer requested updated documentation on active application.'}
              </div>
            </div>
          </div>

          <Link to={`/query/${openQueries[0]?.id || 'latest'}`} className="btn btn-primary btn-sm">
            Respond to Query <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px 20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                YOU&apos;RE ALL CAUGHT UP
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                No pending actions required. All submitted applications are progressing through the single-window workflow.
              </div>
            </div>
          </div>
          <Link to="/roadmap" className="btn btn-secondary btn-sm">
            View Roadmap Status
          </Link>
        </div>
      )}

      {/* 2. TOP KPI CARDS */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <KpiCard
          label="Total Pathways"
          value="9"
          subtext="Statutory rules evaluated"
          badgeText="Verified"
          badgeType="blue"
          icon={<FileCheck2 size={18} />}
        />
        <KpiCard
          label="Action Required"
          value={hasActiveQuery ? '1' : '0'}
          subtext={hasActiveQuery ? 'Query requiring response' : 'No blocking actions'}
          badgeText={hasActiveQuery ? 'Attention' : 'All Clear'}
          badgeType={hasActiveQuery ? 'amber' : 'green'}
          icon={<AlertCircle size={18} />}
        />
        <KpiCard
          label="Approved Clearances"
          value={isApproved ? '1' : '0'}
          subtext={isApproved ? 'FSSAI Central Licence (Active)' : 'In Scrutiny / Review'}
          badgeText={isApproved ? 'APPROVED' : application.status}
          badgeType={isApproved ? 'green' : 'blue'}
          icon={<ShieldCheck size={18} />}
        />
        <KpiCard
          label="Potential Incentives"
          value="4"
          subtext="Matching Maharashtra policy"
          badgeText="Discoverable"
          badgeType="blue"
          icon={<Gift size={18} />}
        />
      </div>

      {/* 3. MAIN WORKSPACE GRID: Clearance Details + Roadmap */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Active Application Dossier Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Primary Regulatory Application</div>
              <div className="card-subtitle">{application.approvalName}</div>
            </div>
            <StatusBadge status={application.status} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Application ID:</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{application.appNumber}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Department:</span>
              <span style={{ fontWeight: '500', color: '#334155' }}>{application.department}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Authority:</span>
              <span style={{ fontWeight: '500', color: '#334155' }}>{application.authorityName}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>SLA Target Timeline:</span>
              <span style={{ fontWeight: '600', color: '#15803d' }}>30 Days (Cleared within SLA)</span>
            </div>

            {isApproved && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Clearance Reference:</span>
                <span style={{ fontWeight: '700', color: '#15803d' }}>
                  {application.decisionReason || 'APR-MH-2026-00124'}
                </span>
              </div>
            )}

            {inspection && (
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '12px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>Site Verification Outcome:</span>
                  <span className={`badge ${inspection.outcome === 'SATISFACTORY' ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                    {inspection.outcome}
                  </span>
                </div>
                <div style={{ color: '#475569' }}>
                  Conducted by {inspection.officerName} at {inspection.location} on {inspection.scheduledDate}.
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Stage 1 Clearances: 100% Completed</span>
            <Link to={`/application/${application.id}`} className="btn btn-outline-primary btn-sm">
              Open Application Dossier <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Roadmap Progress Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Personalized Approval Roadmap</div>
              <div className="card-subtitle">Cold Storage (5,000 MT) • 9 Configured Clearances</div>
            </div>
            <Link to="/roadmap" className="btn btn-secondary btn-sm">
              View All 9
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            {/* 1. MIDC Planning */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={16} color="#15803d" />
                <span style={{ fontWeight: '600', color: '#14532d' }}>1. MIDC Building Plan Sanction</span>
              </div>
              <span className="badge badge-green" style={{ fontSize: '10px' }}>PRE-REQUISITE</span>
            </div>

            {/* 2. FSSAI */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: isApproved ? '#f0fdf4' : '#eff6ff', borderRadius: '6px', border: isApproved ? '1px solid #bbf7d0' : '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isApproved ? <CheckCircle2 size={16} color="#15803d" /> : <Clock size={16} color="#1d4ed8" />}
                <span style={{ fontWeight: '600', color: isApproved ? '#14532d' : '#1d4ed8' }}>
                  2. FSSAI Central Licence ({isApproved ? 'Approved' : 'In Review'})
                </span>
              </div>
              <StatusBadge status={application.status} />
            </div>

            {/* 3. MPCB */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #94a3b8', display: 'inline-block' }} />
                <span style={{ color: '#475569' }}>3. MPCB Consent to Establish (Orange)</span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>NEXT UP</span>
            </div>

            {/* 4. MSEDCL Power */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #94a3b8', display: 'inline-block' }} />
                <span style={{ color: '#475569' }}>4. MSEDCL Industrial HT Power (750 kW)</span>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: '10px' }}>STAGE 2</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>2 of 9 Regulatory Milestones Cleared</span>
            <Link to="/roadmap" className="btn btn-primary btn-sm">
              Explore Full Pathway <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. COMPLIANCE, RENEWAL & INCENTIVES ROW */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Compliance & Renewal Obligations Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Compliance & Renewal Tracking</div>
              <div className="card-subtitle">Active statutory obligations & periodic filings</div>
            </div>
            <span className="badge badge-green">COMPLIANT</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>FSSAI Central Licence Validity</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Reference: APR-MH-2026-00124 • 1-Year Initial Term
                  </div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '10px' }}>ACTIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#475569' }}>
                <span>Valid Until: <strong>31 Aug 2027</strong></span>
                <span>•</span>
                <span>Renewal Window: <strong>60 Days Prior</strong></span>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>Annual Food Safety Return (Form D-1)</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Mandatory annual submission of food storage throughput
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>SCHEDULED</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#475569' }}>
                <span>Filing Deadline: <strong>31 May 2027</strong></span>
                <span>•</span>
                <span>Status: <strong>Not Due Yet</strong></span>
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>Refrigeration Safety & Calibration Audit</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Ammonia sensor calibration & cold chain temperature logs
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>SEMI-ANNUAL</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#475569' }}>
                <span>Audit Target: <strong>28 Feb 2027</strong></span>
                <span>•</span>
                <span>Status: <strong>Pre-Commissioning</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Incentives Preview Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Government Incentives & Subsidies</div>
              <div className="card-subtitle">Potentially relevant schemes matching your profile</div>
            </div>
            <Link to="/incentives" className="btn btn-secondary btn-sm">
              View All 4
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ padding: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: '600', color: '#1e3a8a' }}>
                  Maharashtra Package Scheme of Incentives (PSI) 2019
                </div>
                <span className="badge badge-blue" style={{ fontSize: '10px' }}>CAPITAL SUBSIDY</span>
              </div>
              <div style={{ fontSize: '12px', color: '#1d4ed8', marginTop: '3px' }}>
                Industrial Promotion Subsidy (IPS) for Cold Logistics in Pune industrial zone.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>
                  PMKSY — Integrated Cold Chain Infrastructure Support
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>CENTRAL SCHEME</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                Ministry of Food Processing grant-in-aid for modern cold chain facilities.
              </div>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: '600', color: '#0f172a' }}>
                  MSEDCL Industrial Electricity Duty Exemption
                </div>
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>TARIFF SUPPORT</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                100% Electricity Duty exemption on HT industrial power for 7 years.
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>4 schemes matching ₹15 Cr / MIDC Chakan</span>
            <Link to="/incentives" className="btn btn-primary btn-sm">
              Explore Scheme Details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. AUDIT TRAIL & NOTIFICATIONS PREVIEW */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Lifecycle Activity & Notifications</div>
            <div className="card-subtitle">Complete chronological record of statutory submissions and decisions</div>
          </div>
          <span className="badge badge-neutral">{events.length} EVENTS RECORDED</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #f1f5f9',
                fontSize: '13px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: evt.actorRole === 'ENTREPRENEUR' ? '#eff6ff' : '#f0fdf4',
                  color: evt.actorRole === 'ENTREPRENEUR' ? '#1d4ed8' : '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {evt.actorRole === 'ENTREPRENEUR' ? 'EM' : 'IO'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>{evt.title}</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {evt.createdAt ? evt.createdAt.slice(0, 10) : ''}
                  </span>
                </div>
                {evt.description && (
                  <p style={{ color: '#475569', fontSize: '12px', marginTop: '2px', lineHeight: '1.4' }}>
                    {evt.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
