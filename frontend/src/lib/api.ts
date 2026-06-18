import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Enhanced logging for debugging failed requests
    try {
      const { config, response } = err;
      const method = config?.method?.toUpperCase() || 'UNKNOWN';
      const base = config?.baseURL ?? '';
      const url = config?.url ? `${base}${config.url}` : base || 'unknown-url';
      const status = response?.status;
      const data = response?.data;
      const isNetworkError = err?.message === 'Network Error' || status === undefined;
      const message = data || err.message || err;
      // eslint-disable-next-line no-console
      console.warn(`API ${isNetworkError ? 'Warning' : 'Error'}: ${method} ${url} -> ${status || 'Network Error'}`, message);
    } catch (e) {
      // ignore logging failures
    }

    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }

    return Promise.reject(err);
  }
);

export default api;
