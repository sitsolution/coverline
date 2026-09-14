import api from './api';

export interface ActivityStats {
  shiftsCompleted: number;
  hoursWorked: number;
  pendingApplications: number;
  completionRate: number;
}

export interface ActivityLogItem {
  id: number;
  actorName: string;
  actorRole: string;
  action: string;
  entityType?: string;
  entityId?: number;
  description: string;
  createdAt: string;
}

export interface ActivityLogResponse {
  items: ActivityLogItem[];
  total: number;
  hasMore: boolean;
}

const activityService = {
  getStats: async (): Promise<ActivityStats> => {
    const res = await api.get('/activity/me/stats');
    return res.data;
  },

  getActivity: async (limit = 20, offset = 0): Promise<ActivityLogResponse> => {
    const res = await api.get('/activity/me', { params: { limit, offset } });
    return res.data;
  },
};

export default activityService;
