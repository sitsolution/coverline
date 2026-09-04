import api from './api';

export interface NotificationOut {
  id: number;
  category: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  entityType: string | null;
  entityId: number | null;
}

export interface NotificationListResponse {
  items: NotificationOut[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const notificationService = {
  listNotifications: async (
    tab: 'all' | 'unread' | 'shift_alerts' | 'payments' = 'all',
    limit = 30,
    offset = 0
  ): Promise<NotificationListResponse> => {
    const { data } = await api.get('/notifications', { params: { tab, limit, offset } });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get('/notifications/unread-count');
    return data.count;
  },

  markRead: async (id: number): Promise<NotificationOut> => {
    const { data } = await api.post(`/notifications/${id}/read`);
    return data;
  },

  markAllRead: async (): Promise<number> => {
    const { data } = await api.post('/notifications/read-all');
    return data.count;
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

export default notificationService;
