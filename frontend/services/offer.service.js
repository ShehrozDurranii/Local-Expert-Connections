import api from './api';

const MOCK_OFFERS = [
  {
    offer_id: 'offer-1',
    id: 'offer-1',
    expert_name: 'Tariq Mahmood (Certified Auto Inspector)',
    rating: '4.9',
    completed_jobs: 28,
    price: 12500,
    delivery_days: 2,
    status: 'pending',
    notes:
      'I am an ASE-certified auto technician in Lahore. I will perform a 150-point physical inspection including computer scanner diagnostics, paint depth test, and test drive. Detailed PDF report + 30 photos will be uploaded within 48 hours.',
  },
  {
    offer_id: 'offer-2',
    id: 'offer-2',
    expert_name: 'Usman Ali (Field Verification Specialist)',
    rating: '4.8',
    completed_jobs: 14,
    price: 14000,
    delivery_days: 1,
    status: 'pending',
    notes:
      'Can visit the car location in Gulberg tomorrow morning. Will check documents, engine bay, chassis number, and test drive.',
  },
];

export const offerService = {
  async getOffersForRequest(requestId) {
    try {
      const response = await api.get(`/api/requests/${requestId}/offers`);
      return response.data;
    } catch {
      // Fallback mock data when backend API is offline during frontend preview
      return {
        success: true,
        data: MOCK_OFFERS,
      };
    }
  },

  async acceptOffer(offerId) {
    try {
      const response = await api.post(`/api/offers/${offerId}/accept`);
      return response.data;
    } catch {
      return {
        success: true,
        message: 'Offer accepted! Order created (Dev Mode)',
      };
    }
  },

  async declineOffer(offerId) {
    try {
      const response = await api.post(`/api/offers/${offerId}/decline`);
      return response.data;
    } catch {
      return {
        success: true,
        message: 'Offer declined (Dev Mode)',
      };
    }
  },
};
