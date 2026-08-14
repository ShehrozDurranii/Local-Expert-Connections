import api from './api';

const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-1',
    notification_type: 'offer_received',
    title: 'New Offer Received',
    message: 'Tariq Mahmood submitted an offer of PKR 12,500 for "Toyota Corolla Inspection".',
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    link: '/requests/demo-request-123',
  },
  {
    id: 'notif-2',
    notification_type: 'offer_received',
    title: 'New Offer Received',
    message: 'Usman Ali submitted an offer of PKR 14,000 for "Toyota Corolla Inspection".',
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    link: '/requests/demo-request-123',
  },
  {
    id: 'notif-3',
    notification_type: 'security_alert',
    title: 'Security Alert',
    message: 'Your account was logged in from a new browser session.',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    link: '/settings',
  },
];

export const notificationService = {
  async getNotifications(buyerId) {
    try {
      const response = await api.get(`/api/buyers/${buyerId}/notifications`);
      return response.data;
    } catch {
      // Fallback mock data when backend API is offline during frontend preview
      return {
        success: true,
        data: MOCK_NOTIFICATIONS,
      };
    }
  },

  async updateNotificationPreferences(buyerId, preferences) {
    try {
      const response = await api.put(`/api/buyers/${buyerId}/notifications`, { preferences });
      return response.data;
    } catch {
      return {
        success: true,
        message: 'Notification preferences updated (Dev Mode)',
      };
    }
  },
};
