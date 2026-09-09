from datetime import date
from typing import List, Optional

from app.schemas.base import CamelModel
from app.schemas.shift import ShiftListItem


class CalendarDay(CamelModel):
    """A dot on the month grid.

    ``marker`` maps to the screen's legend: confirmed (green), pending
    (yellow), available (grey).
    """

    day: date
    marker: str                # "confirmed" | "pending" | "available"
    shift_count: int


class CalendarResponse(CamelModel):
    year: int
    month: int                 # 1-12
    days: List[CalendarDay]
    upcoming: List[ShiftListItem]


class CalendarDayDetail(CamelModel):
    day: date
    is_available: bool
    shifts: List[ShiftListItem]
