import api from './api';

export interface AvailabilityDay {
  weekday: number;
  dayName: string;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface ShiftPreferencesOut {
  urgentShifts: boolean;
  nightShifts: boolean;
  weekendShifts: boolean;
}

export interface AvailabilityOut {
  days: AvailabilityDay[];
  preferences: ShiftPreferencesOut;
}

export interface AvailabilityDayUpdate {
  weekday: number;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

export interface AvailabilityUpdate {
  days?: AvailabilityDayUpdate[];
  preferences?: Partial<ShiftPreferencesOut>;
}

const availabilityService = {
  getAvailability: async (): Promise<AvailabilityOut> => {
    const { data } = await api.get('/availability');
    return data;
  },

  updateAvailability: async (payload: AvailabilityUpdate): Promise<AvailabilityOut> => {
    const { data } = await api.put('/availability', payload);
    return data;
  },
};

export default availabilityService;
