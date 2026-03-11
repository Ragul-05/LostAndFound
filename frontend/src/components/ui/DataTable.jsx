import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import StatusBadge from './StatusBadge';

const DataTable = ({ columns, data, loading, emptyMessage = 'No data found', actions }) => {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortCol === col.key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col.key);
      setSortDir('asc');
    }
  };

  const sorted = [...(data || [])].sort((a, b) => {
    if (!sortCol) return 0;
    const av = a[sortCol] ?? '';
    const bv = b[sortCol] ?? '';
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {columns.map(col => (
                <th key={col.key} onClick={() => handleSort(col)}
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'left',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                    cursor: col.sortable ? 'pointer' : 'default',
                    transition: 'background 0.15s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {col.label}
                    {col.sortable && (
                      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                        <ChevronUp size={10} color={sortCol === col.key && sortDir === 'asc' ? '#1E3A8A' : '#D1D5DB'} />
                        <ChevronDown size={10} color={sortCol === col.key && sortDir === 'desc' ? '#1E3A8A' : '#D1D5DB'} />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th style={{ padding: '0.875rem 1rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '1rem' }}>
                      <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s ease infinite' }} />
                    </td>
                  ))}
                  {actions && <td style={{ padding: '1rem' }}><div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', width: '60px', marginLeft: 'auto', animation: 'pulse 1.5s ease infinite' }} /></td>}
                </tr>
              ))
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr key={row.id ?? idx}
                  style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {columns.map(col => (
                    <td key={col.key} style={{ padding: '0.875rem 1rem', color: '#374151', maxWidth: col.maxWidth || 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: col.nowrap ? 'nowrap' : 'normal' }}>
                      {col.render ? col.render(row[col.key], row) : (
                        col.key === 'status' ? <StatusBadge status={row[col.key]} /> : String(row[col.key] ?? '—')
                      )}
                    </td>
                  ))}
                  {actions && (
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      {!loading && sorted.length > 0 && (
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #F3F4F6', fontSize: '0.75rem', color: '#9CA3AF', background: '#F9FAFB' }}>
          Showing {sorted.length} record{sorted.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default DataTable;
