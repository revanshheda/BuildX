

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function DocumentVaultPage() {
  const { business, documents, addDocument, application } = useAppStore();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Document Upload State
  const [newDocName, setNewDocName] = useState('Process Flow Diagram');
  const [newDocCode, setNewDocCode] = useState('PROCESS_FLOW');
  const [newDocCategory, setNewDocCategory] = useState<'LEGAL' | 'LAND' | 'TECHNICAL' | 'FINANCIAL' | 'ENVIRONMENTAL'>('TECHNICAL');
  const [newFileName, setNewFileName] = useState('FreshChain_Process_Flow_v1.pdf');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categories = ['ALL', 'LEGAL', 'LAND', 'TECHNICAL', 'FINANCIAL'];

  const filteredDocs =
    filterCategory === 'ALL'
      ? documents
      : documents.filter((d) => d.category === filterCategory);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      businessId: business.id,
      docCode: newDocCode,
      docName: newDocName,
      category: newDocCategory,
      fileName: newFileName,
      fileSizeKb: 1840,
      verificationStatus: 'VERIFIED',
    });
    setShowUploadModal(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  const hasProcessFlow = documents.some((d) => d.docCode === 'PROCESS_FLOW');

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-blue">REUSABLE REPOSITORY</span>
            <span className="badge badge-green">{documents.length} REUSABLE ASSETS</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            Document Vault
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Upload company legal, land, and technical drawings once. Verified assets are automatically attached and reused across multiple clearance applications.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Plus size={14} /> Upload New Document
          </button>
          <Link to={`/application/${application.id}`} className="btn btn-outline-primary">
            Back to Application <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Hero Process Flow Reminder Banner if missing */}
      {!hasProcessFlow && (
        <div
          style={{
            marginBottom: '20px',
            padding: '16px 20px',
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
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#92400e' }}>
                Process Flow Diagram Missing from Vault
              </div>
              <div style={{ fontSize: '12px', color: '#b45309' }}>
                Required by FSSAI Application (APP-MH-2026-00124). Pre-validation will block submission until this document is uploaded.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Upload size={12} /> Upload Process Flow Diagram
          </button>
        </div>
      )}

      {uploadSuccess && (
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
          <span>Document uploaded successfully and synchronized with active applications.</span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCategory(cat)}
            className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
          >
            {cat === 'ALL' ? `All Vault Documents (${documents.length})` : cat}
          </button>
        ))}
      </div>

      {/* Document Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Verified Repository Documents</div>
            <div className="card-subtitle">Showing assets linked to {business.name}</div>
          </div>
          <span className="badge badge-neutral">{filteredDocs.length} DOCUMENTS</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Document Name</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>File Attached</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Verification</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Applications Reusing</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: '600', color: '#0f172a' }}>{doc.docName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Code: {doc.docCode}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                      {doc.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', fontWeight: '500' }}>
                      <FileText size={14} />
                      <span>{doc.fileName}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.fileSizeKb} KB</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={doc.verificationStatus} />
                  </td>
                  <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                    {doc.docCode === 'PROCESS_FLOW' || doc.docCode === 'COLD_STORAGE_LAYOUT' ? (
                      <span className="badge badge-blue" style={{ fontSize: '10px' }}>
                        FSSAI Central Licence
                      </span>
                    ) : (
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        Multiple Applications (FSSAI, MIDC, MPCB)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal Drawer */}
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
              maxWidth: '520px',
              boxShadow: 'var(--shadow-md)',
              background: '#ffffff',
            }}
          >
            <div className="card-header">
              <div>
                <div className="card-title">Upload Document to Vault</div>
                <div className="card-subtitle">Add technical drawings or legal records</div>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Document Purpose / Type *</label>
                <select
                  className="form-select"
                  value={newDocCode}
                  onChange={(e) => {
                    setNewDocCode(e.target.value);
                    if (e.target.value === 'PROCESS_FLOW') {
                      setNewDocName('Process Flow Diagram');
                      setNewFileName('FreshChain_Process_Flow_v1.pdf');
                      setNewDocCategory('TECHNICAL');
                    } else {
                      setNewDocName(e.target.value.replace(/_/g, ' '));
                    }
                  }}
                >
                  <option value="PROCESS_FLOW">Process Flow Diagram (Required by FSSAI)</option>
                  <option value="WATER_TEST_REPORT">Water Potability / Laboratory Test Report</option>
                  <option value="EQUIPMENT_LIST">Refrigeration Machinery List & Specifications</option>
                  <option value="OTHER_CERTIFICATE">Other Statutory Certificate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Document Display Title *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                >
                  <option value="TECHNICAL">TECHNICAL (Drawings, Engineering & Flow)</option>
                  <option value="LEGAL">LEGAL (Identity, Registration & Deeds)</option>
                  <option value="LAND">LAND (Allotment, Survey & Titles)</option>
                  <option value="FINANCIAL">FINANCIAL (DPR & Project Budgets)</option>
                  <option value="ENVIRONMENTAL">ENVIRONMENTAL (Pollution & Hazards)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select File to Upload (PDF / Drawing) *</label>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '6px',
                    padding: '20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                  }}
                >
                  <Upload size={24} color="#1d4ed8" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                    {newFileName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Simulated secure upload (PDF, max 15MB)
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
                  <Upload size={14} /> Confirm & Upload to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
