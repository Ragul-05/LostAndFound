import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllItems } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/ui/StatusBadge';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import { MapPin, Calendar, User, PlusCircle, Package } from 'lucide-react';

const FILTERS = [
  { value: 'ALL',       label: 'All Items' },
  { value: 'LOST',      label: 'Lost' },
  { value: 'FOUND',     label: 'Found' },
  { value: 'CLAIMED',   label: 'Claimed' },
  { value: 'DISPATCHED',label: 'Dispatched' },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchItems = async () => {
    setLoading(true); setError('');
    try { setItems(await getAllItems()); }
    catch { setError('Could not connect to server. Make sure the backend is running.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const filtered = items.filter(item => {
    const matchFilter = filter === 'ALL' || item.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || item.itemName?.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #1e40af 50%, #0D9488 100%)',
        borderRadius: '16px', padding: '2.5rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem',
        boxShadow: '0 4px 24px rgba(30,58,138,0.25)',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', background: 'rgba(255,255,255,0.15)', borderRadius: '9999px', color: '#fff', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '1rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            AI-POWERED ASSET LIFECYCLE
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.75rem', lineHeight: 1.15 }}>
            Lost &amp; Found<br/>Management System
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', maxWidth: '420px', lineHeight: 1.7 }}>
            Report, track, and recover lost items with ease. Browse the board below or submit a new report.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isAuthenticated ? (
            <button onClick={() => navigate('/report')} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', background: '#fff', color: '#1E3A8A',
              borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
            >
              <PlusCircle size={18} /> Report an Item
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} style={{ padding: '0.65rem 1.25rem', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.3)', transition: 'background 0.2s' }}>Sign In</button>
              <button onClick={() => navigate('/register')} style={{ padding: '0.65rem 1.25rem', background: '#fff', color: '#1E3A8A', borderRadius: '10px', fontWeight: 700, fontSize: '0.875rem', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>Get Started</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {[['Total', items.length], ['Lost', items.filter(i=>i.status==='LOST').length], ['Found', items.filter(i=>i.status==='FOUND').length]].map(([label, val]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff' }}>{loading ? '—' : val}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by item name or location..."
        filters={[{
          key: 'status', value: filter, onChange: setFilter,
          options: FILTERS,
        }]}
        actions={
          <button onClick={fetchItems} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.875rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, color: '#6B7280', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
        }
      />

      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>Recent Reports</h2>
          <p style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '2px' }}>{loading ? 'Loading...' : `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#DC2626', fontSize: '0.875rem' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '1.5rem', height: '180px' }}>
              <div style={{ height: '14px', background: '#F3F4F6', borderRadius: '4px', width: '35%', marginBottom: '1rem', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ height: '18px', background: '#F3F4F6', borderRadius: '4px', width: '65%', marginBottom: '0.75rem', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ height: '12px', background: '#F3F4F6', borderRadius: '4px', marginBottom: '0.5rem', animation: 'pulse 1.5s ease infinite' }} />
              <div style={{ height: '12px', background: '#F3F4F6', borderRadius: '4px', width: '55%', animation: 'pulse 1.5s ease infinite' }} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <Package size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.5rem' }}>No items found</p>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>Try a different search or filter.</p>
          {isAuthenticated && (
            <button onClick={() => navigate('/report')} style={{ marginTop: '1.25rem', padding: '0.65rem 1.5rem', background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(30,58,138,0.3)' }}>
              Report an Item
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px',
              overflow: 'hidden', transition: 'all 0.2s', cursor: 'default',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              {/* Card top accent */}
              <div style={{ height: '4px', background: item.status === 'LOST' ? '#EF4444' : item.status === 'FOUND' ? '#10B981' : item.status === 'CLAIMED' ? '#1E3A8A' : '#0D9488' }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <StatusBadge status={item.status} />
                  <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600 }}>#{item.id}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#111827', fontSize: '1rem', marginBottom: '0.375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.itemName}</h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>{item.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#6B7280' }}>
                    <MapPin size={13} color="#1E3A8A" style={{ flexShrink: 0 }} />{item.location}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#6B7280' }}>
                    <Calendar size={13} color="#0D9488" style={{ flexShrink: 0 }} />{item.date}
                  </div>
                </div>
              </div>
              <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #F3F4F6', background: '#F9FAFB', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                <User size={12} /> Reported by <span style={{ fontWeight: 700, color: '#374151' }}>{item.reportedByUsername}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
