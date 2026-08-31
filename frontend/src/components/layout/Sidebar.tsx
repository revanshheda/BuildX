// 'use client' removed — Vite is always client-side
// next/link → react-router-dom Link (href → to)
// next/navigation usePathname → react-router-dom useLocation

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import {
  LayoutDashboard,
  Building2,
  Cpu,
  MapPin,
  FileText,
  FolderLock,
  Gift,
  Inbox,
  BarChart3,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { currentPersona, application, queries } = useAppStore();

  const isEntrepreneur = currentPersona.role === 'ENTREPRENEUR';

  const openQueryCount = queries.filter((q) => q.status === 'OPEN').length;

  const entrepreneurLinks = [
    { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { href: '/business-profile', label: 'Business Profile', icon: Building2 },
    { href: '/intelligence', label: 'Approval Intelligence', icon: Cpu },
    { href: '/roadmap', label: 'My Roadmap', icon: MapPin },
    {
      href: `/application/${application.id}`,
      label: 'FSSAI Application',
      icon: FileText,
      badge: application.status !== 'DRAFT' ? application.status : undefined,
    },
    { href: '/vault', label: 'Document Vault', icon: FolderLock },
    ...(queries.length > 0
      ? [
          {
            href: `/query/${queries[0].id}`,
            label: 'Government Queries',
            icon: HelpCircle,
            badge: openQueryCount > 0 ? `${openQueryCount} Open` : undefined,
          },
        ]
      : []),
    { href: '/incentives', label: 'Incentives & Schemes', icon: Gift, badge: '4 Matches' },
  ];

  const officerLinks = [
    { href: '/government/dashboard', label: 'Officer Dashboard', icon: LayoutDashboard },
    {
      href: '/government/applications',
      label: 'Application Queue',
      icon: Inbox,
      badge: application.status === 'SUBMITTED' ? '1 New' : undefined,
    },
    {
      href: `/government/applications/${application.id}`,
      label: 'Active Dossier Review',
      icon: FileText,
      badge: application.status,
    },
    { href: '/government/analytics', label: 'Process Analytics', icon: BarChart3 },
  ];

  const links = isEntrepreneur ? entrepreneurLinks : officerLinks;

  return (
    <aside
      style={{
        width: '240px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isEntrepreneur ? 'Applicant Menu' : 'Scrutiny Officer Workspace'}
        </div>
      </div>

      <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              to={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#1d4ed8' : '#334155',
                background: isActive ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? '#1d4ed8' : '#64748b'} />
                <span>{link.label}</span>
              </div>
              {link.badge && (
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isActive ? '#dbeafe' : '#f1f5f9',
                    color: isActive ? '#1d4ed8' : '#475569',
                  }}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Hero Badge at Bottom of Sidebar */}
      <div style={{ padding: '16px', margin: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>
          {isEntrepreneur ? 'Demo Entity' : 'Jurisdiction'}
        </div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
          {isEntrepreneur ? 'FreshChain Cold Logistics' : 'Pune Industrial Zone'}
        </div>
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          {isEntrepreneur ? 'MIDC Chakan (Cold Chain)' : 'FSSAI / MIDC Unit'}
        </div>
      </div>
    </aside>
  );
};
