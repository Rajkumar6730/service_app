import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:8000';
  }
  return 'https://service-request-9a97cf28.fastapicloud.dev';
};

const api = axios.create({
  baseURL: getBaseURL(),
  // Don't set global Content-Type here because we use both JSON (register) and Form (login)
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration/invalid token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
