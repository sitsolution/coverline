from datetime import date, datetime
from typing import List, Optional

from pydantic import EmailStr, Field

from app.models.enums import UserRole
from app.schemas.base import CamelModel
from app.schemas.document import DocumentOut


class StaffRow(CamelModel):
    """One row in the Staff Database table."""

    id: int
    name: str
    initials: str
    role: UserRole
    role_label: str
    specialty: Optional[str] = None
    location: Optional[str] = None
    is_available: bool
    availability_label: str        # "Available" | "Unavailable"
    rating: float
    verification_status: str       # "Verified" | "Pending" | "Rejected"
    shifts_completed: int


class StaffListResponse(CamelModel):
    items: List[StaffRow]
    total: int
    limit: int
    offset: int
    has_more: bool


class StaffShiftHistoryRow(CamelModel):
    shift_id: int
    reference: str
    facility_name: str
    specialty: str
    start_time: datetime
    end_time: datetime
    status: str
    pay_rate: float


class StaffReviewOut(CamelModel):
    id: int
    rating: float
    comment: Optional[str] = None
    facility_name: Optional[str] = None
    author_name: Optional[str] = None
    shift_reference: Optional[str] = None
    created_at: datetime


class StaffNoteOut(CamelModel):
    id: int
    body: str
    author_name: Optional[str] = None
    created_at: datetime


class StaffStats(CamelModel):
    shifts_completed: int
    shifts_at_this_facility: int
    rating: float
    reviews_count: int
    cancellation_count: int
    total_paid: float


class StaffDetail(CamelModel):
    """The admin Staff Profile screen.

    Documents are included only when the caller may see them — see
    `canViewDocuments`; otherwise the tab renders empty rather than 403-ing.
    """

    id: int
    name: str
    initials: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    role_label: str
    avatar_url: Optional[str] = None
    is_verified: bool
    is_available: bool
    joined_on: datetime

    credential_label: str
    credential_number: Optional[str] = None
    specialty: Optional[str] = None
    experience: Optional[str] = None
    qualifications: Optional[str] = None
    preferred_locations: List[str] = []
    min_pay_rate: Optional[float] = None

    stats: StaffStats
    can_view_documents: bool
    documents: List[DocumentOut] = []


class StaffNoteCreate(CamelModel):
    body: str = Field(min_length=1, max_length=4000)


class StaffReviewCreate(CamelModel):
    rating: float = Field(ge=1, le=5)
    comment: Optional[str] = Field(default=None, max_length=2000)
    shift_id: Optional[int] = None


class StaffInvite(CamelModel):
    """'Add New Staff' — invites someone to register in the mobile app."""

    full_name: str = Field(min_length=3, max_length=60)
    email: EmailStr
    phone: Optional[str] = Field(default=None, pattern=r"^\+?[0-9 \-]{10,20}$")
    role: UserRole
    specialty: Optional[str] = None


class StaffFilterOptions(CamelModel):
    roles: List[dict]
    specialties: List[str]
    locations: List[str]
