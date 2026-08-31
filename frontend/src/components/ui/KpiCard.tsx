import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  badgeText?: string;
  badgeType?: 'blue' | 'green' | 'amber' | 'red' | 'neutral';
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  badgeText,
  badgeType = 'neutral',
  icon,
}) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          {label}
        </span>
        {icon && <div style={{ color: '#64748b' }}>{icon}</div>}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {badgeText && (
          <span className={`badge badge-${badgeType}`} style={{ fontSize: '10px' }}>
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
          {subtext}
        </div>
      )}
    </div>
  );
};
