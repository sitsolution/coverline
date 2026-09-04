import api from './api';

export interface UserOut {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface StaffProfileOut {
  credentialNumber: string | null;
  credentialLabel: string;
  specialty: string | null;
  experience: string | null;
  qualifications: string | null;
  bio: string | null;
  preferredLocations: string[];
  minPayRate: number | null;
  bankName: string | null;
  bankAccountLast4: string | null;
  rating: number;
  reviewsCount: number;
  shiftsCompleted: number;
}

export interface ProfileOut {
  user: UserOut;
  profile: StaffProfileOut | null;
  dateOfBirth: string | null;
  location: string | null;
}

export interface DashboardStats {
  availableShifts: number;
  upcomingShifts: number;
  completedShifts: number;
  earningsThisMonth: number;
}

export interface ShiftItem {
  id: number;
  title: string;
  specialty: string;
  facilityName: string;
  facilityInitials: string;
  city: string;
  area: string | null;
  startTime: string;
  endTime: string;
  payRate: number;
  durationHours: number;
  isUrgent: boolean;
  isNight: boolean;
  isWeekend: boolean;
  applicationStatus: string | null;
  isFavorite: boolean;
  slots: number;
  slotsFilled: number;
}

export interface DashboardResponse {
  user: UserOut;
  greeting: string;
  stats: DashboardStats;
  urgentShifts: ShiftItem[];
  recommendedShifts: ShiftItem[];
  unreadNotifications: number;
}

export interface SettingsOut {
  pushNotifications: boolean;
  smsAlerts: boolean;
  emailAlerts: boolean;
  profileVisible: boolean;
  showEarnings: boolean;
}

const userService = {
  getMe: async (): Promise<ProfileOut> => {
    const { data } = await api.get('/users/me');
    return data;
  },

  updateMe: async (payload: Partial<{
    fullName: string;
    phone: string;
    dateOfBirth: string;
    specialty: string;
    experience: string;
    qualifications: string;
    bio: string;
    preferredLocations: string[];
    minPayRate: number;
    bankName: string;
    bankAccountLast4: string;
  }>): Promise<ProfileOut> => {
    const { data } = await api.patch('/users/me', payload);
    return data;
  },

  uploadAvatar: async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<ProfileOut> => {
    const form = new FormData();
    form.append('file', file as unknown as Blob);
    const { data } = await api.post('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getSettings: async (): Promise<SettingsOut> => {
    const { data } = await api.get('/users/me/settings');
    return data;
  },

  updateSettings: async (payload: Partial<SettingsOut>): Promise<SettingsOut> => {
    const { data } = await api.patch('/users/me/settings', payload);
    return data;
  },

  registerDeviceToken: async (token: string, platform: string): Promise<void> => {
    await api.post('/users/me/device-token', { token, platform });
  },

  getDashboard: async (): Promise<DashboardResponse> => {
    const { data } = await api.get('/users/me/dashboard');
    return data;
  },
};

export default userService;
