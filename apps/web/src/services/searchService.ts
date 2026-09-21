import api from './api';

// ── Admin search ──────────────────────────────────────────────────────────────

export interface AdminStaffResult {
  id: number;
  name: string;
  email: string;
  role: string;
  specialty?: string;
  url: string;
}

export interface AdminShiftResult {
  id: number;
  reference: string;
  title: string;
  facilityName: string;
  status: string;
  url: string;
}

export interface AdminBookingResult {
  id: number;
  reference: string;
  staffName: string;
  shiftTitle: string;
  url: string;
}

export interface AdminSearchResponse {
  query: string;
  staff: AdminStaffResult[];
  shifts: AdminShiftResult[];
  bookings: AdminBookingResult[];
}

export async function adminSearch(q: string): Promise<AdminSearchResponse> {
  const res = await api.get('/admin/search', { params: { q } });
  return res.data;
}

// ── Super admin search ────────────────────────────────────────────────────────

export interface SAUserResult {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  url: string;
}

export interface SAFacilityResult {
  id: number;
  name: string;
  facilityType: string;
  city: string;
  url: string;
}

export interface SASearchResponse {
  query: string;
  users: SAUserResult[];
  facilities: SAFacilityResult[];
}

export async function superAdminSearch(q: string): Promise<SASearchResponse> {
  const res = await api.get('/superadmin/search', { params: { q } });
  return res.data;
}
