from datetime import datetime
from typing import List, Optional

from app.models.enums import ApplicationStatus
from app.schemas.base import CamelModel
from app.schemas.shift import ShiftListItem


class ApplicationOut(CamelModel):
    id: int
    status: ApplicationStatus
    applied_at: datetime
    responded_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    can_cancel: bool
    shift: ShiftListItem


class ApplicationListResponse(CamelModel):
    items: List[ApplicationOut]
    total: int
    counts: dict[str, int]   # per-status totals for the tab badges


class ApplyRequest(CamelModel):
    note: Optional[str] = None


class CancelApplicationRequest(CamelModel):
    reason: Optional[str] = None
