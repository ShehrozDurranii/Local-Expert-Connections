import api from './api';

export const authService = {
  async login(credentials) {
    const response = await api.post('/api/buyers/login', credentials);
    if (response.data?.success && response.data?.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token);
        if (response.data.data.buyer_id) {
          localStorage.setItem('buyer_id', response.data.data.buyer_id);
        }
      }
    }
    return response.data;
  },

  async register(data) {
    const response = await api.post('/api/buyers/register', data);
    if (response.data?.success && response.data?.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.data.token);
        if (response.data.data.buyer_id) {
          localStorage.setItem('buyer_id', response.data.data.buyer_id);
        }
      }
    }
    return response.data;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('buyer_id');
    }
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  getBuyerId() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('buyer_id');
    }
    return null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
