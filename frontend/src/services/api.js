import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('lf_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (_) { /* ignore parse errors */ }
  }
  return config;
});

// Global 401/403 handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or missing — clear storage and redirect to login
      localStorage.removeItem('lf_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
