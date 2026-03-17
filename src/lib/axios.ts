import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Using Vite proxy to avoid CORS issues if not properly set
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for Sanctum CSRF cookie
});

// Request interceptor to attach the token if using Sanctum tokens manually
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
