from datetime import datetime
from typing import List, Optional

from app.models.enums import ActivityActionType, UserRole
from app.schemas.base import CamelModel


class ActivityLogItem(CamelModel):
    id: int
    actor_name: str
    actor_role: UserRole
    action: ActivityActionType
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    description: str
    facility_id: Optional[int] = None
    created_at: datetime


class ActivityLogResponse(CamelModel):
    items: List[ActivityLogItem]
    total: int
    has_more: bool


class ActivityStats(CamelModel):
    """Stats row on the My Activity screen (2.11)."""
    shifts_completed: int
    hours_worked: float
    pending_applications: int
    completion_rate: float  # 0.0 – 100.0, e.g. 87.5
