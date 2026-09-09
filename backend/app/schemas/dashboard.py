from typing import List

from app.schemas.base import CamelModel
from app.schemas.shift import ShiftListItem
from app.schemas.user import UserOut


class DashboardStats(CamelModel):
    available_shifts: int
    upcoming_shifts: int
    completed_shifts: int
    earnings_this_month: float


class DashboardResponse(CamelModel):
    """One call for the whole Home screen, so it renders in a single round trip."""

    user: UserOut
    greeting: str
    stats: DashboardStats
    urgent_shifts: List[ShiftListItem]
    recommended_shifts: List[ShiftListItem]
    unread_notifications: int
