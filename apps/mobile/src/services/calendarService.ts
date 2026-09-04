import api from './api';
import { ShiftItem } from './userService';

export interface CalendarDay {
  day: string;
  marker: 'confirmed' | 'pending' | 'available';
  shiftCount: number;
}

export interface CalendarResponse {
  year: number;
  month: number;
  days: CalendarDay[];
  upcoming: ShiftItem[];
}

export interface CalendarDayDetail {
  day: string;
  isAvailable: boolean;
  shifts: ShiftItem[];
}

const calendarService = {
  getCalendar: async (year: number, month: number): Promise<CalendarResponse> => {
    const { data } = await api.get('/calendar', { params: { year, month } });
    return data;
  },

  getDay: async (day: string): Promise<CalendarDayDetail> => {
    const { data } = await api.get(`/calendar/${day}`);
    return data;
  },
};

export default calendarService;
