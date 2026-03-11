import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, FileText, LayoutDashboard, LogOut, Search, PlusCircle, Users
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',           icon: Home,            label: 'Home',         always: true },
  { to: '/report',     icon: PlusCircle,       label: 'Report Item',  authOnly: true },
  { to: '/my-reports', icon: FileText,         label: 'My Reports',   authOnly: true },
  { to: '/admin',      icon: LayoutDashboard,  label: 'Admin Panel',  adminOnly: true },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly) return isAuthenticated && user?.role === 'ADMIN';
    if (item.authOnly)  return isAuthenticated;
    return true;
  });

  return (
    <aside style={{
      width: collapsed ? '72px' : '240px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1E3A8A 0%, #1e3a8a 60%, #153069 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 50,
      transition: 'width 0.25s ease',
      boxShadow: '4px 0 20px rgba(30,58,138,0.25)',
      overflowY: 'auto',
      overflowX: 'hidden',
    }} className="sidebar-scroll">

      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.5rem 0' : '1.5rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '0.75rem',
        minHeight: '72px',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Search size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                Lost &amp; Found
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, letterSpacing: '0.06em' }}>
                ASSET SYSTEM
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Search size={18} color="#fff" />
          </div>
        )}
        <button onClick={onToggle} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none',
          borderRadius: '6px', padding: '4px 6px',
          color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', flexShrink: 0,
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            {collapsed
              ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              : <><polyline points="15 18 9 12 15 6"/></>}
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.625rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {!collapsed && (
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 0.625rem', marginBottom: '0.5rem' }}>
            Navigation
          </div>
        )}
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.75rem 0' : '0.65rem 0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '10px',
              background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.65)',
              fontWeight: active ? 700 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
              position: 'relative',
              textDecoration: 'none',
              borderLeft: active && !collapsed ? '3px solid #0D9488' : '3px solid transparent',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              title={collapsed ? label : ''}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + logout */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 0.625rem' }}>
        {isAuthenticated ? (
          <>
            {!collapsed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.75rem',
                background: 'rgba(255,255,255,0.08)', borderRadius: '10px', marginBottom: '0.5rem',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0D9488, #0891b2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {user.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.username}
                  </div>
                  <div style={{
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em',
                    color: user.role === 'ADMIN' ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                  }}>
                    {user.role}
                  </div>
                </div>
              </div>
            )}
            <button onClick={handleLogout} style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: '0.75rem', padding: collapsed ? '0.75rem 0' : '0.65rem 0.875rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '10px', background: 'transparent',
              color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#fca5a5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
              title={collapsed ? 'Sign out' : ''}
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              {!collapsed && 'Sign Out'}
            </button>
          </>
        ) : (
          <Link to="/login" style={{
            display: 'flex', alignItems: 'center',
            gap: '0.75rem', padding: collapsed ? '0.75rem 0' : '0.65rem 0.875rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: '10px', background: 'rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.875rem', fontWeight: 600,
            textDecoration: 'none', transition: 'background 0.15s',
          }}>
            <Users size={18} />
            {!collapsed && 'Sign In'}
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
