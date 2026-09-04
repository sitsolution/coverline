from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.schemas.base import CamelModel
from app.schemas.admin.shift import TimelineEntry


class BookingRow(CamelModel):
    """One row in the Bookings table."""

    id: int
    reference: str                 # "#BK-8821"
    shift_id: int
    shift_label: str               # "ER Night Cover · Sep 14"
    shift_start: datetime
    staff_id: int
    staff_name: str
    staff_initials: str
    booked_on: datetime
    status: str                    # stored application status
    display_status: str            # adds "upcoming" for confirmed future shifts


class BookingListResponse(CamelModel):
    items: List[BookingRow]
    total: int
    counts: dict[str, int]
    limit: int
    offset: int
    has_more: bool


class BookingMessageOut(CamelModel):
    id: int
    author_name: str
    author_side: str               # "staff" | "facility"
    body: str
    created_at: datetime


class BookingMessageCreate(CamelModel):
    body: str = Field(min_length=1, max_length=2000)


class BookingDetail(BookingRow):
    facility_name: str
    specialty: str
    pay_rate: float
    duration_hours: float
    staff_email: str
    staff_phone: Optional[str] = None
    staff_rating: float
    staff_specialty: Optional[str] = None
    timeline: List[TimelineEntry] = []
    messages: List[BookingMessageOut] = []


class BookingCancelRequest(CamelModel):
    reason: Optional[str] = Field(default=None, max_length=255)
