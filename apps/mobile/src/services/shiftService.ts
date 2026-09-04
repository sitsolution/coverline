import api from './api';
import { ShiftItem } from './userService';

export interface ShiftListResponse {
  items: ShiftItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ShiftDetail extends ShiftItem {
  title: string;
  description: string | null;
  requirements: string | null;
  slots: number;
  slotsFilled: number;
}

export interface ShiftFilterOptions {
  locations: string[];
  specialties: string[];
  shiftTypes: string[];
  payRanges: string[];
}

export interface ListShiftsParams {
  search?: string;
  location?: string;
  specialty?: string;
  shiftType?: string;
  urgentOnly?: boolean;
  limit?: number;
  offset?: number;
}

const shiftService = {
  listShifts: async (params?: ListShiftsParams): Promise<ShiftListResponse> => {
    const { data } = await api.get('/shifts', { params });
    return data;
  },

  getRecommended: async (limit = 10): Promise<ShiftListResponse> => {
    const { data } = await api.get('/shifts/recommended', { params: { limit } });
    return data;
  },

  getFilters: async (): Promise<ShiftFilterOptions> => {
    const { data } = await api.get('/shifts/filters');
    return data;
  },

  getFavorites: async (): Promise<ShiftListResponse> => {
    const { data } = await api.get('/shifts/favorites');
    return data;
  },

  getShift: async (shiftId: number): Promise<ShiftDetail> => {
    const { data } = await api.get(`/shifts/${shiftId}`);
    return data;
  },

  applyToShift: async (shiftId: number, note?: string): Promise<void> => {
    await api.post(`/shifts/${shiftId}/apply`, note ? { note } : {});
  },

  addFavorite: async (shiftId: number): Promise<void> => {
    await api.post(`/shifts/${shiftId}/favorite`);
  },

  removeFavorite: async (shiftId: number): Promise<void> => {
    await api.delete(`/shifts/${shiftId}/favorite`);
  },
};

export default shiftService;
