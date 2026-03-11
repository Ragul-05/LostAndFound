import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { reportLostItem } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle2, MapPin, Calendar, FileText } from 'lucide-react';

const ReportItem = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [type, setType]     = useState('lost');
  const [loading, setLoading] = useState(false);
  const [form, setForm]     = useState({
    itemName: '', description: '', location: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => { if (!isAuthenticated) navigate('/login'); }, [isAuthenticated, navigate]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportLostItem({ ...form, type });
      toast.success('Report submitted successfully!');
      setTimeout(() => navigate('/my-reports'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  const isLost   = type === 'lost';
  const accent   = isLost ? '#EF4444' : '#10B981';
  const accentBg = isLost ? '#FEF2F2' : '#ECFDF5';

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', background: '#F9FAFB',
    border: '1px solid #E5E7EB', borderRadius: '10px',
    color: '#111827', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  const focusStyle = (e) => { e.target.style.borderColor = '#1E3A8A'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.08)'; };
  const blurStyle  = (e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; };
  const labelStyle = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} className="animate-fade-in">

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
          <FileText size={20} color="#1E3A8A" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Report an Item</h1>
        </div>
        <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Provide accurate details to help others identify the item</p>
      </div>

      {/* Card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {/* Top accent */}
        <div style={{ height: '4px', background: `linear-gradient(90deg, ${accent}, #1E3A8A)` }} />
        <div style={{ padding: '1.75rem' }}>

          {/* Type toggle */}
          <div style={{ display: 'flex', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '4px', marginBottom: '1.75rem', gap: '4px' }}>
            {[
              { id: 'lost',  icon: AlertCircle,    label: 'I Lost Something',  color: '#EF4444', bg: '#FEF2F2' },
              { id: 'found', icon: CheckCircle2,   label: 'I Found Something', color: '#10B981', bg: '#ECFDF5' },
            ].map(opt => {
              const active = type === opt.id;
              const Icon = opt.icon;
              return (
                <button key={opt.id} type="button" onClick={() => setType(opt.id)} style={{
                  flex: 1, padding: '0.7rem 1rem', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: active ? opt.bg : 'transparent',
                  color: active ? opt.color : '#9CA3AF',
                  boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                }}>
                  <Icon size={16} /> {opt.label}
                </button>
              );
            })}
          </div>

          {/* Status info bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.75rem 1rem', background: accentBg,
            border: `1px solid ${accent}30`, borderRadius: '10px', marginBottom: '1.5rem',
            fontSize: '0.825rem', color: accent,
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent }} />
            {isLost
              ? 'Filing as LOST — will appear in the lost items board immediately.'
              : 'Filing as FOUND — an admin can then link this to a lost item report.'}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Item Name <span style={{ color: accent }}>*</span></label>
              <input type="text" name="itemName" value={form.itemName} onChange={handleChange}
                placeholder="e.g. Black Wallet, Apple AirPods Pro..." required style={inputStyle}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description <span style={{ color: accent }}>*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe color, brand, size, unique features, serial number..." required rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
                onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <MapPin size={13} color="#1E3A8A" />
                    {isLost ? 'Last Seen Location' : 'Found Location'} <span style={{ color: accent }}>*</span>
                  </span>
                </label>
                <input type="text" name="location" value={form.location} onChange={handleChange}
                  placeholder="e.g. Library, Floor 2" required style={inputStyle}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar size={13} color="#0D9488" />
                    {isLost ? 'Date Lost' : 'Date Found'} <span style={{ color: accent }}>*</span>
                  </span>
                </label>
                <input type="date" name="date" value={form.date} onChange={handleChange}
                  required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Reporter info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem 1rem', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.8rem', color: '#6B7280' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #1E3A8A, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              Reporting as <strong style={{ color: '#111827' }}>{user?.username}</strong>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.875rem',
              background: loading ? '#93a3b8' : '#1E3A8A',
              color: '#fff', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(30,58,138,0.3)',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = loading ? '#93a3b8' : '#1E3A8A'; e.currentTarget.style.transform = 'none'; }}
            >
              {loading ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Submitting...</>
              ) : (
                <>{isLost ? '📤 Submit Lost Item Report' : '✅ Submit Found Item Report'}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportItem;
