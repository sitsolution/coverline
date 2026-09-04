import enum


class UserRole(str, enum.Enum):
    doctor = "doctor"
    nurse = "nurse"
    ot_tech = "ot_tech"
    housekeeping = "housekeeping"
    facility_admin = "facility_admin"
    super_admin = "super_admin"


#: Roles that look for shifts (everything except the facility/platform side).
STAFF_ROLES = (
    UserRole.doctor,
    UserRole.nurse,
    UserRole.ot_tech,
    UserRole.housekeeping,
)


class FacilityType(str, enum.Enum):
    hospital = "hospital"
    clinic = "clinic"
    staffing_agency = "staffing_agency"
    diagnostic_centre = "diagnostic_centre"


class ShiftStatus(str, enum.Enum):
    draft = "draft"          # created but not published; never visible to staff
    open = "open"
    filled = "filled"
    completed = "completed"
    cancelled = "cancelled"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    cancelled = "cancelled"
    completed = "completed"


class DocumentType(str, enum.Enum):
    medical_license = "medical_license"
    nursing_registration = "nursing_registration"
    ot_certification = "ot_certification"
    bls_certification = "bls_certification"
    acls_certification = "acls_certification"
    id_proof = "id_proof"
    educational_certificate = "educational_certificate"
    other = "other"


class DocumentStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    expired = "expired"


class NotificationCategory(str, enum.Enum):
    shift_alert = "shift_alert"
    application = "application"
    payment = "payment"
    document = "document"
    system = "system"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    paid = "paid"
    failed = "failed"


class PayoutStatus(str, enum.Enum):
    requested = "requested"
    processing = "processing"
    completed = "completed"
    rejected = "rejected"


class OtpPurpose(str, enum.Enum):
    signup_verification = "signup_verification"
    password_reset = "password_reset"


#: Facility roles that may administer other members and billing.
FACILITY_ADMIN_ROLES = ("super_admin", "manager")


class FacilityRole(str, enum.Enum):
    """A member's authority *within a facility*.

    Distinct from UserRole.super_admin, which is platform-wide. A facility
    super_admin administers one facility, not the whole platform.
    """

    super_admin = "super_admin"
    manager = "manager"
    staff = "staff"


class AdminPermission(str, enum.Enum):
    """Checkbox list on the Add Admin User screen."""

    shifts = "shifts"
    staff = "staff"
    bookings = "bookings"
    documents = "documents"
    reports = "reports"
    billing = "billing"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    unpaid = "unpaid"
    paid = "paid"
    overdue = "overdue"
    void = "void"


class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


# ── SQLAlchemy helper ─────────────────────────────────────────────────────────

from sqlalchemy import Enum as SAEnum  # noqa: E402


def enum_column(enum_cls, **kwargs) -> SAEnum:
    """Store the enum's *value* in MySQL rather than its Python member name.

    Without ``values_callable`` SQLAlchemy persists the member *name*, which
    happens to match the value for every enum here — but diverges the moment
    a name and value differ. Being explicit keeps the column stable.
    """
    return SAEnum(
        enum_cls,
        values_callable=lambda e: [member.value for member in e],
        **kwargs,
    )
