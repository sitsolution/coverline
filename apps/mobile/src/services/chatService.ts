import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export interface DirectMessageOut {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: 'admin' | 'staff';
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatHistoryResponse {
  roomKey: string;
  messages: DirectMessageOut[];
  total: number;
  hasMore: boolean;
}

export interface ChatRoomOut {
  id: number;
  roomKey: string;
  adminId: number;
  staffId: number;
  adminName: string;
  facilityName: string | null;
  staffName: string;
  staffInitials: string;
  lastMessageAt: string | null;
  lastMessageBody: string | null;
  unreadCount: number;
}

const chatService = {
  /** Resolve a room DB id (from a notification entity_id) to full room info */
  getRoomById: async (roomId: number): Promise<ChatRoomOut> => {
    const { data } = await api.get(`/chat/rooms/by-id/${roomId}`);
    return data;
  },

  /** Staff: list all rooms where the current user is the staff member */
  listMyRooms: async (): Promise<ChatRoomOut[]> => {
    const { data } = await api.get('/chat/my-rooms');
    return data;
  },

  /** Staff: get message history for a given room */
  getHistory: async (roomKey: string, limit = 50, offset = 0): Promise<ChatHistoryResponse> => {
    const { data } = await api.get(`/chat/rooms/${roomKey}/history`, {
      params: { limit, offset },
    });
    return data;
  },

  /**
   * Build a WebSocket URL for the given room.
   * The base URL is derived from EXPO_PUBLIC_API_URL (http→ws).
   */
  buildWsUrl: async (roomKey: string): Promise<string | null> => {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return null;
    const base = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/^http/, 'ws');
    return `${base}/chat/ws/${roomKey}?token=${token}`;
  },
};

export default chatService;
