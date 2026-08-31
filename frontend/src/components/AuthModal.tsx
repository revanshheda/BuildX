import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/lib/use-app-store';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Building2, ShieldCheck, ArrowRight, CheckCircle2, X, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'ENTREPRENEUR' | 'OFFICER';
}

export default function AuthModal({ isOpen, onClose, initialRole = 'ENTREPRENEUR' }: AuthModalProps) {
  const navigate = useNavigate();
  const { setPersona, business } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<'ENTREPRENEUR' | 'OFFICER' | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setAuthError(null);

      if (!isSupabaseConfigured()) {
        throw new Error(
          'Supabase credentials are not yet configured in frontend/.env.local.'
        );
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setLoadingGoogle(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initiate Google authentication.';
      setAuthError(message);
      setLoadingGoogle(false);
    }
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
          {authError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#b91c1c',
                fontSize: '12px',
                marginBottom: '16px',
                lineHeight: '1.4',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{authError}</div>
            </div>
          )}

          {role === 'ENTREPRENEUR' ? (
            <div>
              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '11px 16px',
                  background: '#ffffff',
                  color: '#1f2937',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: loadingGoogle ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  marginBottom: '14px',
                  transition: 'all 0.15s',
                  opacity: loadingGoogle ? 0.7 : 1,
                }}
                onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = '#f8fafc')}
                onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = '#ffffff')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{loadingGoogle ? 'Connecting to Google OAuth...' : 'Continue with Google'}</span>
              </button>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '12px 0 16px',
                  color: '#94a3b8',
                  fontSize: '12px',
                }}
              >
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span>or explore with demo entity</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {/* Profile Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '13px',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    VM
                  </div>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                      Vikram Malhotra
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Director · {business.name}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#15803d" />
                    <span><strong>Location:</strong> Plot E-45, MIDC Chakan Phase II, Pune</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} color="#15803d" />
                    <span><strong>Sector:</strong> Logistics / Cold Chain (5,000 MT)</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleEnterEntrepreneur('/dashboard')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '11px 16px',
                    background: '#071A33',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseOver={(e) => ((e.currentTarget as HTMLElement).style.background = '#0d2545')}
                  onMouseOut={(e) => ((e.currentTarget as HTMLElement).style.background = '#071A33')}
                >
                  Enter Entrepreneur Dashboard <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => handleEnterEntrepreneur('/business-profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '9px 16px',
                    background: '#ffffff',
                    color: '#071A33',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '12.5px',
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
                      Designated Officer &amp; Central Licensing Authority
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={13} color="#15803d" />
                    <span><strong>Jurisdiction:</strong> Food Safety &amp; Standards Authority (Western Region)</span>
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
