import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchFilterBar = ({ search, onSearch, filters = [], placeholder = 'Search...', actions }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
    background: '#fff', padding: '0.875rem 1rem',
    borderRadius: '12px', border: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: '1rem',
  }}>
    {/* Search */}
    <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
      <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
      <input
        value={search}
        onChange={e => onSearch(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem',
          background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px',
          fontSize: '0.825rem', color: '#111827', outline: 'none', fontFamily: 'Inter, sans-serif',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#1E3A8A'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.08)'; }}
        onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
      />
    </div>

    {/* Filters */}
    {filters.map(f => (
      <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <Filter size={13} color="#9CA3AF" />
        <select
          value={f.value}
          onChange={e => f.onChange(e.target.value)}
          style={{
            padding: '0.5rem 2rem 0.5rem 0.75rem',
            background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px',
            fontSize: '0.825rem', color: '#374151', outline: 'none',
            fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            appearance: 'none', WebkitAppearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.625rem center',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#1E3A8A'}
          onBlur={e => e.target.style.borderColor = '#E5E7EB'}
        >
          {f.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    ))}

    {/* Right-side actions slot */}
    {actions && <div style={{ marginLeft: 'auto' }}>{actions}</div>}
  </div>
);

export default SearchFilterBar;
