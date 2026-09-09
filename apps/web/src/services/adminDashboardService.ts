import api from './api';

export interface KpiCard {
  label: string;
  value: string;
  delta?: string;
  deltaTone: 'positive' | 'negative' | 'warning' | 'neutral';
}

export interface ChartBar {
  label: string;
  value: number;
}

export interface UrgentShiftRow {
  id: number;
  title: string;
  location: string;
  startTime: string;
  specialty: string;
  status: string;
  hoursUntilStart: number;
}

export interface AdminDashboardResponse {
  facilityName: string;
  periodLabel: string;
  kpis: KpiCard[];
  shiftVolumeByWeek: ChartBar[];
  urgentShifts: UrgentShiftRow[];
  unreadNotifications: number;
}

export interface TopStaffRow {
  staffId: number;
  name: string;
  shiftsCompleted: number;
  rating: number;
}

export interface ExpiringDocumentRow {
  documentId: number;
  staffId: number;
  staffName: string;
  documentType: string;
  expiresOn?: string;
  status: string;
  daysUntilExpiry?: number;
}

export interface ReportsResponse {
  periodLabel: string;
  kpis: KpiCard[];
  shiftsByWeek: ChartBar[];
  topStaff: TopStaffRow[];
  expiringDocuments: ExpiringDocumentRow[];
}

export interface CalendarDayCell {
  day: string;
  marker: 'filled' | 'pending' | 'unfilled' | 'cancelled';
  total: number;
  filled: number;
  unfilled: number;
}

export interface AdminCalendarResponse {
  year: number;
  month: number;
  days: CalendarDayCell[];
}

const adminDashboardService = {
  getDashboard: async (year?: number, month?: number): Promise<AdminDashboardResponse> => {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const { data } = await api.get('/admin/dashboard', { params });
    return data;
  },

  getReports: async (year?: number, month?: number): Promise<ReportsResponse> => {
    const params: Record<string, number> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const { data } = await api.get('/admin/reports', { params });
    return data;
  },

  getCalendar: async (year: number, month: number): Promise<AdminCalendarResponse> => {
    const { data } = await api.get('/admin/calendar', { params: { year, month } });
    return data;
  },
};

export default adminDashboardService;
