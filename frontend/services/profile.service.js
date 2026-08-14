import api from './api';

const MOCK_PROFILE = {
  buyer_id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Ahmed Khan',
  email: 'ahmed.khan@mail.com',
  phone: '+923001234567',
  photo_url: '',
  languages: 'en,ur',
  contact_preferences: 'email,push',
  status: 'active',
  created_at: '2026-01-15T00:00:00Z',
};

export const profileService = {
  async getProfile(buyerId) {
    try {
      const response = await api.get(`/api/buyers/${buyerId}/profile`);
      return response.data;
    } catch {
      // Fallback mock data when backend API is offline during frontend preview
      return {
        success: true,
        data: MOCK_PROFILE,
      };
    }
  },

  async updateProfile(buyerId, data) {
    try {
      const response = await api.put(`/api/buyers/${buyerId}/profile`, data);
      return response.data;
    } catch {
      return {
        success: true,
        message: 'Profile updated successfully (Dev Mode)',
        data: { ...MOCK_PROFILE, ...data },
      };
    }
  },
};
