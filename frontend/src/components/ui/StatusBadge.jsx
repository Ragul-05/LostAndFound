import React from 'react';

const STATUS_STYLES = {
  LOST:       { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', dot: '#EF4444' },
  FOUND:      { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', dot: '#10B981' },
  CLAIMED:    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' },
  DISPATCHED: { bg: '#F0FDFA', color: '#0F766E', border: '#99F6E4', dot: '#0D9488' },
};

const StatusBadge = ({ status, size = 'sm' }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.LOST;
  const pad = size === 'lg' ? '0.35rem 0.9rem' : '0.2rem 0.65rem';
  const fs  = size === 'lg' ? '0.78rem' : '0.68rem';

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      padding: pad, borderRadius: '9999px',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: fs, fontWeight: 700, letterSpacing: '0.06em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

export default StatusBadge;
