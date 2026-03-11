import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await registerUser(formData);
      login({ username: response.username, role: response.role, email: response.email, id: response.id, token: response.token });
      toast.success(`Welcome, ${response.username}! Account created.`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Registration failed.');
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
  const focusStyle = (e) => { e.target.style.borderColor = '#1E3A8A'; e.target.style.boxShadow = '0 0 0 3px rgba(30,58,138,0.08)'; };
  const blurStyle  = (e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #0D9488, #1E3A8A)' }} />
        <div style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', background: '#F0FDFA', borderRadius: '14px', marginBottom: '1rem' }}>
              <UserPlus size={24} color="#0D9488" />
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Create Account</h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Join Lost &amp; Found today</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { label: 'Username', name: 'username', type: 'text', placeholder: 'Choose a username' },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com' },
            ].map(f => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>{f.label}</label>
                <input type={f.type} name={f.name} value={formData[f.name]} onChange={handleChange}
                  placeholder={f.placeholder} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPw ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="Min 6 characters" required minLength={6} style={{ ...inputStyle, paddingRight: '2.75rem' }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '0.8rem', marginTop: '0.25rem',
              background: loading ? '#93a3b8' : '#0D9488', color: '#fff',
              border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(13,148,136,0.3)',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}>
              {loading ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Creating account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #F3F4F6', fontSize: '0.85rem', color: '#6B7280' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#0D9488', fontWeight: 700 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
