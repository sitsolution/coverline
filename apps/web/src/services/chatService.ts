import api from './api';

export interface DirectMessageOut {
  id: number;
  senderId: number;
  senderName: string;
  senderRole: 'admin' | 'staff';
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoomOut {
  id: number;
  roomKey: string;
  adminId: number;
  staffId: number;
  adminName: string;
  staffName: string;
  staffInitials: string;
  lastMessageAt: string | null;
  lastMessageBody: string | null;
  unreadCount: number;
}

export interface ChatHistoryResponse {
  roomKey: string;
  messages: DirectMessageOut[];
  total: number;
  hasMore: boolean;
}

const chatService = {
  /** Admin: open (or get) a room with a staff member */
  getOrCreateRoom(staffId: number): Promise<ChatRoomOut> {
    return api.post<ChatRoomOut>(`/chat/rooms?staff_id=${staffId}`).then(r => r.data);
  },

  /** Admin: list all their rooms */
  listRooms(): Promise<ChatRoomOut[]> {
    return api.get<ChatRoomOut[]>('/chat/rooms').then(r => r.data);
  },

  /** Get a room by its numeric ID (used for notification deep-link) */
  getRoomById(roomId: number): Promise<ChatRoomOut> {
    return api.get<ChatRoomOut>(`/chat/rooms/by-id/${roomId}`).then(r => r.data);
  },

  /** Load message history for a room */
  getHistory(roomKey: string, limit = 50, offset = 0): Promise<ChatHistoryResponse> {
    return api
      .get<ChatHistoryResponse>(`/chat/rooms/${roomKey}/history`, { params: { limit, offset } })
      .then(r => r.data);
  },
};

export default chatService;
