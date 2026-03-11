import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, bgColor, trend, trendLabel, loading }) => (
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
    border: '1px solid #E5E7EB',
    display: 'flex', flexDirection: 'column', gap: '0.875rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.1)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
          {title}
        </p>
        {loading ? (
          <div style={{ height: '2rem', width: '4rem', background: '#F3F4F6', borderRadius: '6px', animation: 'pulse 1.5s ease infinite' }} />
        ) : (
          <p style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{value}</p>
        )}
      </div>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
    </div>
    {trendLabel && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: trend >= 0 ? '#10B981' : '#EF4444',
          background: trend >= 0 ? '#ECFDF5' : '#FEF2F2',
          padding: '0.15rem 0.5rem', borderRadius: '9999px',
        }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
        <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>{trendLabel}</span>
      </div>
    )}
  </div>
);

export default StatCard;
