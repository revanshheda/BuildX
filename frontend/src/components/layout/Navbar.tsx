// 'use client' removed — Vite is always client-side
// next/link → react-router-dom Link (href → to)
// next/navigation usePathname → react-router-dom useLocation

import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { DEMO_PERSONAS } from '@/lib/data/hero-data';
import { UserCheck, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPersona, setPersona, notifications, resetDemoData, business } = useAppStore();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  void unreadCount; // referenced in future notification bell if needed

  return (
    <header>
      {/* Official Government Header Banner */}
      <div className="gov-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>GOVERNMENT OF MAHARASHTRA • INDUSTRY &amp; SINGLE WINDOW CLEARANCE PORTAL</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>SIH 26130 PROTOTYPE</span>
          <span>LOCATION: PUNE (MIDC CHAKAN)</span>
        </div>
      </div>

      {/* Main App Navbar */}
      <div className="main-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '6px',
                background: '#1d4ed8',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '16px',
              }}
            >
              BX
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.2px', color: '#0f172a' }}>
                BuildX
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '-2px' }}>
                Intelligent Approval &amp; Compliance Platform
              </div>
            </div>
          </Link>

          {/* Persona Mode Indicator */}
          <div
            style={{
              marginLeft: '12px',
              paddingLeft: '16px',
              borderLeft: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span
              className={`badge ${currentPersona.role === 'ENTREPRENEUR' ? 'badge-blue' : 'badge-green'}`}
              style={{ fontSize: '10px' }}
            >
              {currentPersona.role === 'ENTREPRENEUR' ? 'Entrepreneur Workspace' : 'Government Officer Portal'}
            </span>
          </div>
        </div>

        {/* Right Action & Persona Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Quick Persona Switcher for Hackathon Judges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f1f5f9',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          >
            <UserCheck size={14} color="#64748b" />
            <span style={{ color: '#475569', fontWeight: '500' }}>Active Persona:</span>
            <select
              value={currentPersona.id}
              onChange={(e) => setPersona(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '12px',
                padding: '2px 6px',
                fontWeight: '600',
                color: '#0f172a',
                cursor: 'pointer',
              }}
            >
              {DEMO_PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.role === 'ENTREPRENEUR' ? '🏢 ' : '🏛️ '}
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Demo State Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            <button
              onClick={() => resetDemoData('APPROVED')}
              title="Reset state to Verified Stage 5/6 Approved Hero State (APR-MH-2026-00124)"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', color: '#15803d', padding: '4px 8px', fontWeight: '600' }}
            >
              <RefreshCw size={11} />
              Reset: Approved State
            </button>
            <button
              onClick={() => resetDemoData('DRAFT')}
              title="Reset state to Stage 3 Draft to replay submission & scrutiny journey"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', color: '#64748b', padding: '4px 8px' }}
            >
              Draft Replay
            </button>
          </div>

          {/* Active Business/Officer Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingLeft: '10px',
              borderLeft: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: currentPersona.role === 'ENTREPRENEUR' ? '#eff6ff' : '#f0fdf4',
                color: currentPersona.role === 'ENTREPRENEUR' ? '#1d4ed8' : '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              {currentPersona.avatarText}
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
              <div style={{ fontWeight: '600', color: '#0f172a' }}>{currentPersona.name}</div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                {currentPersona.role === 'ENTREPRENEUR' ? business.name : currentPersona.organization}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
