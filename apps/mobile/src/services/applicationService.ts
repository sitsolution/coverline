import api from './api';
import { ShiftItem } from './userService';

export interface ApplicationOut {
  id: number;
  status: string;
  appliedAt: string;
  respondedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  canCancel: boolean;
  shift: ShiftItem;
}

export interface ApplicationCounts {
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
}

export interface ApplicationListResponse {
  items: ApplicationOut[];
  total: number;
  counts: ApplicationCounts;
}

const applicationService = {
  listApplications: async (tab?: 'pending' | 'confirmed' | 'completed' | 'cancelled'): Promise<ApplicationListResponse> => {
    const { data } = await api.get('/applications', { params: tab ? { tab } : {} });
    return data;
  },

  getApplication: async (id: number): Promise<ApplicationOut> => {
    const { data } = await api.get(`/applications/${id}`);
    return data;
  },

  cancelApplication: async (id: number, reason?: string): Promise<ApplicationOut> => {
    const { data } = await api.post(`/applications/${id}/cancel`, reason ? { reason } : {});
    return data;
  },
};

export default applicationService;
