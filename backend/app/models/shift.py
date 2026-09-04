from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, UniqueConstraint,
)
from sqlalchemy import event, true as sa_true
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ShiftStatus, UserRole, enum_column


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)

    # Which kind of staff this shift is for — drives the app's role switcher.
    role = Column(enum_column(UserRole), nullable=False, index=True)
    specialty = Column(String(120), nullable=False)   # "Emergency Med.", "ICU Nursing", "OT Housekeeping"
    title = Column(String(255), nullable=True)

    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=False)

    pay_rate = Column(Numeric(10, 2), nullable=False)   # total pay for the shift, INR
    overtime_rate = Column(Numeric(10, 2), nullable=True)   # per hour, beyond end_time
    slots = Column(Integer, default=1, nullable=False)
    slots_filled = Column(Integer, default=0, nullable=False)

    status = Column(enum_column(ShiftStatus), default=ShiftStatus.open, nullable=False, index=True)
    is_urgent = Column(Boolean, default=False, nullable=False)

    # Derived from start_time/end_time and kept as real columns so the Shifts
    # screen's filter chips are one indexed boolean lookup instead of a
    # dialect-specific date function. Maintained by the listener below, never
    # set by hand.
    is_night = Column(Boolean, default=False, nullable=False)
    is_weekend = Column(Boolean, default=False, nullable=False)

    requirements = Column(Text, nullable=True)
    required_qualifications = Column(String(255), nullable=True)   # comma-separated
    required_certifications = Column(String(255), nullable=True)   # comma-separated
    amenities = Column(String(500), nullable=True)   # comma-separated: "On-call room,Meals provided"
    description = Column(Text, nullable=True)

    # "Make Visible to All Doctors" on the Create Shift form. A hidden shift is
    # reachable by direct link but never appears in staff browse results.
    is_visible = Column(Boolean, default=True, server_default=sa_true(), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(String(255), nullable=True)

    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    facility = relationship("Facility", back_populates="shifts")
    applications = relationship("Application", back_populates="shift", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_shifts_role_status_start", "role", "status", "start_time"),
        Index("ix_shifts_night_weekend", "is_night", "is_weekend"),
    )

    # ── Derived display fields ────────────────────────────────────────────────
    @property
    def duration_hours(self) -> float:
        return round((self.end_time - self.start_time).total_seconds() / 3600, 1)

    @property
    def tags(self) -> list[str]:
        tags = []
        if self.is_urgent:
            tags.append("Urgent")
        if self.is_night:
            tags.append("Night")
        if self.is_weekend:
            tags.append("Weekend")
        return tags

    @property
    def amenity_list(self) -> list[str]:
        return _csv(self.amenities)

    @property
    def qualification_list(self) -> list[str]:
        return _csv(self.required_qualifications)

    @property
    def certification_list(self) -> list[str]:
        return _csv(self.required_certifications)

    @property
    def has_open_slots(self) -> bool:
        return self.status == ShiftStatus.open and self.slots_filled < self.slots


def _csv(value: str | None) -> list[str]:
    return [item.strip() for item in (value or "").split(",") if item.strip()]


def compute_night(start_time, end_time) -> bool:
    """Starts in the evening, or runs past midnight into the morning."""
    return start_time.hour >= 20 or end_time.hour <= 8


def compute_weekend(start_time) -> bool:
    return start_time.weekday() >= 5   # 5 = Sat, 6 = Sun


@event.listens_for(Shift, "before_insert")
@event.listens_for(Shift, "before_update")
def _sync_derived_flags(mapper, connection, target: "Shift") -> None:
    """Keep is_night/is_weekend in step with the times they derive from, so a
    caller can never write a row where the flags and the schedule disagree."""
    if target.start_time and target.end_time:
        target.is_night = compute_night(target.start_time, target.end_time)
        target.is_weekend = compute_weekend(target.start_time)


class ShiftFavorite(Base):
    """The heart button on the shift-details screen."""

    __tablename__ = "shift_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (UniqueConstraint("user_id", "shift_id", name="uq_favorite_user_shift"),)
