from datetime import datetime
from typing import List, Optional

from pydantic import EmailStr, Field

from app.models.enums import AdminPermission, FacilityRole, FacilityType
from app.schemas.base import CamelModel


class FacilityProfileOut(CamelModel):
    id: int
    name: str
    facility_type: FacilityType
    city: str
    area: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    rating: float


class FacilityProfileUpdate(CamelModel):
    name: Optional[str] = Field(default=None, min_length=3, max_length=255)
    facility_type: Optional[FacilityType] = None
    city: Optional[str] = None
    area: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    description: Optional[str] = None


class AdminUserRow(CamelModel):
    id: int
    member_id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    facility_role: FacilityRole
    permissions: List[str]
    is_active: bool
    accepted_at: Optional[datetime] = None
    invited_at: datetime


class AdminUserInvite(CamelModel):
    """The Add Admin User form."""

    full_name: str = Field(min_length=3, max_length=60)
    email: EmailStr
    phone: Optional[str] = Field(default=None, pattern=r"^\+?[0-9 \-]{10,20}$")
    facility_role: FacilityRole = FacilityRole.manager
    permissions: List[AdminPermission] = []
    facility_id: Optional[int] = None


class AdminUserUpdate(CamelModel):
    facility_role: Optional[FacilityRole] = None
    permissions: Optional[List[AdminPermission]] = None
    is_active: Optional[bool] = None


class AdminUserInviteResponse(AdminUserRow):
    #: Only populated while DEBUG is on — there is no email provider yet.
    debug_invitation_token: Optional[str] = None


class AcceptInvitationRequest(CamelModel):
    token: str
    password: str


class PermissionOption(CamelModel):
    value: AdminPermission
    label: str
