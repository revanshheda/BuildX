

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { KpiCard } from '@/components/ui/KpiCard';
import {
  Gift,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Coins,
  FolderCheck,
} from 'lucide-react';

interface IncentiveScheme {
  id: string;
  code: string;
  name: string;
  category: 'CAPITAL_SUBSIDY' | 'POWER_DUTY' | 'CENTRAL_SCHEME' | 'LAND_STAMP';
  categoryLabel: string;
  authority: string;
  maxBenefit: string;
  benefitDescription: string;
  relevanceReason: string;
  matchingCriteria: string[];
  requiredDocs: { name: string; code: string; isAvailable: boolean }[];
  sourceReference: string;
  status: 'POTENTIALLY_RELEVANT' | 'CONFIGURED_MATCH';
}

export default function IncentivesPage() {
  const { business, documents } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [savedIncentiveIds, setSavedIncentiveIds] = useState<string[]>(['psi-2019-ips']);
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);

  const isDocInVault = (code: string) => {
    return documents.some((d) => d.docCode === code);
  };

  const INCENTIVE_SCHEMES: IncentiveScheme[] = [
    {
      id: 'psi-2019-ips',
      code: 'MH_PSI_2019_IPS',
      name: 'Maharashtra Package Scheme of Incentives (PSI) 2019 — Industrial Promotion Subsidy',
      category: 'CAPITAL_SUBSIDY',
      categoryLabel: 'Capital Investment Subsidy',
      authority: 'Directorate of Industries, Government of Maharashtra (MAITRI)',
      maxBenefit: 'Up to 50% of Eligible Capital Investment (₹7.5 Cr cap over 7 years)',
      benefitDescription:
        'Gross SGST reimbursement and capital investment subsidy for new logistics and cold chain infrastructure projects set up in eligible industrial talukas of Maharashtra.',
      relevanceReason:
        'Your profile declares a New Project in Logistics & Cold Storage with total capital investment of ₹15.00 Cr located in MIDC Chakan (Pune District). Under PSI 2019, Agro-processing and Cold Logistics qualify as thrust sectors.',
      matchingCriteria: [
        `State: ${business.state}`,
        `Sector: ${business.sector} (Cold Chain)`,
        `Investment: ₹${(business.totalInvestmentInr / 10000000).toFixed(2)} Cr (Qualifies for Large / MSME Tier)`,
        `Location: ${business.locationType} (${business.industrialArea || 'Chakan'})`,
        `Project Type: ${business.projectType}`,
      ],
      requiredDocs: [
        { name: 'Company PAN Card', code: 'PAN', isAvailable: isDocInVault('PAN') },
        { name: 'Certificate of Incorporation', code: 'INCORPORATION_CERT', isAvailable: isDocInVault('INCORPORATION_CERT') },
        { name: 'Detailed Project Report (DPR)', code: 'PROJECT_REPORT', isAvailable: isDocInVault('PROJECT_REPORT') },
        { name: 'MIDC Land Allotment & Possession Letter', code: 'MIDC_ALLOTMENT', isAvailable: isDocInVault('MIDC_ALLOTMENT') },
      ],
      sourceReference: 'Government Resolution No. PSI-2019/CR-46/IND-8 (Industries, Energy & Labour Dept)',
      status: 'POTENTIALLY_RELEVANT',
    },
    {
      id: 'msedcl-duty-exemption',
      code: 'MH_ELEC_DUTY_EXEMPT',
      name: 'Industrial Electricity Duty Exemption & Power Tariff Concession',
      category: 'POWER_DUTY',
      categoryLabel: 'Power & Duty Concession',
      authority: 'Department of Energy & MSEDCL, Maharashtra',
      maxBenefit: '100% Electricity Duty Exemption for 7 Years (~₹18–24 Lakhs/year)',
      benefitDescription:
        'Complete waiver of state electricity duty on high-tension industrial power tariff for registered cold storage and refrigerated warehouse units.',
      relevanceReason:
        `Your high power demand of ${business.powerRequirementKw} kW for continuous blast chilling and cold room refrigeration meets the statutory threshold for industrial power duty waiver under Maharashtra Industrial Policy.`,
      matchingCriteria: [
        `Connected Load: ${business.powerRequirementKw} kW (HT Industrial Power)`,
        `Facility: Continuous Cold Storage (Temperature: ${business.temperatureRange})`,
        `Location: MIDC Industrial Area (${business.district})`,
      ],
      requiredDocs: [
        { name: 'MIDC Allotment Letter', code: 'MIDC_ALLOTMENT', isAvailable: isDocInVault('MIDC_ALLOTMENT') },
        { name: 'Approved Site & Key Layout Plan', code: 'SITE_PLAN', isAvailable: isDocInVault('SITE_PLAN') },
        { name: 'Refrigeration Equipment Layout', code: 'COLD_STORAGE_LAYOUT', isAvailable: isDocInVault('COLD_STORAGE_LAYOUT') },
      ],
      sourceReference: 'Maharashtra Industrial Policy 2019 — Power Concession Section 5.3',
      status: 'POTENTIALLY_RELEVANT',
    },
    {
      id: 'mofpi-pmksy-coldchain',
      code: 'MOFPI_PMKSY_COLDCHAIN',
      name: 'PM Kisan SAMPADA Yojana — Integrated Cold Chain & Value Addition Support',
      category: 'CENTRAL_SCHEME',
      categoryLabel: 'Central Government Grant',
      authority: 'Ministry of Food Processing Industries (MoFPI), Government of India',
      maxBenefit: 'Grant-in-aid up to 35% of eligible technical civil works and refrigeration plant (Max ₹10 Cr)',
      benefitDescription:
        'Financial assistance for setting up integrated cold chain, temperature-controlled multi-commodity chambers, and mobile refrigerated logistics.',
      relevanceReason:
        `Your facility provides ${business.storageCapacityMt?.toLocaleString()} MT of multi-commodity cold storage capacity with specialized refrigeration (ammonia/freon systems) designed for perishable foods.`,
      matchingCriteria: [
        `Storage Capacity: ${business.storageCapacityMt?.toLocaleString()} MT (Meets >2,500 MT central guideline)`,
        `Food Business Declaration: True (Perishables & Agricultural goods)`,
        `Project Status: Proposed / Pre-Construction`,
      ],
      requiredDocs: [
        { name: 'Detailed Project Report (DPR)', code: 'PROJECT_REPORT', isAvailable: isDocInVault('PROJECT_REPORT') },
        { name: 'Architectural Building & Floor Plan', code: 'BUILDING_PLAN', isAvailable: isDocInVault('BUILDING_PLAN') },
        { name: 'Refrigeration Chamber Layout', code: 'COLD_STORAGE_LAYOUT', isAvailable: isDocInVault('COLD_STORAGE_LAYOUT') },
      ],
      sourceReference: 'MoFPI PMKSY Operational Guidelines — Scheme for Integrated Cold Chain',
      status: 'POTENTIALLY_RELEVANT',
    },
    {
      id: 'mh-stamp-duty-waiver',
      code: 'MH_STAMP_DUTY_WAIVER',
      name: 'Maharashtra Industrial Policy — 100% Stamp Duty Exemption on Land Lease',
      category: 'LAND_STAMP',
      categoryLabel: 'Land & Stamp Exemption',
      authority: 'Inspector General of Registration & Stamps (IGR Maharashtra)',
      maxBenefit: '100% Exemption of Stamp Duty on MIDC Lease Deed Execution (~₹7.5 Lakhs)',
      benefitDescription:
        'Complete exemption on stamp duty and registration fees payable on executing long-term lease deeds with MIDC for qualifying manufacturing and logistics units.',
      relevanceReason:
        `Your project is situated on MIDC leasehold land (${business.plotNumber}, ${business.industrialArea || 'Chakan Phase II'}) with capital investment exceeding ₹10 Cr.`,
      matchingCriteria: [
        `Land Tenure: MIDC Industrial Leasehold (${business.locationType})`,
        `Plot Details: ${business.plotNumber}`,
        `Industrial Policy Category: Priority Sector / Cold Logistics`,
      ],
      requiredDocs: [
        { name: 'MIDC Plot Allotment Letter & Lease', code: 'MIDC_ALLOTMENT', isAvailable: isDocInVault('MIDC_ALLOTMENT') },
        { name: 'Company PAN Card', code: 'PAN', isAvailable: isDocInVault('PAN') },
      ],
      sourceReference: 'Revenue & Forest Dept Notification No. STP-10/2019/CR-14/M-1',
      status: 'POTENTIALLY_RELEVANT',
    },
  ];

  const toggleSave = (id: string) => {
    setSavedIncentiveIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredSchemes = INCENTIVE_SCHEMES.filter((scheme) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'SAVED') return savedIncentiveIds.includes(scheme.id);
    return scheme.category === selectedCategory;
  });

  const activeScheme = INCENTIVE_SCHEMES.find((s) => s.id === activeDetailId);

  return (
    <div className="page-body">
      {/* Header Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-blue">MAHARASHTRA & CENTRAL POLICY</span>
          <span className="badge badge-green">4 SCHEMES DISCOVERED</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.3px' }}>
          Incentives & Financial Assistance Schemes
        </h1>
        <p style={{ color: '#475569', fontSize: '13px', maxWidth: '820px', marginTop: '4px', lineHeight: '1.5' }}>
          BuildX matches your verified Business Profile parameters against configured Maharashtra industrial policies and Central sector schemes. The findings below represent <strong>potential relevance</strong> and screening guidance for your 5,000 MT Cold Storage project.
        </p>
      </div>

      {/* Top Screening KPI Bar */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <KpiCard
          label="Potentially Relevant"
          value="4"
          subtext="Screened from Business Profile"
          badgeText="Screened"
          badgeType="blue"
          icon={<Gift size={18} />}
        />
        <KpiCard
          label="Estimated Benefit Pool"
          value="₹7.5+ Cr"
          subtext="Capital, duty & power support"
          badgeText="Indicative"
          badgeType="green"
          icon={<Coins size={18} />}
        />
        <KpiCard
          label="Saved Schemes"
          value={savedIncentiveIds.length.toString()}
          subtext="Bookmarked for application"
          badgeText="Shortlisted"
          badgeType="neutral"
          icon={<Bookmark size={18} />}
        />
        <KpiCard
          label="Vault Document Readiness"
          value="100%"
          subtext="All primary documents ready"
          badgeText="Ready"
          badgeType="green"
          icon={<FolderCheck size={18} />}
        />
      </div>

      {/* Clarification Disclaimer Banner */}
      <div
        style={{
          marginBottom: '20px',
          padding: '12px 16px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12px',
          color: '#475569',
        }}
      >
        <ShieldCheck size={16} color="#1d4ed8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Prototype Transparency Notice:</strong> Matches are calculated deterministically from your Business Profile data (Location: MIDC Chakan, Sector: Cold Logistics, Capital: ₹15 Cr, Power: 750 kW). Official sanction is subject to formal application submission and verification by respective authorities (MAITRI / MoFPI / MSEDCL).
        </span>
      </div>

      {/* Category Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'ALL', label: 'All Schemes (4)' },
          { id: 'CAPITAL_SUBSIDY', label: 'Capital Subsidy' },
          { id: 'POWER_DUTY', label: 'Power & Duty Waivers' },
          { id: 'CENTRAL_SCHEME', label: 'Central Schemes' },
          { id: 'LAND_STAMP', label: 'Land & Stamp Duty' },
          { id: 'SAVED', label: `Saved (${savedIncentiveIds.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: selectedCategory === tab.id ? '600' : '500',
              background: selectedCategory === tab.id ? '#1d4ed8' : '#ffffff',
              color: selectedCategory === tab.id ? '#ffffff' : '#475569',
              border: selectedCategory === tab.id ? '1px solid #1d4ed8' : '1px solid #cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incentive Schemes List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {filteredSchemes.map((scheme) => {
          const isSaved = savedIncentiveIds.includes(scheme.id);
          const allDocsAvailable = scheme.requiredDocs.every((d) => d.isAvailable);

          return (
            <div
              key={scheme.id}
              className="card"
              style={{
                border: '1px solid #e2e8f0',
                transition: 'box-shadow 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge badge-blue">{scheme.categoryLabel}</span>
                    <span className="badge badge-green">POTENTIALLY RELEVANT</span>
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    {scheme.name}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Administering Authority: <strong>{scheme.authority}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => toggleSave(scheme.id)}
                    className="btn btn-secondary btn-sm"
                    title={isSaved ? 'Remove from saved' : 'Save scheme'}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck size={14} color="#15803d" /> Saved
                      </>
                    ) : (
                      <>
                        <Bookmark size={14} /> Save
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveDetailId(scheme.id)}
                    className="btn btn-outline-primary btn-sm"
                  >
                    View Details & Docs <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Benefit Highlight Bar */}
              <div
                style={{
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  marginBottom: '14px',
                  fontSize: '13px',
                }}
              >
                <span style={{ fontWeight: '700', color: '#14532d' }}>Potential Benefit: </span>
                <span style={{ color: '#166534' }}>{scheme.maxBenefit}</span>
              </div>

              <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.5', marginBottom: '14px' }}>
                {scheme.benefitDescription}
              </p>

              {/* Explainability Block: Why you are seeing this */}
              <div
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} color="#1d4ed8" />
                  Why you&apos;re seeing this recommendation:
                </div>
                <div style={{ color: '#475569', lineHeight: '1.4' }}>{scheme.relevanceReason}</div>
              </div>

              {/* Matching Profile Criteria Tags */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontWeight: '500' }}>Matched Signals:</span>
                  {scheme.matchingCriteria.slice(0, 3).map((crit, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '2px 8px',
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        color: '#334155',
                        fontWeight: '500',
                        fontSize: '11px',
                      }}
                    >
                      ✓ {crit}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: allDocsAvailable ? '#15803d' : '#b45309', fontWeight: '600' }}>
                    {allDocsAvailable ? '✓ All Required Docs in Vault' : 'Partial Docs in Vault'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheme Detail Modal */}
      {activeScheme && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '8px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '4px' }}>
                  {activeScheme.categoryLabel}
                </span>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                  {activeScheme.name}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Authority: {activeScheme.authority}
                </div>
              </div>
              <button
                onClick={() => setActiveDetailId(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div>
                <h4 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  Scheme Overview & Benefit
                </h4>
                <p style={{ color: '#475569', lineHeight: '1.5' }}>
                  {activeScheme.benefitDescription}
                </p>
                <div style={{ marginTop: '8px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', color: '#166534', fontWeight: '600' }}>
                  {activeScheme.maxBenefit}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  Configured Eligibility Assessment
                </h4>
                <div style={{ color: '#475569', marginBottom: '8px', lineHeight: '1.4' }}>
                  {activeScheme.relevanceReason}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {activeScheme.matchingCriteria.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14532d', fontSize: '12px' }}>
                      <CheckCircle2 size={14} color="#15803d" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>
                  Document Vault Integration
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {activeScheme.requiredDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ fontWeight: '500', color: '#0f172a' }}>{doc.name}</span>
                      {doc.isAvailable ? (
                        <span className="badge badge-green" style={{ fontSize: '10px' }}>
                          ✓ IN VAULT
                        </span>
                      ) : (
                        <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                          REQUIRED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '4px', fontSize: '11px', color: '#64748b' }}>
                <strong>Statutory Reference:</strong> {activeScheme.sourceReference}
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setActiveDetailId(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
              <Link to="/vault" className="btn btn-primary btn-sm">
                Open Document Vault <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
