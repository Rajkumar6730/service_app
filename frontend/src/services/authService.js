import api from './api';

export const authService = {
  // Register uses JSON
  register: async (userData) => {
    const response = await api.post('/auth/register', userData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Login uses URLSearchParams because FastAPI OAuth2PasswordRequestForm expects form data
  login: async (email, password) => {
    const params = new URLSearchParams();
    params.append('username', email); // FastAPI OAuth2 expects 'username' field
    params.append('password', password);
    
    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data; // returns { access_token: '...', token_type: 'bearer' }
  },

  // Get current user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  }
};
