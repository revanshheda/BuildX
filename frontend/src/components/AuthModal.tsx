import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { Building2, ShieldCheck, ArrowRight, CheckCircle2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'ENTREPRENEUR' | 'OFFICER';
}

export default function AuthModal({ isOpen, onClose, initialRole = 'ENTREPRENEUR' }: AuthModalProps) {
  const navigate = useNavigate();
  const { setPersona, business } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<'ENTREPRENEUR' | 'OFFICER' | null>(null);

  if (!isOpen) return null;

  const role = selectedRole ?? initialRole;

  const handleEnterEntrepreneur = (destination: '/dashboard' | '/business-profile' = '/dashboard') => {
    setPersona('persona_entrepreneur');
    onClose();
    navigate(destination);
  };

  const handleEnterOfficer = () => {
    setPersona('persona_officer');
    onClose();
    navigate('/government/dashboard');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        backgroundColor: 'rgba(7, 26, 51, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 40px rgba(7, 26, 51, 0.25)',
          border: '1px solid #d5dee8',
          overflow: 'hidden',
          animation: 'scaleUp 0.2s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            background: '#071A33',
            color: '#ffffff',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                background: '#F28C00',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              BX
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.2px' }}>
                BuildX Single-Window Access
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Government of Maharashtra
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Toggle Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#f1f5f9',
            padding: '4px',
            margin: '16px 24px 0',
            borderRadius: '8px',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setSelectedRole('ENTREPRENEUR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: role === 'ENTREPRENEUR' ? '#ffffff' : 'transparent',
              color: role === 'ENTREPRENEUR' ? '#071A33' : '#64748b',
              boxShadow: role === 'ENTREPRENEUR' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <Building2 size={15} color={role === 'ENTREPRENEUR' ? '#F28C00' : '#94a3b8'} />
            Entrepreneur
          </button>
          <button
            onClick={() => setSelectedRole('OFFICER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: role === 'OFFICER' ? '#ffffff' : 'transparent',
              color: role === 'OFFICER' ? '#071A33' : '#64748b',
              boxShadow: role === 'OFFICER' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            <ShieldCheck size={15} color={role === 'OFFICER' ? '#15803d' : '#94a3b8'} />
            Government Officer
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {role === 'ENTREPRENEUR' ? (
            <div>
              {/* Profile Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    VM
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Vikram Malhotra
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Director · {business.name}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#15803d" />
                    <span><strong>Location:</strong> Plot E-45, MIDC Chakan Phase II, Pune</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#15803d" />
                    <span><strong>Sector:</strong> Logistics / Cold Chain (5,000 MT capacity)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#15803d" />
                    <span><strong>Hero Application:</strong> FSSAI Central License (APP-MH-2026-00124)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => handleEnterEntrepreneur('/dashboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 18px',
                    background: '#071A33',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = '#0d2545')}
                  onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = '#071A33')}
                >
                  Enter Entrepreneur Dashboard <ArrowRight size={15} />
                </button>

                <button
                  onClick={() => handleEnterEntrepreneur('/business-profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px 18px',
                    background: '#ffffff',
                    color: '#071A33',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  View / Edit Business Profile
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Officer Profile Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: '#f0fdf4',
                      color: '#15803d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    RK
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Rajesh Kumar
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Designated Officer & Central Licensing Authority
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#15803d" />
                    <span><strong>Jurisdiction:</strong> Food Safety & Standards Authority (Western Region)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#15803d" />
                    <span><strong>Active Queue:</strong> 1 Application Pending Review, 1 Query Response</span>
                  </div>
                </div>
              </div>

              {/* Officer Action Button */}
              <button
                onClick={handleEnterOfficer}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px 18px',
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = '#166534')}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = '#15803d')}
              >
                Enter Government Scrutiny Portal <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
