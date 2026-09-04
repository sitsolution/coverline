from datetime import datetime
from typing import List, Optional

from app.models.enums import NotificationCategory
from app.schemas.base import CamelModel


class NotificationOut(CamelModel):
    id: int
    category: NotificationCategory
    title: str
    body: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    is_read: bool
    created_at: datetime


class NotificationListResponse(CamelModel):
    items: List[NotificationOut]
    total: int
    unread_count: int
    limit: int
    offset: int
    has_more: bool
