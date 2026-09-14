import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SADashboardResponse {
  totalUsers: number;
  totalFacilities: number;
  activeShifts: number;
  pendingVerifications: number;
  newUsersThisMonth: number;
  newFacilitiesThisMonth: number;
  usersByRole: Array<{ role: string; count: number; pct: number }>;
  recentFacilities: Array<{
    id: number;
    name: string;
    facilityType: string;
    city: string;
    adminContact: string;
    joinedLabel: string;
    isActive: boolean;
  }>;
}

export interface SAUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  facilityId: number | null;
  facilityName: string | null;
  createdAt: string;
}

export interface SAUserDetail extends SAUser {
  documents: Array<{
    id: number;
    docType: string;
    status: string;
    uploadedAt: string;
    expiryDate: string | null;
  }>;
}

export interface SAUsersResponse {
  items: SAUser[];
  total: number;
}

export interface SAFacility {
  id: number;
  name: string;
  facilityType: string;
  city: string;
  area: string | null;
  contactEmail: string | null;
  staffCount: number;
  adminContact: string;
  createdAt: string;
}

export interface SAFacilityMember {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  facilityRole: string;
  joinedAt: string | null;
}

export interface SAFacilityDetail extends SAFacility {
  area: string | null;
  state: string | null;
  address: string | null;
  description: string | null;
  members: SAFacilityMember[];
}

export interface SAFacilitiesResponse {
  items: SAFacility[];
  total: number;
}

export interface SAReportsResponse {
  platformFillRate: number;
  totalShiftHours: number;
  newUsersThisMonth: number;
  expiringDocuments: number;
  topFacilities: Array<{ name: string; shiftCount: number; fillRate: number }>;
  staffGrowthByRole: Array<{ role: string; count: number }>;
}

export interface SAActivityItem {
  id: number;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string | null;
  entityId: number | null;
  facilityId: number | null;
  facilityName: string | null;
  description: string;
  createdAt: string;
}

export interface SAActivityResponse {
  items: SAActivityItem[];
  total: number;
  hasMore: boolean;
}

export interface RolePermissionSet {
  viewShifts: boolean;
  createEditShifts: boolean;
  viewStaffDirectory: boolean;
  manageBookings: boolean;
  verifyDocuments: boolean;
  viewReports: boolean;
  manageFacilitySettings: boolean;
  manageUsers: boolean;
}

export interface SARoleItem {
  roleKey: string;
  displayName: string;
  scope: string;
  userCount: number;
  isSuperAdmin: boolean;
  permissions: RolePermissionSet;
}

export interface SARolesResponse {
  roles: SARoleItem[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

const superAdminService = {
  getDashboard: () =>
    api.get('/superadmin/dashboard').then((r) => r.data as SADashboardResponse),

  getUsers: (params?: object) =>
    api.get('/superadmin/users', { params }).then((r) => r.data as SAUsersResponse),

  createUser: (body: object) =>
    api.post('/superadmin/users', body).then((r) => r.data as SAUser),

  getUser: (id: number) =>
    api.get(`/superadmin/users/${id}`).then((r) => r.data as SAUserDetail),

  updateUser: (id: number, body: object) =>
    api.put(`/superadmin/users/${id}`, body).then((r) => r.data as SAUser),

  deleteUser: (id: number) => api.delete(`/superadmin/users/${id}`),

  resetUserPassword: (id: number) =>
    api.post(`/superadmin/users/${id}/reset-password`).then((r) => r.data as { message: string }),

  getFacilities: (params?: object) =>
    api.get('/superadmin/facilities', { params }).then((r) => r.data as SAFacilitiesResponse),

  getFacility: (id: number) =>
    api.get(`/superadmin/facilities/${id}`).then((r) => r.data as SAFacilityDetail),

  createFacility: (body: object) =>
    api.post('/superadmin/facilities', body).then((r) => r.data as SAFacility),

  updateFacility: (id: number, body: object) =>
    api.put(`/superadmin/facilities/${id}`, body).then((r) => r.data as SAFacility),

  getReports: () =>
    api.get('/superadmin/reports').then((r) => r.data as SAReportsResponse),

  getActivity: (params?: object) =>
    api.get('/superadmin/activity', { params }).then((r) => r.data as SAActivityResponse),

  getRoles: () =>
    api.get('/superadmin/roles').then((r) => r.data as SARolesResponse),

  updateRolePermissions: (roleKey: string, permissions: RolePermissionSet) =>
    api.put(`/superadmin/roles/${roleKey}`, permissions).then((r) => r.data as SARoleItem),
};

export default superAdminService;
