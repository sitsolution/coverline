"""Model registry.

Importing every model here is what makes ``Base.metadata`` complete — Alembic's
autogenerate only sees tables whose module has been imported.
"""

from app.models.application import Application
from app.models.availability import Availability, ShiftPreference
from app.models.document import Document
from app.models.enums import (
    STAFF_ROLES,
    ApplicationStatus,
    DocumentStatus,
    DocumentType,
    FacilityType,
    NotificationCategory,
    OtpPurpose,
    PaymentStatus,
    PayoutStatus,
    ShiftStatus,
    TicketStatus,
    UserRole,
)
from app.models.facility import Facility, FacilityMember
from app.models.notification import Notification
from app.models.otp import OtpCode, PasswordResetToken
from app.models.payment import Payment, PayoutRequest
from app.models.shift import Shift, ShiftFavorite
from app.models.support import DeviceToken, Faq, SupportTicket
from app.models.user import StaffProfile, User, UserSettings

__all__ = [
    "Application",
    "ApplicationStatus",
    "Availability",
    "DeviceToken",
    "Document",
    "DocumentStatus",
    "DocumentType",
    "Facility",
    "FacilityMember",
    "FacilityType",
    "Faq",
    "Notification",
    "NotificationCategory",
    "OtpCode",
    "OtpPurpose",
    "PasswordResetToken",
    "Payment",
    "PaymentStatus",
    "PayoutRequest",
    "PayoutStatus",
    "STAFF_ROLES",
    "Shift",
    "ShiftFavorite",
    "ShiftPreference",
    "ShiftStatus",
    "StaffProfile",
    "SupportTicket",
    "TicketStatus",
    "User",
    "UserRole",
    "UserSettings",
]
