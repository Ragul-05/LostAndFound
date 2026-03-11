import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUserItems, reportFoundItem } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/ui/DataTable';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import StatusBadge from '../components/ui/StatusBadge';
import { PlusCircle, RefreshCw, FileText, MapPin, Calendar } from 'lucide-react';

const MyReports = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const fetchMyItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try { setItems(await getUserItems(user.username)); }
    catch { toast.error('Could not load your reports.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchMyItems(); }, [fetchMyItems]);

  const handleMarkFound = async (id) => {
    setMarkingId(id);
    const tid = toast.loading('Marking as found...');
    try {
      await reportFoundItem(id);
      toast.success('Item marked as found!', { id: tid });
      await fetchMyItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update.', { id: tid });
    } finally {
      setMarkingId(null);
    }
  };

  if (!isAuthenticated) return null;

  const filtered = items.filter(item => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.toLowerCase();
    return matchStatus && (!q || item.itemName?.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q));
  });

  const COLUMNS = [
    { key: 'id',       label: '#',        sortable: true, nowrap: true, render: v => <span style={{ color: '#9CA3AF', fontWeight: 600 }}>#{v}</span> },
    { key: 'itemName', label: 'Item',     sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 700, color: '#111827' }}>{v}</div>
        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</div>
      </div>
    )},
    { key: 'status',   label: 'Status',   sortable: true },
    { key: 'location', label: 'Location', sortable: true, nowrap: true, render: v => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><MapPin size={12} color="#1E3A8A" />{v}</span>
    )},
    { key: 'date',     label: 'Date',     sortable: true, nowrap: true, render: v => (
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={12} color="#0D9488" />{v}</span>
    )},
  ];

  const stats = { total: items.length, lost: items.filter(i=>i.status==='LOST').length, found: items.filter(i=>i.status==='FOUND').length, dispatched: items.filter(i=>i.status==='DISPATCHED').length };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
            <FileText size={20} color="#1E3A8A" />
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>My Reports</h1>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Items reported by <span style={{ color: '#1E3A8A', fontWeight: 700 }}>{user?.username}</span></p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={fetchMyItems} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#374151', fontSize: '0.825rem', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
          </button>
          <button onClick={() => navigate('/report')} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '0.825rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(30,58,138,0.3)' }}>
            <PlusCircle size={15} /> New Report
          </button>
        </div>
      </div>

      {/* Mini stats */}
      {!loading && items.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[['Total', stats.total, '#1E3A8A', '#EFF6FF'], ['Lost', stats.lost, '#EF4444', '#FEF2F2'], ['Found', stats.found, '#10B981', '#ECFDF5'], ['Dispatched', stats.dispatched, '#0D9488', '#F0FDFA']].map(([label, val, color, bg]) => (
            <div key={label} style={{ padding: '0.625rem 1.25rem', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
              <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search / Filter */}
      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search by name or location..."
        filters={[{
          key: 'status', value: statusFilter, onChange: setStatusFilter,
          options: [
            { value: 'ALL', label: 'All Statuses' },
            { value: 'LOST', label: 'Lost' },
            { value: 'FOUND', label: 'Found' },
            { value: 'CLAIMED', label: 'Claimed' },
            { value: 'DISPATCHED', label: 'Dispatched' },
          ]
        }]}
      />

      {/* Table */}
      {items.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <FileText size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#6B7280', marginBottom: '0.5rem' }}>No reports yet</p>
          <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1.25rem' }}>You haven't submitted any reports.</p>
          <button onClick={() => navigate('/report')} style={{ padding: '0.65rem 1.5rem', background: '#1E3A8A', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(30,58,138,0.3)' }}>
            Submit Your First Report
          </button>
        </div>
      ) : (
        <DataTable
          columns={COLUMNS}
          data={filtered}
          loading={loading}
          emptyMessage="No items match your filters"
          actions={(row) => {
            if (row.status !== 'LOST') return <StatusBadge status={row.status} />;
            const busy = markingId === row.id;
            return (
              <button disabled={busy} onClick={() => handleMarkFound(row.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.35rem 0.75rem', borderRadius: '7px', fontSize: '0.72rem',
                fontWeight: 700, background: '#ECFDF5', color: '#059669',
                border: 'none', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1,
              }}>
                {busy
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  : '✓'} Mark Found
              </button>
            );
          }}
        />
      )}
    </div>
  );
};

export default MyReports;
