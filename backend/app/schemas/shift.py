from datetime import datetime
from typing import List, Optional

from app.models.enums import ShiftStatus, UserRole
from app.schemas.base import CamelModel


class FacilityBrief(CamelModel):
    id: int
    name: str
    initials: str
    location: str
    rating: float = 0
    logo_url: Optional[str] = None


class ShiftListItem(CamelModel):
    """One shift card on the Dashboard / Shifts list.

    Times and pay are raw (ISO 8601, numeric) — the app formats them for the
    device's locale and timezone. Only values the server is authoritative for
    (tags, duration, the viewer's own application state) are precomputed.
    """

    id: int
    facility: FacilityBrief
    role: UserRole
    specialty: str
    title: Optional[str] = None
    start_time: datetime
    end_time: datetime
    duration_hours: float
    pay_rate: float
    status: ShiftStatus
    is_urgent: bool
    is_night: bool = False
    is_weekend: bool = False
    tags: List[str] = []
    slots: int
    slots_remaining: int

    # Relative to the requesting user.
    application_status: Optional[str] = None    # None | "pending" | "confirmed" | …
    is_favorite: bool = False


class ShiftDetail(ShiftListItem):
    requirements: Optional[str] = None
    amenities: List[str] = []
    description: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime


class ShiftListResponse(CamelModel):
    items: List[ShiftListItem]
    total: int
    limit: int
    offset: int
    has_more: bool


class ShiftFilterOptions(CamelModel):
    """Populates the filter chips — the app should not hardcode these."""

    locations: List[str]
    specialties: List[str]
    shift_types: List[str]
    pay_ranges: List[str]
