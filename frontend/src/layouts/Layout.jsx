import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#111827',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
        }}
      />

      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main area */}
      <div style={{
        marginLeft: sidebarWidth,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: 'margin-left 0.25s ease',
      }}>
        <Navbar />
        <main style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
        <footer style={{
          padding: '1rem 2rem',
          borderTop: '1px solid #E5E7EB',
          background: '#fff',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9CA3AF',
          fontWeight: 500,
        }}>
          © {new Date().getFullYear()} Lost &amp; Found — AI-Powered Asset Lifecycle Management System
        </footer>
      </div>
    </div>
  );
};

export default Layout;
