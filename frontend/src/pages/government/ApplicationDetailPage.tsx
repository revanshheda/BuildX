

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { InspectionChecklistItem } from '@/lib/types';
import {
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Check,
  Inbox,
  Calendar,
  ClipboardCheck,
  XCircle,
  Award,
} from 'lucide-react';

export default function GovernmentApplicationReviewPage() {
  const {
    application,
    business,
    documents,
    updateDocumentStatus,
    queries,
    addQuery,
    resolveQuery,
    inspection,
    scheduleInspection,
    startInspection,
    completeInspection,
    approveApplication,
    rejectApplication,
    events,
    currentPersona,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FORM_DATA' | 'DOCUMENTS' | 'QUERIES' | 'INSPECTION' | 'DECISION' | 'TIMELINE'>('OVERVIEW');

  // Modals
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Query State
  const [queryTitle, setQueryTitle] = useState('Revised Process Flow Required');
  const [queryText, setQueryText] = useState('Please provide a revised Process Flow document for review.');
  const [relatedDoc, setRelatedDoc] = useState('Process Flow Diagram');

  // Inspection Schedule State (Hero Data: 05 Sep 2026, 11:00 AM)
  const [inspDate, setInspDate] = useState('2026-09-05');
  const [inspTime, setInspTime] = useState('11:00 AM');
  const [inspLocation, setInspLocation] = useState('Plot No. E-45, MIDC Chakan Phase II, Pune');
  const [inspRemarks, setInspRemarks] = useState(
    'Site verified. Refrigeration compressor units, ammonia safety valves, and multi-chamber insulation comply with FSSAI cold chain norms.'
  );

  // 5-Point Inspection Checklist State
  const [checklist, setChecklist] = useState<InspectionChecklistItem[]>([
    { id: 'chk-1', label: 'Site identity & plot demarcation verified (Plot No. E-45, MIDC Chakan)', status: 'PASS' },
    { id: 'chk-2', label: 'Insulated cold storage multi-chamber structure constructed', status: 'PASS' },
    { id: 'chk-3', label: 'Storage capacity consistent with application (5,000 MT verified)', status: 'PASS' },
    { id: 'chk-4', label: 'Process flow & temperature monitoring sensors reviewed', status: 'PASS' },
    { id: 'chk-5', label: 'Ammonia refrigerant relief valves & ventilation observed', status: 'PASS' },
  ]);

  // Rejection Reason State
  const [rejectReason, setRejectReason] = useState('');

  const handleRaiseQuery = (e: React.FormEvent) => {
    e.preventDefault();
    addQuery(queryTitle, queryText);
    setShowQueryModal(false);
    setActiveTab('QUERIES');
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleInspection(inspDate, inspTime, inspLocation);
    setShowScheduleModal(false);
    setActiveTab('INSPECTION');
  };

  const handleChecklistToggle = (id: string, newStatus: 'PASS' | 'FAIL') => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
  };

  const handleCompleteInspection = () => {
    const hasFail = checklist.some((c) => c.status === 'FAIL');
    const outcome = hasFail ? 'UNSATISFACTORY' : 'SATISFACTORY';
    completeInspection(outcome, inspRemarks, checklist);
  };

  const handleConfirmApprove = () => {
    approveApplication('APR-MH-2026-00124');
    setShowApproveModal(false);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    rejectApplication(rejectReason);
    setShowRejectModal(false);
  };

  const latestQuery = queries[0];
  const isQueryResponded = latestQuery && latestQuery.status === 'RESPONDED';

  // Final Review Quality Checks
  const reviewGates = [
    { id: 'g-1', label: 'Application submitted & verified', passed: application.status !== 'DRAFT' },
    { id: 'g-2', label: 'Required documents available in vault (7 / 7)', passed: documents.length >= 7 },
    { id: 'g-3', label: 'Pre-validation quality checks completed', passed: true },
    { id: 'g-4', label: 'Official department queries resolved', passed: queries.length === 0 || queries.every((q) => q.status === 'RESPONDED' || q.status === 'RESOLVED') },
    { id: 'g-5', label: 'On-site physical inspection completed', passed: Boolean(inspection && inspection.status === 'COMPLETED') },
    { id: 'g-6', label: 'Inspection outcome verified as SATISFACTORY', passed: Boolean(inspection && inspection.outcome === 'SATISFACTORY') },
  ];

  const allGatesPassed = reviewGates.every((g) => g.passed);
  const isDecisionMade = application.status === 'APPROVED' || application.status === 'REJECTED';

  return (
    <div className="page-body">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-green">SCRUTINY DOSSIER</span>
            <span className="badge badge-neutral">{application.appNumber}</span>
            <StatusBadge status={application.status} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            {business.name} — {application.approvalName}
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span>Scrutiny Officer: <strong>{currentPersona.name}</strong></span>
            <span>•</span>
            <span><MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> {business.district}, {business.state} ({business.locationType} Chakan Phase II)</span>
            <span>•</span>
            <span>Submitted: {new Date(application.submittedAt || '2026-08-28T09:00:00Z').toLocaleString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isDecisionMade && (
            <>
              <button
                type="button"
                onClick={() => setShowQueryModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <HelpCircle size={14} /> Raise Query
              </button>
              {inspection?.status !== 'COMPLETED' && (
                <button
                  type="button"
                  onClick={() => {
                    if (!inspection) setShowScheduleModal(true);
                    else setActiveTab('INSPECTION');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Calendar size={14} /> {inspection ? 'View Inspection' : 'Schedule Inspection'}
                </button>
              )}
            </>
          )}
          <Link to="/government/applications" className="btn btn-secondary btn-sm">
            <Inbox size={14} /> Queue
          </Link>
        </div>
      </div>

      {/* Approved / Final Decision Spotlight Banner */}
      {application.status === 'APPROVED' && (
        <div
          style={{
            marginBottom: '20px',
            padding: '18px 24px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#15803d',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#14532d' }}>
                APPLICATION APPROVED — FINAL DECISION RECORDED
              </div>
              <div style={{ fontSize: '13px', color: '#166534', marginTop: '2px' }}>
                BuildX Clearance Reference: <strong>APR-MH-2026-00124</strong> • Decided by {currentPersona.name}
              </div>
            </div>
          </div>

          <span className="badge badge-green" style={{ fontSize: '11px', padding: '6px 12px' }}>
            STATUS: APPROVED
          </span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`btn btn-sm ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Scrutiny Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('FORM_DATA')}
          className={`btn btn-sm ${activeTab === 'FORM_DATA' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Application Parameters
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`btn btn-sm ${activeTab === 'DOCUMENTS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Documents ({documents.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('QUERIES')}
          className={`btn btn-sm ${activeTab === 'QUERIES' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Query Desk ({queries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('INSPECTION')}
          className={`btn btn-sm ${activeTab === 'INSPECTION' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Inspection Desk {inspection ? `(${inspection.status})` : ''}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('DECISION')}
          className={`btn btn-sm ${activeTab === 'DECISION' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Final Review & Decision
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TIMELINE')}
          className={`btn btn-sm ${activeTab === 'TIMELINE' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Audit Timeline ({events.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'OVERVIEW' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid-3">
            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Application Number
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1d4ed8', marginTop: '4px' }}>
                {application.appNumber}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                FSSAI Central Licensing Portal
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Inspection Status
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: inspection?.outcome === 'SATISFACTORY' ? '#15803d' : '#0f172a', marginTop: '4px' }}>
                {inspection ? `${inspection.status} (${inspection.outcome})` : 'Not Scheduled'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {inspection ? `Date: ${inspection.scheduledDate} at ${inspection.scheduledTime}` : 'Pending scheduling'}
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Final Decision Status
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: application.status === 'APPROVED' ? '#15803d' : '#0f172a', marginTop: '4px' }}>
                {application.status}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                {application.status === 'APPROVED' ? 'Clearance Ref: APR-MH-2026-00124' : 'In Scrutiny Workflow'}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Scrutiny Stage Progress</div>
                <div className="card-subtitle">Official checklist for single-window clearance</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#15803d" />
                  <span style={{ fontWeight: '600' }}>1. Pre-Submission Quality Gate & Verification</span>
                </div>
                <span className="badge badge-green">PASSED</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#15803d" />
                  <span style={{ fontWeight: '600' }}>2. Officer Scrutiny & Document Verification</span>
                </div>
                <span className="badge badge-green">VERIFIED</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: inspection?.status === 'COMPLETED' ? '#f0fdf4' : '#eff6ff', borderRadius: '6px', border: `1px solid ${inspection?.status === 'COMPLETED' ? '#bbf7d0' : '#bfdbfe'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {inspection?.status === 'COMPLETED' ? <CheckCircle2 size={16} color="#15803d" /> : <Clock size={16} color="#1d4ed8" />}
                  <span style={{ fontWeight: '600', color: inspection?.status === 'COMPLETED' ? '#15803d' : '#1d4ed8' }}>
                    3. Site Verification & Inspection
                  </span>
                </div>
                <span className={`badge ${inspection?.status === 'COMPLETED' ? 'badge-green' : 'badge-blue'}`}>
                  {inspection ? inspection.status : 'PENDING'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: application.status === 'APPROVED' ? '#f0fdf4' : '#f8fafc', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {application.status === 'APPROVED' ? <CheckCircle2 size={16} color="#15803d" /> : <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #94a3b8', display: 'inline-block' }} />}
                  <span style={{ fontWeight: application.status === 'APPROVED' ? '600' : 'normal', color: application.status === 'APPROVED' ? '#15803d' : '#64748b' }}>
                    4. Final Decision & Grant of Clearance
                  </span>
                </div>
                <span className={`badge ${application.status === 'APPROVED' ? 'badge-green' : 'badge-neutral'}`}>
                  {application.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Application Parameters */}
      {activeTab === 'FORM_DATA' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Submitted Application Parameters</div>
              <div className="card-subtitle">Verified parameters transmitted by applicant</div>
            </div>
          </div>

          <div className="grid-3" style={{ fontSize: '13px' }}>
            <div className="form-group">
              <label className="form-label">Enterprise Name</label>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.name}</div>
            </div>
            <div className="form-group">
              <label className="form-label">PAN / GSTIN</label>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.pan} / {business.gstin}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Location Type & Plot</label>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>MIDC Chakan Phase II, {business.plotNumber}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Storage Capacity (MT)</label>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.storageCapacityMt} MT ({business.storageType})</div>
            </div>
            <div className="form-group">
              <label className="form-label">Connected Power Demand</label>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{business.powerRequirementKw} kW (HT Industrial)</div>
            </div>
            <div className="form-group">
              <label className="form-label">Capital Investment</label>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>₹{(business.totalInvestmentInr / 10000000).toFixed(2)} Crores</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === 'DOCUMENTS' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Document Verification Desk</div>
              <div className="card-subtitle">Scrutinize uploaded drawings and statutory filings</div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Document Name</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>File Attached</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Scrutiny Status</th>
                  <th style={{ padding: '10px 14px', fontWeight: '600' }}>Officer Action</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0f172a' }}>
                      {doc.docName}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {doc.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#1d4ed8' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={14} />
                        <span>{doc.fileName}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.fileSizeKb} KB</div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <StatusBadge status={doc.verificationStatus} />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => updateDocumentStatus(doc.id, 'VERIFIED')}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#15803d', borderColor: '#bbf7d0', fontSize: '11px' }}
                        >
                          <Check size={12} /> Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Queries */}
      {activeTab === 'QUERIES' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Official Clarification & Query Manager</div>
              <div className="card-subtitle">Official communications raised with applicant</div>
            </div>
            {!isDecisionMade && (
              <button
                type="button"
                onClick={() => setShowQueryModal(true)}
                className="btn btn-primary btn-sm"
              >
                <HelpCircle size={14} /> Raise Query
              </button>
            )}
          </div>

          {queries.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No queries currently raised on this application.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {queries.map((q) => (
                <div
                  key={q.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '16px',
                    background: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                          {q.title}
                        </span>
                        <StatusBadge status={q.status} />
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        Raised by: <strong>{q.officerName}</strong> • {new Date(q.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {q.status === 'RESPONDED' && (
                      <button
                        type="button"
                        onClick={() => resolveQuery(q.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#15803d', borderColor: '#bbf7d0', fontSize: '11px' }}
                      >
                        <Check size={12} /> Mark Resolved
                      </button>
                    )}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '13px', color: '#334155', border: '1px solid #e2e8f0' }}>
                    <strong>Officer Request:</strong> {q.queryText}
                  </div>

                  {q.response && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '14px',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        border: '1px solid #bbf7d0',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>
                        <CheckCircle2 size={15} />
                        <span>Applicant Response (Submitted {new Date(q.response.submittedAt).toLocaleString()})</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                        {q.response.responseText}
                      </div>
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1d4ed8' }}>
                        <FileText size={14} />
                        <span>Attached Revision: <strong>FreshChain_Process_Flow_v2.pdf</strong> (1.92 MB)</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Inspection Desk */}
      {activeTab === 'INSPECTION' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!inspection ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <Calendar size={36} color="#64748b" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                No Inspection Currently Scheduled
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', maxWidth: '500px', margin: '6px auto 16px' }}>
                Schedule a site verification for cold storage chamber inspection and safety testing before issuing final clearance.
              </p>
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="btn btn-primary"
              >
                <Calendar size={14} /> Schedule Site Inspection (05 Sep 2026, 11:00 AM)
              </button>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardCheck size={18} color="#1d4ed8" /> Site Inspection Desk
                  </div>
                  <div className="card-subtitle">
                    Scheduled for: <strong>{inspection.scheduledDate} at {inspection.scheduledTime}</strong> • {inspection.location}
                  </div>
                </div>
                <StatusBadge status={inspection.status} />
              </div>

              {/* Inspection Execution Steps */}
              {inspection.status === 'SCHEDULED' && (
                <div style={{ padding: '20px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e3a8a' }}>
                      Inspection Scheduled for {inspection.scheduledDate} ({inspection.scheduledTime})
                    </div>
                    <div style={{ fontSize: '12px', color: '#3b82f6', marginTop: '2px' }}>
                      Assigned Inspecting Officer: {inspection.officerName} (Pune Scrutiny Unit)
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={startInspection}
                    className="btn btn-primary"
                  >
                    Start Inspection
                  </button>
                </div>
              )}

              {/* Inspection Checklist in Progress */}
              {inspection.status === 'IN_PROGRESS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                    Mandatory Site Verification Checklist:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px 14px',
                          background: item.status === 'PASS' ? '#f0fdf4' : '#fef2f2',
                          border: `1px solid ${item.status === 'PASS' ? '#bbf7d0' : '#fecaca'}`,
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                          {item.label}
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleChecklistToggle(item.id, 'PASS')}
                            className={`btn btn-sm ${item.status === 'PASS' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            PASS
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChecklistToggle(item.id, 'FAIL')}
                            className={`btn btn-sm ${item.status === 'FAIL' ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            FAIL
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="form-group" style={{ marginTop: '10px' }}>
                    <label className="form-label">Inspecting Officer Remarks / Field Notes *</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={inspRemarks}
                      onChange={(e) => setInspRemarks(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={handleCompleteInspection}
                      className="btn btn-primary"
                      style={{ padding: '10px 20px' }}
                    >
                      <CheckCircle2 size={16} /> Complete Inspection (SATISFACTORY)
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Inspection Summary */}
              {inspection.status === 'COMPLETED' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div
                    style={{
                      padding: '16px',
                      background: inspection.outcome === 'SATISFACTORY' ? '#f0fdf4' : '#fef2f2',
                      borderRadius: '6px',
                      border: `1px solid ${inspection.outcome === 'SATISFACTORY' ? '#bbf7d0' : '#fecaca'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: inspection.outcome === 'SATISFACTORY' ? '#15803d' : '#b91c1c' }}>
                      <CheckCircle2 size={18} />
                      <span>INSPECTION OUTCOME: {inspection.outcome}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '6px' }}>
                      <strong>Officer Remarks:</strong> {inspection.remarks}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Conducted on: {inspection.scheduledDate} at {inspection.scheduledTime} • Signed by {inspection.officerName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('DECISION')}
                      className="btn btn-primary"
                    >
                      Proceed to Final Review & Decision <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Final Review & Decision Gate */}
      {activeTab === 'DECISION' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#1d4ed8" /> Final Scrutiny Review & Decision Gate
              </div>
              <div className="card-subtitle">
                Verify all upstream clearances before granting statutory approval
              </div>
            </div>
            <StatusBadge status={application.status} />
          </div>

          {/* Verification Checklist Gate */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {reviewGates.map((gate) => (
              <div
                key={gate.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: gate.passed ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${gate.passed ? '#bbf7d0' : '#fecaca'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {gate.passed ? <CheckCircle2 size={16} color="#15803d" /> : <AlertCircle size={16} color="#b91c1c" />}
                  <span style={{ fontSize: '13px', fontWeight: '600', color: gate.passed ? '#14532d' : '#991b1b' }}>
                    {gate.label}
                  </span>
                </div>
                <span className={`badge ${gate.passed ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '10px' }}>
                  {gate.passed ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>

          {/* Decision Status Actions */}
          {!isDecisionMade ? (
            <div
              style={{
                padding: '20px',
                background: allGatesPassed ? '#f0fdf4' : '#fffbeb',
                borderRadius: '6px',
                border: `1px solid ${allGatesPassed ? '#bbf7d0' : '#fde68a'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: allGatesPassed ? '#15803d' : '#92400e' }}>
                  {allGatesPassed ? 'READY FOR FINAL APPROVAL DECISION' : 'SCRUTINY STAGES INCOMPLETE'}
                </div>
                <div style={{ fontSize: '12px', color: allGatesPassed ? '#166534' : '#b45309', marginTop: '2px' }}>
                  {allGatesPassed
                    ? 'All 6 quality gates passed. Officer can grant official approval.'
                    : 'Complete pending inspection before recording final decision.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  <XCircle size={14} /> Reject Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowApproveModal(true)}
                  disabled={!allGatesPassed}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', opacity: allGatesPassed ? 1 : 0.5 }}
                >
                  <Award size={14} /> Approve Application
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '20px',
                background: application.status === 'APPROVED' ? '#f0fdf4' : '#fef2f2',
                borderRadius: '6px',
                border: `1px solid ${application.status === 'APPROVED' ? '#bbf7d0' : '#fecaca'}`,
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: '700', color: application.status === 'APPROVED' ? '#15803d' : '#b91c1c' }}>
                FINAL DECISION: {application.status}
              </div>
              <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '4px' }}>
                {application.status === 'APPROVED'
                  ? `Clearance Reference Number: APR-MH-2026-00124 (Decided ${new Date(application.decidedAt || '').toLocaleString()})`
                  : `Reason for Rejection: ${application.decisionReason}`}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Decision recorded in audit trail. Immutability locked.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Audit Timeline */}
      {activeTab === 'TIMELINE' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Application Audit Trail & Timeline</div>
              <div className="card-subtitle">Immutable log of events across entrepreneur and government interactions</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '10px' }}>
            {events.map((evt) => (
              <div
                key={evt.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: evt.actorRole === 'OFFICER' ? '#eff6ff' : '#f0fdf4',
                    color: evt.actorRole === 'OFFICER' ? '#1d4ed8' : '#15803d',
                    border: `1px solid ${evt.actorRole === 'OFFICER' ? '#bfdbfe' : '#bbf7d0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={16} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                      {evt.title}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      {evt.actorRole}
                    </span>
                  </div>
                  {evt.description && (
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                      {evt.description}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {new Date(evt.createdAt).toLocaleString()} • {evt.actorName || 'System'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      {showQueryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '560px', background: '#ffffff', boxShadow: 'var(--shadow-md)' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Raise Official Clarification</div>
                <div className="card-subtitle">This request will be sent to the applicant's query workspace.</div>
              </div>
              <button type="button" onClick={() => setShowQueryModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }} aria-label="Close query form">✕</button>
            </div>
            <form onSubmit={handleRaiseQuery}>
              <div className="form-group">
                <label className="form-label">Query title *</label>
                <input className="form-input" value={queryTitle} onChange={(e) => setQueryTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Clarification requested *</label>
                <textarea className="form-textarea" rows={4} value={queryText} onChange={(e) => setQueryText(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Related document</label>
                <select className="form-select" value={relatedDoc} onChange={(e) => setRelatedDoc(e.target.value)}>
                  <option>Process Flow Diagram</option>
                  <option>Cold Chain Layout Plan</option>
                  <option>Food Safety Management Plan</option>
                  <option>Other supporting document</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowQueryModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary"><HelpCircle size={14} /> Raise Query</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Inspection Modal */}
      {showScheduleModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="card-header">
              <div>
                <div className="card-title">Schedule Site Inspection</div>
                <div className="card-subtitle">Hero Inspection: 05 Sep 2026 at 11:00 AM</div>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Inspection Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={inspDate}
                    onChange={(e) => setInspDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Inspection Time *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={inspTime}
                    onChange={(e) => setInspTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Inspection Site Location *</label>
                <input
                  type="text"
                  className="form-input"
                  value={inspLocation}
                  onChange={(e) => setInspLocation(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Calendar size={14} /> Transmit Schedule Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Application Modal */}
      {showApproveModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="card-header">
              <div>
                <div className="card-title">Confirm Final Approval</div>
                <div className="card-subtitle">FSSAI Central Licence — APP-MH-2026-00124</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6', margin: '14px 0' }}>
              <p>
                Are you sure you want to approve this application for <strong>{business.name}</strong>?
              </p>
              <div style={{ marginTop: '10px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div><strong>Generated Clearance Ref:</strong> APR-MH-2026-00124</div>
                <div><strong>Authority:</strong> FSSAI Central Licensing Authority</div>
                <div><strong>Inspection Status:</strong> SATISFACTORY (Completed 05 Sep 2026)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowApproveModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="btn btn-primary"
              >
                <Award size={14} /> Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="card-header">
              <div>
                <div className="card-title">Reject Application</div>
                <div className="card-subtitle">Mandatory justification required for rejection</div>
              </div>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="form-group">
                <label className="form-label">Official Rejection Reason *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter detailed regulatory justification for rejecting this application..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rejectReason.trim()}
                  className="btn btn-danger"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
