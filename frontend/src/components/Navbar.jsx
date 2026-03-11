import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, ChevronDown, LogOut, User } from 'lucide-react';

const PAGE_TITLES = {
  '/':            { title: 'Home',         subtitle: 'Browse all lost & found items' },
  '/report':      { title: 'Report Item',  subtitle: 'Submit a new lost or found report' },
  '/my-reports':  { title: 'My Reports',   subtitle: 'Track your submitted reports' },
  '/admin':       { title: 'Admin Dashboard', subtitle: 'Manage all items and users' },
  '/login':       { title: 'Sign In',      subtitle: 'Welcome back' },
  '/register':    { title: 'Register',     subtitle: 'Create your account' },
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const page = PAGE_TITLES[location.pathname] || { title: 'Lost & Found', subtitle: '' };

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false); };

  return (
    <header style={{
      height: '72px',
      background: '#ffffff',
      borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center',
      padding: '0 1.75rem',
      gap: '1.5rem',
      position: 'sticky', top: 0, zIndex: 40,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{page.title}</h2>
        {page.subtitle && <p style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 400 }}>{page.subtitle}</p>}
      </div>

      {/* Search bar */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: '#9CA3AF', pointerEvents: 'none' }} />
        <input
          placeholder="Quick search..."
          style={{
            padding: '0.5rem 1rem 0.5rem 2.25rem',
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '0.825rem',
            color: '#111827',
            outline: 'none',
            width: '220px',
            fontFamily: 'Inter, sans-serif',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = '#1E3A8A'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* Notification bell */}
      <button style={{
        width: '40px', height: '40px', borderRadius: '10px',
        background: '#F9FAFB', border: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#6B7280', transition: 'all 0.2s', position: 'relative',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#EFF6FF'; e.currentTarget.style.color = '#1E3A8A'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.color = '#6B7280'; }}
      >
        <Bell size={17} />
        <span style={{
          position: 'absolute', top: '6px', right: '6px',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#EF4444', border: '2px solid #fff',
        }} />
      </button>

      {/* User avatar / dropdown */}
      {isAuthenticated ? (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 0.75rem 0.375rem 0.375rem',
            background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
            onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #1E3A8A, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 800, color: '#fff',
            }}>
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{user.username}</div>
              <div style={{
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
                color: user.role === 'ADMIN' ? '#F59E0B' : '#6B7280',
                textTransform: 'uppercase',
              }}>{user.role}</div>
            </div>
            <ChevronDown size={14} color="#9CA3AF" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              minWidth: '180px', overflow: 'hidden', zIndex: 100,
            }} className="animate-fade-in">
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{user.username}</div>
                <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={{
                width: '100%', padding: '0.625rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                background: 'transparent', color: '#EF4444',
                fontSize: '0.825rem', fontWeight: 600, transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            background: 'transparent', border: '1px solid #E5E7EB',
            color: '#374151', fontSize: '0.825rem', fontWeight: 600,
            transition: 'all 0.2s',
          }}>Sign In</button>
          <button onClick={() => navigate('/register')} style={{
            padding: '0.5rem 1rem', borderRadius: '8px',
            background: '#1E3A8A', color: '#fff',
            fontSize: '0.825rem', fontWeight: 600, transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(30,58,138,0.3)',
          }}>Register</button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
