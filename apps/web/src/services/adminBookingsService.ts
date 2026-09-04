import api from './api';

export interface BookingRow {
  id: number;
  reference: string;
  shiftId: number;
  shiftLabel: string;
  shiftStart: string;
  staffId: number;
  staffName: string;
  staffInitials: string;
  bookedOn: string;
  status: string;
  displayStatus: string;
}

export interface BookingMessageOut {
  id: number;
  authorName: string;
  authorSide: 'staff' | 'facility';
  body: string;
  createdAt: string;
}

export interface TimelineEntry {
  label: string;
  at?: string;
  done: boolean;
}

export interface BookingDetail extends BookingRow {
  facilityName: string;
  specialty: string;
  payRate: number;
  durationHours: number;
  staffEmail: string;
  staffPhone?: string;
  staffRating: number;
  staffSpecialty?: string;
  timeline: TimelineEntry[];
  messages: BookingMessageOut[];
}

export interface BookingListResponse {
  items: BookingRow[];
  total: number;
  counts: Record<string, number>;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const adminBookingsService = {
  listBookings: async (tab = 'all', search?: string, limit = 25, offset = 0): Promise<BookingListResponse> => {
    const { data } = await api.get('/admin/bookings', {
      params: { tab, search, limit, offset },
    });
    return data;
  },

  getBooking: async (id: number): Promise<BookingDetail> => {
    const { data } = await api.get(`/admin/bookings/${id}`);
    return data;
  },

  sendMessage: async (id: number, body: string): Promise<BookingMessageOut> => {
    const { data } = await api.post(`/admin/bookings/${id}/messages`, { body });
    return data;
  },

  completeBooking: async (id: number): Promise<BookingDetail> => {
    const { data } = await api.post(`/admin/bookings/${id}/complete`);
    return data;
  },

  cancelBooking: async (id: number, reason?: string): Promise<BookingDetail> => {
    const { data } = await api.post(`/admin/bookings/${id}/cancel`, { reason });
    return data;
  },

  exportCsv: (tab = 'all') => {
    window.open(`/api/v1/admin/bookings/export?tab=${tab}`, '_blank');
  },
};

export default adminBookingsService;
