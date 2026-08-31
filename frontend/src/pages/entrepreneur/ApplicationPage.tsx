

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  Save,
  ShieldCheck,
  FolderOpen,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';

export default function ApplicationBuilderPage() {
  const {
    business,
    documents,
    addDocument,
    application,
    updateApplicationStatus,
    updateApplicationFormData,
    submitApplication,
  } = useAppStore();

  const [formData, setFormData] = useState(application.formData);
  const [declarationAccepted, setDeclarationAccepted] = useState(true);
  const [isPreValidating, setIsPreValidating] = useState(false);
  const [validationRun, setValidationRun] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Document requirement checklist
  const requiredDocCodes = [
    { code: 'PAN', name: 'Company PAN Card', mandatory: true },
    { code: 'INCORPORATION_CERT', name: 'Certificate of Incorporation (MCA)', mandatory: true },
    { code: 'MIDC_ALLOTMENT', name: 'MIDC Plot Lease / Allotment Letter', mandatory: true },
    { code: 'SITE_PLAN', name: 'Site & Key Layout Plan', mandatory: true },
    { code: 'PROJECT_REPORT', name: 'Detailed Project Report (DPR)', mandatory: true },
    { code: 'COLD_STORAGE_LAYOUT', name: 'Refrigeration & Chamber Layout Plan', mandatory: true },
    { code: 'PROCESS_FLOW', name: 'Cold Chain Process Flow Diagram', mandatory: true, isHeroMissing: true },
  ];

  const hasProcessFlow = documents.some((d) => d.docCode === 'PROCESS_FLOW');

  // Pre-validation check results
  const checks = [
    {
      id: 'check-01',
      title: 'Business Legal Identity & GSTIN Consistency',
      desc: 'Matches MCA corporate registry and Maharashtra state tax records.',
      passed: Boolean(business.name && business.pan && business.gstin),
    },
    {
      id: 'check-02',
      title: 'MIDC Industrial Location & Plot Verification',
      desc: 'Valid plot allotment in Chakan Phase II under Pune jurisdiction.',
      passed: Boolean(business.locationType === 'MIDC' && business.plotNumber),
    },
    {
      id: 'check-03',
      title: 'Cold Storage Capacity & Technical Specifications',
      desc: `Storage capacity ${business.storageCapacityMt} MT declared with power ${business.powerRequirementKw} kW.`,
      passed: Boolean(business.storageCapacityMt > 0 && business.powerRequirementKw > 0),
    },
    {
      id: 'check-04',
      title: 'Statutory Declaration & Authorized Signatory',
      desc: `Signed by ${business.contactName} (${business.contactDesignation}).`,
      passed: declarationAccepted,
    },
    {
      id: 'check-05',
      title: 'Mandatory Technical Drawings & Process Flow Diagram',
      desc: hasProcessFlow
        ? 'Process flow diagram uploaded and verified in vault.'
        : 'CRITICAL BLOCKER: Process Flow Diagram is required for FSSAI Cold Storage clearance.',
      passed: hasProcessFlow,
      isBlocker: !hasProcessFlow,
    },
  ];

  const allPassed = checks.every((c) => c.passed);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    updateApplicationFormData(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const runPreValidation = () => {
    setIsPreValidating(true);
    setTimeout(() => {
      setIsPreValidating(false);
      setValidationRun(true);
      if (allPassed) {
        updateApplicationStatus('READY_TO_SUBMIT');
      } else {
        updateApplicationStatus('VALIDATION_ERROR');
      }
    }, 600);
  };

  const handleUploadProcessFlow = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      businessId: business.id,
      docCode: 'PROCESS_FLOW',
      docName: 'Cold Chain Process Flow Diagram',
      category: 'TECHNICAL',
      fileName: 'FreshChain_Process_Flow_v1.pdf',
      fileSizeKb: 1840,
      verificationStatus: 'VERIFIED',
    });
    setShowUploadModal(false);
    // Auto re-validate
    setTimeout(() => {
      updateApplicationStatus('READY_TO_SUBMIT');
      setValidationRun(true);
    }, 300);
  };

  const handleConfirmSubmit = () => {
    submitApplication();
    setShowSubmitModal(false);
  };

  const isSubmitted = application.status === 'SUBMITTED' || ['UNDER_REVIEW', 'QUERY_RAISED', 'QUERY_RESPONDED', 'INSPECTION_SCHEDULED', 'INSPECTION_COMPLETED', 'APPROVED'].includes(application.status);

  return (
    <div className="page-body">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">APPLICATION BUILDER</span>
            <span className="badge badge-neutral">{application.appNumber}</span>
            <StatusBadge status={application.status} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            {application.approvalName}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Issuing Authority: <strong>{application.authorityName}</strong> • {application.department}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isSubmitted && (
            <button type="button" onClick={handleSaveDraft} className="btn btn-secondary">
              <Save size={14} /> Save Draft
            </button>
          )}
          <Link to="/roadmap" className="btn btn-outline-primary">
            View Roadmap <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {saveToast && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            color: '#15803d',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>Application draft progress saved successfully. Status: DRAFT.</span>
        </div>
      )}

      {/* Status Banner */}
      {isSubmitted && (
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: application.status === 'APPROVED' ? '#f0fdf4' : '#eff6ff',
            border: `1px solid ${application.status === 'APPROVED' ? '#bbf7d0' : '#bfdbfe'}`,
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
                background: application.status === 'APPROVED' ? '#15803d' : '#1d4ed8',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: application.status === 'APPROVED' ? '#14532d' : '#1e3a8a' }}>
                {application.status === 'APPROVED'
                  ? 'APPLICATION APPROVED — CLEARANCE GRANTED'
                  : application.status === 'INSPECTION_SCHEDULED'
                  ? 'SITE INSPECTION SCHEDULED'
                  : 'APPLICATION SUBMITTED TO SCRUTINY CELL'}
              </div>
              <div style={{ fontSize: '13px', color: application.status === 'APPROVED' ? '#166534' : '#1d4ed8', marginTop: '2px' }}>
                {application.status === 'APPROVED'
                  ? `Clearance Reference: APR-MH-2026-00124 • Approved by FSSAI Designated Officer.`
                  : application.status === 'INSPECTION_SCHEDULED'
                  ? `Inspection scheduled for 05 Sep 2026 at 11:00 AM on-site at MIDC Chakan.`
                  : `Dossier ${application.appNumber} has been transmitted to FSSAI Scrutiny Cell (Pune Division).`}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/roadmap" className="btn btn-primary">
              View Updated Roadmap <ArrowRight size={14} />
            </Link>
            <Link to="/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Main Guided Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Section 1: Pre-filled Business Legal Information */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={18} color="#1d4ed8" /> 1. Applicant & Enterprise Legal Identity
              </div>
              <div className="card-subtitle">Auto-populated from verified Business Profile</div>
            </div>
            <span className="badge badge-green">VERIFIED PROFILE DATA</span>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Legal Name of Enterprise</label>
              <input type="text" className="form-input" value={business.name} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Trade / Facility Name</label>
              <input type="text" className="form-input" value={business.tradeName} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Company PAN</label>
              <input type="text" className="form-input" value={business.pan} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Corporate Identification (CIN)</label>
              <input type="text" className="form-input" value={business.cin} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Maharashtra GSTIN</label>
              <input type="text" className="form-input" value={business.gstin} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Authorized Signatory</label>
              <input type="text" className="form-input" value={`${business.contactName} (${business.contactDesignation})`} disabled />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Site Context */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#1d4ed8" /> 2. Site Location & Premises Details
              </div>
              <div className="card-subtitle">Physical premises context under MIDC Pune jurisdiction</div>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">State & District</label>
              <input type="text" className="form-input" value={`${business.state} — ${business.district}`} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Industrial Area / Zone</label>
              <input type="text" className="form-input" value={`${business.industrialArea} (${business.locationType})`} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Plot Number</label>
              <input type="text" className="form-input" value={business.plotNumber} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Premises Tenure *</label>
              <select
                className="form-select"
                value={formData.premisesType || 'Owned (MIDC Industrial Leasehold)'}
                onChange={(e) => handleFieldChange('premisesType', e.target.value)}
                disabled={isSubmitted}
              >
                <option value="Owned (MIDC Industrial Leasehold)">Owned (MIDC 95-Year Industrial Leasehold)</option>
                <option value="Rented / Sub-leased">Rented / Sub-leased</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Built-up Area</label>
              <input type="text" className="form-input" value={`${business.builtUpAreaSqft.toLocaleString()} Sq. Ft.`} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Capital Investment</label>
              <input type="text" className="form-input" value={`₹${(business.totalInvestmentInr / 10000000).toFixed(2)} Crores`} disabled />
            </div>
          </div>
        </div>

        {/* Section 3: Technical & Operational Parameters */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} color="#1d4ed8" /> 3. Cold Storage Technical & Operational Parameters
              </div>
              <div className="card-subtitle">Specific refrigeration capacity, power, and food category classifications</div>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Refrigerated Storage Capacity</label>
              <input type="text" className="form-input" value={`${business.storageCapacityMt.toLocaleString()} Metric Tonnes (MT)`} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature Operating Band</label>
              <input type="text" className="form-input" value={business.temperatureRange} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Connected Power / Grid Load</label>
              <input type="text" className="form-input" value={`${business.powerRequirementKw} kW (HT Connected)`} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Standby Diesel Generator (DG Set) *</label>
              <input
                type="text"
                className="form-input"
                value={formData.standbyGensetKva || '500 kVA'}
                onChange={(e) => handleFieldChange('standbyGensetKva', e.target.value)}
                disabled={isSubmitted}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Operating Schedule / Shifts *</label>
              <select
                className="form-select"
                value={formData.operationalShift || '24 Hours / 3 Shifts'}
                onChange={(e) => handleFieldChange('operationalShift', e.target.value)}
                disabled={isSubmitted}
              >
                <option value="24 Hours / 3 Shifts">24 Hours / 3 Continuous Shifts</option>
                <option value="16 Hours / 2 Shifts">16 Hours / 2 Shifts</option>
                <option value="8 Hours / Single Shift">8 Hours / Single Shift</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ammonia Refrigerant Safety Compliance *</label>
              <input
                type="text"
                className="form-input"
                value={formData.ammoniaSafetyAudit || 'Certified / Pressure Relief Compliant'}
                onChange={(e) => handleFieldChange('ammoniaSafetyAudit', e.target.value)}
                disabled={isSubmitted}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Document Attachments from Vault */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={18} color="#1d4ed8" /> 4. Attached Vault Documents & Drawings
              </div>
              <div className="card-subtitle">Required by FSSAI Central Licensing regulations</div>
            </div>
            <Link to="/vault" className="btn btn-secondary btn-sm">
              Manage Vault Documents
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requiredDocCodes.map((req) => {
              const matchedDoc = documents.find((d) => d.docCode === req.code);
              const isAttached = Boolean(matchedDoc);

              return (
                <div
                  key={req.code}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '6px',
                    background: isAttached ? '#f8fafc' : '#fef2f2',
                    border: `1px solid ${isAttached ? '#e2e8f0' : '#fecaca'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isAttached ? (
                      <CheckCircle2 size={18} color="#15803d" />
                    ) : (
                      <AlertCircle size={18} color="#b91c1c" />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                        {req.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {isAttached ? (
                          <span>File: <strong>{matchedDoc?.fileName}</strong> ({matchedDoc?.fileSizeKb} KB)</span>
                        ) : (
                          <span style={{ color: '#b91c1c', fontWeight: '600' }}>
                            MISSING FROM VAULT — Upload required before submission
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isAttached ? (
                      <StatusBadge status={matchedDoc?.verificationStatus || 'VERIFIED'} />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="btn btn-primary btn-sm"
                      >
                        <Upload size={12} /> Upload Process Flow
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Statutory Declaration */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#1d4ed8" /> 5. Applicant Declaration & Authorization
              </div>
              <div className="card-subtitle">Legal undertaking under Food Safety & Standards Act, 2006</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
            <input
              type="checkbox"
              id="declaration"
              checked={declarationAccepted}
              onChange={(e) => setDeclarationAccepted(e.target.checked)}
              disabled={isSubmitted}
              style={{ marginTop: '3px', cursor: 'pointer' }}
            />
            <label htmlFor="declaration" style={{ cursor: 'pointer' }}>
              I hereby declare that the information furnished in this application for <strong>{business.name}</strong> at <strong>Plot No. E-45, MIDC Chakan Phase II, Pune</strong> is true, correct, and complete to the best of my knowledge. All cold chain refrigeration, temperature logging, and food hygiene requirements comply with FSSAI regulations.
            </label>
          </div>
        </div>

        {/* Section 6: Quality Gate / Pre-validation Section */}
        <div
          className="card"
          style={{
            borderLeft: validationRun
              ? allPassed
                ? '4px solid #15803d'
                : '4px solid #b91c1c'
              : '4px solid #1d4ed8',
            background: validationRun
              ? allPassed
                ? '#fcfdfd'
                : '#fefefe'
              : '#ffffff',
          }}
        >
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#1d4ed8" /> 6. Pre-Submission Quality Gate Check
              </div>
              <div className="card-subtitle">
                Automated validation of fields, mandatory drawings, and business consistency before submission
              </div>
            </div>

            <button
              type="button"
              onClick={runPreValidation}
              disabled={isPreValidating || isSubmitted}
              className="btn btn-secondary btn-sm"
            >
              {isPreValidating ? (
                <>
                  <Clock size={14} className="spin" /> Checking Quality Gate...
                </>
              ) : (
                <>
                  <RotateCcw size={14} /> Run Pre-Submission Check
                </>
              )}
            </button>
          </div>

          {/* Validation Checklist Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {checks.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: c.passed ? '#f8fafc' : '#fef2f2',
                  border: `1px solid ${c.passed ? '#e2e8f0' : '#fecaca'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {c.passed ? (
                    <CheckCircle2 size={16} color="#15803d" />
                  ) : (
                    <AlertCircle size={16} color="#b91c1c" />
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: c.passed ? '#0f172a' : '#991b1b' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '11px', color: c.passed ? '#64748b' : '#b91c1c' }}>
                      {c.desc}
                    </div>
                  </div>
                </div>

                <span
                  className={`badge ${c.passed ? 'badge-green' : 'badge-red'}`}
                  style={{ fontSize: '10px' }}
                >
                  {c.passed ? 'PASSED' : 'BLOCKING'}
                </span>
              </div>
            ))}
          </div>

          {/* Quality Gate Status Result Banner */}
          {validationRun && (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '6px',
                background: allPassed ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${allPassed ? '#bbf7d0' : '#fecaca'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: allPassed ? '#15803d' : '#b91c1c' }}>
                  {allPassed ? 'APPLICATION READY TO SUBMIT' : 'SUBMISSION BLOCKED — 1 BLOCKING ISSUE'}
                </div>
                <div style={{ fontSize: '12px', color: allPassed ? '#166534' : '#991b1b', marginTop: '2px' }}>
                  {allPassed
                    ? 'All 5 configured pre-submission checks passed. Application meets submission readiness criteria.'
                    : 'Process Flow Diagram is required for FSSAI Cold Storage workflow. Upload the document to proceed.'}
                </div>
              </div>

              {!allPassed && (
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-danger btn-sm"
                >
                  <Upload size={12} /> Upload Process Flow
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Submission Action Bar */}
        {!isSubmitted && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-xs)',
              marginBottom: '32px',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                Application Status: <strong>{application.status}</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {!allPassed
                  ? 'Resolve blocking issues (upload Process Flow) to enable submission.'
                  : 'Pre-validation passed. Click submit to transmit application to FSSAI scrutiny queue.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn btn-secondary"
              >
                <Save size={14} /> Save Draft
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!allPassed) {
                    runPreValidation();
                    return;
                  }
                  setShowSubmitModal(true);
                }}
                disabled={!allPassed}
                className="btn btn-primary"
                style={{ padding: '10px 24px', opacity: allPassed ? 1 : 0.6 }}
              >
                Submit Application <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Process Flow Modal */}
      {showUploadModal && (
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
              maxWidth: '500px',
              background: '#ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="card-header">
              <div>
                <div className="card-title">Upload Process Flow Diagram</div>
                <div className="card-subtitle">Required by FSSAI Central Licensing Regulations</div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadProcessFlow}>
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input
                  type="text"
                  className="form-input"
                  value="Cold Chain & Refrigeration Process Flow Diagram"
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Select File to Upload</label>
                <div
                  style={{
                    border: '2px dashed #3b82f6',
                    borderRadius: '6px',
                    padding: '24px',
                    textAlign: 'center',
                    background: '#eff6ff',
                  }}
                >
                  <Upload size={28} color="#1d4ed8" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a' }}>
                    FreshChain_Process_Flow_v1.pdf
                  </div>
                  <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px' }}>
                    1.84 MB • PDF Document Ready
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Upload size={14} /> Upload & Attach to Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
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
                <div className="card-title">Confirm Application Submission</div>
                <div className="card-subtitle">Official transmission to Maharashtra Single Window scrutiny queue</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#334155', margin: '14px 0' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div><strong>Application Number:</strong> {application.appNumber}</div>
                <div><strong>Clearance:</strong> {application.approvalName}</div>
                <div><strong>Target Entity:</strong> {business.name} (MIDC Chakan, Pune)</div>
                <div><strong>Authority:</strong> {application.authorityName}</div>
              </div>

              <p>
                By submitting, your application and all 7 attached vault documents (including the Process Flow diagram) will be submitted to the FSSAI Scrutiny Officer for verification.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="btn btn-primary"
              >
                <CheckCircle2 size={14} /> Confirm & Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
