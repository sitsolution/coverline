import api from './api';

export interface ActivityLogRow {
  id: number;
  actorName: string;
  actorRole: string;
  action: string;
  entityType?: string;
  entityId?: number;
  description: string;
  facilityId?: number;
  createdAt: string;
}

export interface ActivityLogResponse {
  items: ActivityLogRow[];
  total: number;
  hasMore: boolean;
}

const adminActivityService = {
  listActivity: async (params: {
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ActivityLogResponse> => {
    const { data } = await api.get('/admin/activity', { params });
    return data;
  },
};

export default adminActivityService;
