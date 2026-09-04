from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import UserRole, enum_column


class User(Base):
    """Login identity. Role-specific fields live on StaffProfile / Facility."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(enum_column(UserRole), nullable=False, index=True)

    avatar_url = Column(String(500), nullable=True)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    accepted_terms_at = Column(DateTime(timezone=True), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    staff_profile = relationship(
        "StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    settings = relationship(
        "UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    # Document has two FKs to users (owner and verifier) — disambiguate.
    documents = relationship(
        "Document",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Document.user_id",
    )
    applications = relationship("Application", back_populates="staff", cascade="all, delete-orphan")
    availability = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    @property
    def initials(self) -> str:
        parts = [p for p in self.full_name.replace(".", " ").split() if p]
        # Skip an honorific so "Dr. Ananya Rao" reads as AR, not DA.
        if parts and parts[0].lower() in {"dr", "mr", "mrs", "ms", "prof"}:
            parts = parts[1:] or parts
        if not parts:
            return "?"
        if len(parts) == 1:
            return parts[0][:2].upper()
        return (parts[0][0] + parts[-1][0]).upper()


class StaffProfile(Base):
    """Professional details for the four shift-seeking roles.

    One table rather than four: the roles differ only in what their single
    credential is called, so a shared ``credential_number`` plus the user's
    role covers all of them.
    """

    __tablename__ = "staff_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    # Doctor: medical license · Nurse: council registration
    # OT tech: certification no. · Housekeeping: Aadhaar / employee id
    credential_number = Column(String(100), nullable=True)
    # Doctor/Nurse: specialty · OT tech: certifying body · Housekeeping: work area
    specialty = Column(String(120), nullable=True)
    experience = Column(String(40), nullable=True)
    qualifications = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)

    preferred_locations = Column(String(255), nullable=True)  # comma-separated
    min_pay_rate = Column(Numeric(10, 2), nullable=True)

    bank_name = Column(String(120), nullable=True)
    bank_account_last4 = Column(String(4), nullable=True)
    bank_ifsc = Column(String(20), nullable=True)

    rating = Column(Numeric(3, 2), default=0, nullable=False)
    reviews_count = Column(Integer, default=0, nullable=False)
    shifts_completed = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="staff_profile")


class UserSettings(Base):
    """Backs the Settings screen toggles."""

    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)

    push_notifications = Column(Boolean, default=True, nullable=False)
    sms_alerts = Column(Boolean, default=True, nullable=False)
    email_alerts = Column(Boolean, default=False, nullable=False)
    profile_visible = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="settings")
