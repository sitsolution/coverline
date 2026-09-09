import api from './api';

export interface FacilityProfileOut {
  id: number;
  name: string;
  facilityType: string;
  city: string;
  area?: string;
  state?: string;
  address?: string;
  contactEmail?: string;
  description?: string;
  logoUrl?: string;
  rating: number;
}

export interface FacilityProfileUpdate {
  name?: string;
  facilityType?: string;
  city?: string;
  area?: string;
  state?: string;
  address?: string;
  contactEmail?: string;
  description?: string;
}

export interface PermissionOption {
  value: string;
  label: string;
}

export interface AdminUserRow {
  id: number;
  memberId: number;
  name: string;
  email: string;
  phone?: string;
  facilityRole: string;
  permissions: string[];
  isActive: boolean;
  acceptedAt?: string;
  invitedAt: string;
}

const adminSettingsService = {
  getFacility: async (): Promise<FacilityProfileOut> => {
    const { data } = await api.get('/admin/settings/facility');
    return data;
  },

  updateFacility: async (payload: FacilityProfileUpdate): Promise<FacilityProfileOut> => {
    const { data } = await api.patch('/admin/settings/facility', payload);
    return data;
  },

  getPermissions: async (): Promise<PermissionOption[]> => {
    const { data } = await api.get('/admin/settings/permissions');
    return data;
  },

  getUsers: async (): Promise<AdminUserRow[]> => {
    const { data } = await api.get('/admin/settings/users');
    return data;
  },

  inviteUser: async (payload: {
    fullName: string;
    email: string;
    phone?: string;
    facilityRole: string;
    permissions: string[];
  }): Promise<AdminUserRow> => {
    const { data } = await api.post('/admin/settings/users', payload);
    return data;
  },

  updateUser: async (memberId: number, payload: { facilityRole?: string; permissions?: string[]; isActive?: boolean }): Promise<AdminUserRow> => {
    const { data } = await api.patch(`/admin/settings/users/${memberId}`, payload);
    return data;
  },

  removeUser: async (memberId: number): Promise<void> => {
    await api.delete(`/admin/settings/users/${memberId}`);
  },
};

export default adminSettingsService;
