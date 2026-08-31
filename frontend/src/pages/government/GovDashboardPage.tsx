

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function GovernmentDashboardPage() {
  const { application, currentPersona } = useAppStore();

  return (
    <div className="page-body">
      {/* Officer Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-green">SCRUTINY CELL (PUNE REGION)</span>
            <span className="badge badge-blue">OFFICER: {currentPersona.name}</span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
            Single-Window Scrutiny & Approval Desk
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Manage assigned industrial applications, raise formal queries, coordinate site verifications, and record final decisions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/government/analytics" className="btn btn-secondary">
            Process Analytics
          </Link>
          <Link to={`/government/applications/${application.id}`} className="btn btn-primary">
            Open Active Dossier <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Officer KPI Cards */}
      <div className="grid-4" style={{ marginBottom: '20px' }}>
        <KpiCard
          label="Assigned Queue"
          value="1"
          subtext="FreshChain Cold Logistics"
          badgeText="Active"
          badgeType="blue"
          icon={<Inbox size={18} />}
        />
        <KpiCard
          label="Pending Query"
          value={application.status === 'QUERY_RAISED' ? '1' : '0'}
          subtext={application.status === 'QUERY_RAISED' ? 'Waiting for applicant' : 'No queries waiting'}
          badgeText={application.status === 'QUERY_RAISED' ? 'Pending' : 'Clear'}
          badgeType={application.status === 'QUERY_RAISED' ? 'amber' : 'green'}
          icon={<AlertTriangle size={18} />}
        />
        <KpiCard
          label="Inspection Status"
          value={application.status.includes('INSPECTION') ? 'Scheduled' : 'Pending'}
          subtext="Pune MIDC Chakan Phase II"
          badgeText="Site Visit"
          badgeType="neutral"
          icon={<Clock size={18} />}
        />
        <KpiCard
          label="SLA Compliance"
          value="100%"
          subtext="0 Breached Applications"
          badgeText="Within SLA"
          badgeType="green"
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Main Scrutiny Queue Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Pending Application Scrutiny Queue</div>
            <div className="card-subtitle">Showing active applications assigned to your scrutiny desk</div>
          </div>
          <span className="badge badge-neutral">1 APPLICATION</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Application No.</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Enterprise / Unit</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Approval Type</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Location</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1d4ed8' }}>
                  {application.appNumber}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>FreshChain Cold Logistics Pvt. Ltd.</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Cold Storage (5,000 MT)</div>
                </td>
                <td style={{ padding: '12px 14px', color: '#334155' }}>
                  FSSAI Central Licence
                </td>
                <td style={{ padding: '12px 14px', color: '#64748b' }}>
                  MIDC Chakan, Pune
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <StatusBadge status={application.status} />
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Link
                    href={`/government/applications/${application.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    Scrutinize <ArrowRight size={12} />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
