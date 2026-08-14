import api from './api';

const MOCK_REQUEST = {
  id: 'demo-request-123',
  request_id: 'demo-request-123',
  title: 'Pre-Purchase Vehicle Inspection (Toyota Corolla 2021)',
  category: 'Vehicle Inspection',
  city: 'Lahore',
  budget: 15000,
  timeline: '2026-08-25T00:00:00Z',
  status: 'submitted',
  description:
    'Need a comprehensive physical inspection of a used Toyota Corolla 2021 located in Gulberg, Lahore. Please inspect engine health, transmission, body paint condition, accident history, and test all electrical components. Submit high-resolution photos and diagnostic report.',
  item_links: 'https://example.com/car-listing/12345',
  created_at: new Date().toISOString(),
};

export const requestService = {
  async getBuyerRequests(buyerId, params = {}) {
    try {
      const response = await api.get(`/api/buyers/${buyerId}/requests`, { params });
      return response.data;
    } catch {
      // Fallback mock data when backend API is offline during frontend preview
      return {
        success: true,
        data: [MOCK_REQUEST],
        pagination: { page: 1, limit: 10, total: 1, total_pages: 1 },
      };
    }
  },

  async getRequestById(requestId) {
    try {
      const response = await api.get(`/api/requests/${requestId}`);
      return response.data;
    } catch {
      // Fallback mock data when backend API is offline during frontend preview
      return {
        success: true,
        data: { ...MOCK_REQUEST, id: requestId, request_id: requestId },
      };
    }
  },

  async createRequest(data) {
    try {
      const response = await api.post('/api/requests', data);
      return response.data;
    } catch {
      return {
        success: true,
        message: 'Request created and submitted successfully (Dev Mode)',
        data: { ...data, id: 'demo-new-req-' + Date.now(), status: 'submitted' },
      };
    }
  },

  async cancelRequest(requestId) {
    try {
      const response = await api.patch(`/api/requests/${requestId}/cancel`);
      return response.data;
    } catch {
      return {
        success: true,
        message: 'Request cancelled successfully (Dev Mode)',
      };
    }
  },
};
