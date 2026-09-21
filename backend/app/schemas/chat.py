from datetime import datetime
from typing import List, Optional

from app.schemas.base import CamelModel


class DirectMessageOut(CamelModel):
    id: int
    sender_id: int
    sender_name: str
    sender_role: str   # "admin" | "staff"
    body: str
    is_read: bool
    created_at: datetime


class ChatRoomOut(CamelModel):
    id: int
    room_key: str
    admin_id: int
    staff_id: int
    admin_name: str
    staff_name: str
    staff_initials: str
    last_message_at: Optional[datetime]
    unread_count: int


class ChatHistoryResponse(CamelModel):
    room_key: str
    messages: List[DirectMessageOut]
    total: int
    has_more: bool


class SendMessageRequest(CamelModel):
    body: str
