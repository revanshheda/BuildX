

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ArrowRight } from 'lucide-react';

export default function GovernmentApplicationsQueuePage() {
  const { application, business, queries, currentPersona } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const openQueries = queries.filter((q) => q.status === 'OPEN');
  const hasResponse = queries.some((q) => q.status === 'RESPONDED');

  const applicationsList = [
    {
      id: application.id,
      appNumber: application.appNumber,
      businessName: business.name,
      tradeName: business.tradeName,
      sector: business.sector,
      subSector: business.subSector,
      location: `${business.district}, ${business.state} (${business.locationType})`,
      approvalName: application.approvalName,
      department: application.department,
      status: application.status,
      submittedAt: application.submittedAt || '2026-08-28T09:00:00Z',
      hasOpenQuery: openQueries.length > 0,
      hasResponse,
    },
  ];

  const filteredApps =
    statusFilter === 'ALL'
      ? applicationsList
      : applicationsList.filter((app) => app.status === statusFilter);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-green">SCRUTINY CELL (PUNE REGION)</span>
            <span className="badge badge-blue">OFFICER: {currentPersona.name}</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            Government Application Queue
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Incoming single-window applications requiring document verification, query resolution, and regulatory scrutiny.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/government/dashboard" className="btn btn-secondary">
            Officer Dashboard
          </Link>
          <Link to={`/government/applications/${application.id}`} className="btn btn-primary">
            Open Hero Dossier <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Applications ({applicationsList.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('SUBMITTED')}
              className={`btn btn-sm ${statusFilter === 'SUBMITTED' ? 'btn-primary' : 'btn-secondary'}`}
            >
              New Submissions
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('QUERY_RAISED')}
              className={`btn btn-sm ${statusFilter === 'QUERY_RAISED' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Awaiting Applicant
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('QUERY_RESPONDED')}
              className={`btn btn-sm ${statusFilter === 'QUERY_RESPONDED' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Responses Available
            </button>
          </div>

          <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
            Jurisdiction: Maharashtra / Pune MIDC
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Assigned Scrutiny Queue</div>
            <div className="card-subtitle">Showing active dossiers awaiting action</div>
          </div>
          <span className="badge badge-neutral">{filteredApps.length} DOSSIER</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Application ID</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Enterprise / Unit</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Clearance Requested</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Location</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px', fontWeight: '700', color: '#1d4ed8' }}>
                    {app.appNumber}
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'normal' }}>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '700', color: '#0f172a' }}>{app.businessName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{app.subSector} (5,000 MT)</div>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: '600', color: '#334155' }}>FSSAI Central Licence</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Western Region Authority</div>
                  </td>
                  <td style={{ padding: '14px', color: '#475569' }}>
                    {app.location}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <StatusBadge status={app.status} />
                    {app.status === 'QUERY_RESPONDED' && (
                      <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '700', marginTop: '2px' }}>
                        ● New response attached
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <Link
                      href={`/government/applications/${app.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      {app.status === 'QUERY_RESPONDED' ? 'Review Response' : 'Scrutinize Dossier'} <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
