

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Upload,
  Send,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function QueryDetailPage() {
  const params = useParams();
  const { queries, respondToQuery, application } = useAppStore();

  const queryId = params?.id as string;
  const query = queries.find((q) => q.id === queryId) || queries[0];

  const [responseText, setResponseText] = useState(
    'Revised process flow diagram uploaded for review. Ammonia refrigeration circuit and temperature monitoring checkpoints have been updated as requested.'
  );
  const [attachedFileName] = useState('FreshChain_Process_Flow_v2.pdf');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!query) {
    return (
      <div className="page-body">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            No Active Query Found
          </div>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            There are no pending clarification queries on this application.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isResponded = query.status === 'RESPONDED';

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      respondToQuery(query.id, responseText, 'doc-flow-v2');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-amber">ACTION REQUIRED</span>
            <span className="badge badge-neutral">{application.appNumber}</span>
            <StatusBadge status={query.status} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            Official Clarification: {query.title}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Raised by Scrutiny Lead <strong>{query.officerName}</strong> • FSSAI Single Window Scrutiny Unit
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
          <Link to={`/application/${application.id}`} className="btn btn-outline-primary">
            View Application <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Query Detail & Officer Instruction Card */}
      <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #b45309' }}>
        <div className="card-header">
          <div>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="#b45309" /> Official Department Request
            </div>
            <div className="card-subtitle">
              Logged on {new Date(query.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '14px', color: '#1e293b', lineHeight: '1.6', background: '#fffbeb', padding: '16px', borderRadius: '6px', border: '1px solid #fde68a' }}>
          <strong>Department Instruction:</strong> {query.queryText}
        </div>
      </div>

      {/* Response Form / Status */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Entrepreneur Response</div>
            <div className="card-subtitle">
              {isResponded ? 'Submitted response record' : 'Provide written clarification and attach updated documentation'}
            </div>
          </div>
          <StatusBadge status={query.status} />
        </div>

        {isResponded ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '16px',
                background: '#f0fdf4',
                borderRadius: '6px',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <CheckCircle2 size={20} color="#15803d" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#14532d' }}>
                  Response Transmitted to Scrutiny Officer
                </div>
                <div style={{ fontSize: '13px', color: '#166534', marginTop: '4px' }}>
                  {query.response?.responseText || responseText}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#1d4ed8' }}>
                  <FileText size={14} />
                  <span>Attached File: <strong>{attachedFileName}</strong> (1.92 MB)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Link to="/dashboard" className="btn btn-primary">
                Return to Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitResponse}>
            <div className="form-group">
              <label className="form-label">Response Text / Clarification Message *</label>
              <textarea
                className="form-textarea"
                rows={4}
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attach Revised Document (PDF) *</label>
              <div
                style={{
                  border: '2px dashed #3b82f6',
                  borderRadius: '6px',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#eff6ff',
                }}
              >
                <Upload size={24} color="#1d4ed8" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e3a8a' }}>
                  {attachedFileName}
                </div>
                <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px' }}>
                  1.92 MB • PDF Process Flow Revision Ready
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ padding: '10px 24px' }}
              >
                <Send size={14} /> Submit Official Query Response
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
