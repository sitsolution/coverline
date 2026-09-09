from datetime import date, datetime
from typing import List, Optional

from app.schemas.base import CamelModel


class KpiCard(CamelModel):
    """Mirrors the KpiCard component: a value plus a delta line.

    The server computes the delta text because it is the only side that knows
    last month's numbers.
    """

    label: str
    value: str
    delta: Optional[str] = None
    delta_tone: str = "neutral"    # "positive" | "negative" | "warning" | "neutral"


class ChartBar(CamelModel):
    label: str
    value: float


class UrgentShiftRow(CamelModel):
    id: int
    title: str
    location: str
    start_time: datetime
    specialty: str
    status: str
    hours_until_start: float


class AdminDashboardResponse(CamelModel):
    facility_name: str
    period_label: str              # "September 2026"
    kpis: List[KpiCard]
    shift_volume_by_week: List[ChartBar]
    urgent_shifts: List[UrgentShiftRow]
    unread_notifications: int


class TopStaffRow(CamelModel):
    staff_id: int
    name: str
    shifts_completed: int
    rating: float


class ExpiringDocumentRow(CamelModel):
    document_id: int
    staff_id: int
    staff_name: str
    document_type: str
    expires_on: Optional[date] = None
    status: str                    # "Expired" | "Expiring soon"
    days_until_expiry: Optional[int] = None


class ReportsResponse(CamelModel):
    period_label: str
    kpis: List[KpiCard]
    shifts_by_week: List[ChartBar]
    top_staff: List[TopStaffRow]
    expiring_documents: List[ExpiringDocumentRow]


class CalendarDayCell(CamelModel):
    """A dot on the admin month grid.

    ``marker`` follows the legend: filled / pending / unfilled / cancelled.
    """

    day: date
    marker: str
    total: int
    filled: int
    unfilled: int


class AdminCalendarResponse(CamelModel):
    year: int
    month: int
    days: List[CalendarDayCell]
