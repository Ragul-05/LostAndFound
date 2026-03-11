import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getAllItems, getItemStats, reportFoundItem, claimItem, dispatchItem } from '../services/itemService';
import { getAllUsers, updateUser, deleteUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import SearchFilterBar from '../components/ui/SearchFilterBar';
import {
  Package, AlertTriangle, CheckCircle, Send,
  Users, RefreshCw, BarChart2, PieChart as PieIcon,
  Pencil, Trash2, X, ShieldCheck, ShieldOff, Save
} from 'lucide-react';

const PIE_COLORS = ['#EF4444', '#10B981', '#1E3A8A', '#0D9488'];

/* ─── Edit User Modal ─────────────────────────────────────────────────────── */
const EditUserModal = ({ user: target, onClose, onSaved }) => {
  const [form, setForm]       = useState({ email: target.email, password: '', role: target.role });
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const tid = toast.loading('Saving changes...');
    try {
      const payload = {};
      if (form.email    !== target.email) payload.email    = form.email;
      if (form.password)                   payload.password = form.password;
      if (form.role     !== target.role)  payload.role     = form.role;
      if (Object.keys(payload).length === 0) { toast.dismiss(tid); onClose(); return; }
      await updateUser(target.id, payload);
      toast.success('User updated!', { id: tid });
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Update failed', { id: tid });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.65rem 0.875rem', background: '#F9FAFB',
    border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827',
    fontSize: '0.875rem', outline: 'none', fontFamily: 'Inter,sans-serif',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#1E3A8A,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 800 }}>
              {target.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#111827' }}>Edit User</div>
              <div style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>@{target.username}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}><X size={18} /></button>
        </div>
        {/* body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Email Address</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#1E3A8A'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>New Password <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(leave blank to keep current)</span></label>
            <input type="password" value={form.password} placeholder="••••••••" onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#1E3A8A'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Role</label>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {['USER', 'ADMIN'].map(r => (
                <button key={r} type="button" onClick={() => setForm(f => ({ ...f, role: r }))} style={{
                  flex: 1, padding: '0.6rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.15s', border: 'none',
                  background: form.role === r ? (r === 'ADMIN' ? '#FEF3C7' : '#EFF6FF') : '#F9FAFB',
                  color: form.role === r ? (r === 'ADMIN' ? '#D97706' : '#1D4ED8') : '#9CA3AF',
                  boxShadow: form.role === r ? '0 0 0 2px ' + (r === 'ADMIN' ? '#FDE68A' : '#BFDBFE') : 'none',
                }}>
                  {r === 'ADMIN' ? <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px' }} /> : <ShieldOff size={13} style={{ display: 'inline', marginRight: '4px' }} />}
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* footer */}
        <div style={{ display: 'flex', gap: '0.625rem', padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.65rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.65rem', background: saving ? '#93a3b8' : '#1E3A8A', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Modal ────────────────────────────────────────────────── */
const DeleteConfirmModal = ({ user: target, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const tid = toast.loading('Deleting user...');
    try {
      await deleteUser(target.id);
      toast.success(`User "${target.username}" deleted`, { id: tid });
      onDeleted();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Delete failed', { id: tid });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ height: '4px', background: '#EF4444' }} />
        <div style={{ padding: '1.75rem 1.5rem', textAlign: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Trash2 size={24} color="#EF4444" />
          </div>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: '0.5rem' }}>Delete User</h3>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            Are you sure you want to delete <strong style={{ color: '#111827' }}>@{target.username}</strong>?
          </p>
          <p style={{ color: '#EF4444', fontSize: '0.78rem' }}>This action cannot be undone.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', padding: '0 1.5rem 1.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ flex: 1, padding: '0.7rem', background: deleting ? '#FCA5A5' : '#EF4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            <Trash2 size={13} /> {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Dashboard ──────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [items, setItems]           = useState([]);
  const [users, setUsers]           = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [busyId, setBusyId]         = useState(null);
  const [search, setSearch]         = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeTab, setActiveTab]   = useState('items');
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'ADMIN') navigate('/');
  }, [isAuthenticated, user, navigate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsData, statsData, usersData] = await Promise.all([
        getAllItems(), getItemStats(), getAllUsers()
      ]);
      setItems(itemsData);
      setStats(statsData);
      setUsers(usersData);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleItemAction = async (action, itemId, label) => {
    setBusyId(itemId);
    const tid = toast.loading(`${label}...`);
    try {
      await action(itemId);
      toast.success(`${label} successful`, { id: tid });
      await fetchAll();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Action failed', { id: tid });
    } finally {
      setBusyId(null);
    }
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') return null;

  const barData = [
    { name: 'Lost',       value: stats?.lost ?? 0,       fill: '#EF4444' },
    { name: 'Found',      value: stats?.found ?? 0,      fill: '#10B981' },
    { name: 'Claimed',    value: stats?.claimed ?? 0,    fill: '#1E3A8A' },
    { name: 'Dispatched', value: stats?.dispatched ?? 0, fill: '#0D9488' },
  ];
  const pieData = barData.filter(d => d.value > 0);

  const filteredItems = items.filter(item => {
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const q = search.toLowerCase();
    return matchStatus && (!q || item.itemName?.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q) || item.reportedByUsername?.toLowerCase().includes(q));
  });

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const q = userSearch.toLowerCase();
    return matchRole && (!q || u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  });

  const ITEM_COLUMNS = [
    { key: 'id',                  label: '#',           sortable: true, nowrap: true, render: v => <span style={{ color: '#9CA3AF', fontWeight: 600 }}>#{v}</span> },
    { key: 'itemName',            label: 'Item',        sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 700, color: '#111827' }}>{v}</div>
        <div style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.description}</div>
      </div>
    )},
    { key: 'status',   label: 'Status',      sortable: true },
    { key: 'location', label: 'Location',    sortable: true, nowrap: true },
    { key: 'date',     label: 'Date',        sortable: true, nowrap: true },
    { key: 'reportedByUsername', label: 'Reporter', sortable: true, render: v => <span style={{ fontWeight: 600, color: '#1E3A8A' }}>{v}</span> },
  ];

  const USER_COLUMNS = [
    { key: 'id',       label: '#',        sortable: true,  render: v => <span style={{ color: '#9CA3AF' }}>#{v}</span> },
    { key: 'username', label: 'Username', sortable: true,  render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#1E3A8A,#0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 800, flexShrink: 0 }}>
          {v?.[0]?.toUpperCase()}
        </div>
        <span style={{ fontWeight: 700, color: '#111827' }}>{v}</span>
      </div>
    )},
    { key: 'email',    label: 'Email',    sortable: true,  render: v => <span style={{ color: '#6B7280' }}>{v}</span> },
    { key: 'role',     label: 'Role',     sortable: true,  render: v => (
      <span style={{
        padding: '0.2rem 0.65rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700,
        background: v === 'ADMIN' ? '#FEF3C7' : '#EFF6FF',
        color:      v === 'ADMIN' ? '#D97706'  : '#1D4ED8',
        border:     v === 'ADMIN' ? '1px solid #FDE68A' : '1px solid #BFDBFE',
      }}>{v}</span>
    )},
  ];

  const tabStyle = (active) => ({
    padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600,
    fontSize: '0.825rem', cursor: 'pointer', transition: 'all 0.15s',
    background: active ? '#1E3A8A' : 'transparent',
    color:      active ? '#fff'    : '#6B7280',
    border:     active ? 'none'    : '1px solid #E5E7EB',
  });

  const actionBtn = (bg, color, icon, label, onClick, busy) => (
    <button disabled={busy} onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.35rem 0.625rem', borderRadius: '7px', fontSize: '0.72rem',
      fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer',
      border: 'none', background: bg, color, opacity: busy ? 0.6 : 1,
      fontFamily: 'Inter,sans-serif', transition: 'all 0.15s',
    }}>
      {icon}{busy ? '…' : label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">

      {/* Modals */}
      {editTarget   && <EditUserModal   user={editTarget}   onClose={() => setEditTarget(null)}   onSaved={fetchAll} />}
      {deleteTarget && <DeleteConfirmModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={fetchAll} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '9999px', color: '#D97706', fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            🛡 ADMIN CONTROL CENTER
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Admin Dashboard</h1>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: '0.25rem' }}>Monitor and manage all lost &amp; found reports</p>
        </div>
        <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#374151', fontSize: '0.825rem', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        <StatCard title="Total Items"  value={stats?.total ?? '—'}         icon={Package}       color="#1E3A8A" bgColor="#EFF6FF" loading={loading} />
        <StatCard title="Lost"         value={stats?.lost ?? '—'}           icon={AlertTriangle} color="#EF4444" bgColor="#FEF2F2" loading={loading} />
        <StatCard title="Found"        value={stats?.found ?? '—'}          icon={CheckCircle}   color="#10B981" bgColor="#ECFDF5" loading={loading} />
        <StatCard title="Dispatched"   value={stats?.dispatched ?? '—'}     icon={Send}          color="#0D9488" bgColor="#F0FDFA" loading={loading} />
        <StatCard title="Total Users"  value={loading ? '—' : users.length} icon={Users}         color="#F59E0B" bgColor="#FFFBEB" loading={loading} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart2 size={18} color="#1E3A8A" />
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.925rem' }}>Items by Status</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.825rem' }} cursor={{ fill: 'rgba(30,58,138,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>{barData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <PieIcon size={18} color="#0D9488" />
            <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.925rem' }}>Status Distribution</span>
          </div>
          {pieData.length === 0 ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '0.85rem' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={3}>
                  {pieData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '0.825rem' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.75rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button style={tabStyle(activeTab === 'items')} onClick={() => setActiveTab('items')}>📦 Items ({items.length})</button>
        <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>👥 Users ({users.length})</button>
      </div>

      {/* ── Items Tab ── */}
      {activeTab === 'items' && (
        <>
          <SearchFilterBar
            search={search} onSearch={setSearch}
            placeholder="Search by name, location, reporter..."
            filters={[{ key: 'status', value: statusFilter, onChange: setStatusFilter, options: [
              { value: 'ALL', label: 'All Statuses' }, { value: 'LOST', label: 'Lost' },
              { value: 'FOUND', label: 'Found' },      { value: 'CLAIMED', label: 'Claimed' },
              { value: 'DISPATCHED', label: 'Dispatched' },
            ]}]}
          />
          <DataTable
            columns={ITEM_COLUMNS} data={filteredItems} loading={loading}
            emptyMessage="No items match your filters"
            actions={(row) => {
              const busy = busyId === row.id;
              return (
                <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                  {row.status === 'LOST'      && actionBtn('#ECFDF5','#059669','✓ ','Found',    () => handleItemAction(reportFoundItem, row.id, 'Mark as Found'),   busy)}
                  {row.status === 'FOUND'     && actionBtn('#EFF6FF','#1D4ED8','📋 ','Claim',   () => handleItemAction(claimItem,       row.id, 'Mark as Claimed'), busy)}
                  {(row.status === 'FOUND' || row.status === 'CLAIMED') &&
                                                 actionBtn('#F0FDFA','#0F766E','🚀 ','Dispatch', () => handleItemAction(dispatchItem,    row.id, 'Dispatch'),         busy)}
                  {row.status === 'DISPATCHED' && <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontStyle: 'italic' }}>Done</span>}
                </div>
              );
            }}
          />
        </>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <>
          <SearchFilterBar
            search={userSearch} onSearch={setUserSearch}
            placeholder="Search by username or email..."
            filters={[{ key: 'role', value: roleFilter, onChange: setRoleFilter, options: [
              { value: 'ALL', label: 'All Roles' },
              { value: 'USER',  label: 'User' },
              { value: 'ADMIN', label: 'Admin' },
            ]}]}
          />
          <DataTable
            columns={USER_COLUMNS} data={filteredUsers} loading={loading}
            emptyMessage="No users found"
            actions={(row) => (
              <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditTarget(row)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.35rem 0.75rem', borderRadius: '7px', fontSize: '0.72rem',
                  fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: '#EFF6FF', color: '#1D4ED8', fontFamily: 'Inter,sans-serif',
                }}>
                  <Pencil size={11} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(row)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.35rem 0.75rem', borderRadius: '7px', fontSize: '0.72rem',
                  fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: '#FEF2F2', color: '#DC2626', fontFamily: 'Inter,sans-serif',
                }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            )}
          />
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
