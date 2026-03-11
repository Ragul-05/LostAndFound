import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(formData);
      login({ username: response.username, role: response.role, email: response.email, id: response.id, token: response.token });
      toast.success(`Welcome back, ${response.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem', background: '#F9FAFB',
    border: '1px solid #E5E7EB', borderRadius: '10px',
    color: '#111827', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #1E3A8A, #0D9488)' }} />
        <div style={{ padding: '2rem' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: '#EFF6FF', borderRadius: '14px', marginBottom: '1rem' }}>
              <Search size={24} color="#1E3A8A" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Sign In</h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Access your Lost &amp; Found account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange}
                placeholder="Enter your username" required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#1E3A8A'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••" required style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={e => { e.target.style.borderColor = '#1E3A8A'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.8rem', background: loading ? '#93a3b8' : '#1E3A8A',
              color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700,
              fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(30,58,138,0.3)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              {loading ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6', fontSize: '0.85rem', color: '#6B7280' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1E3A8A', fontWeight: 700 }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
