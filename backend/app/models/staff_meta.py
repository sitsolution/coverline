from sqlalchemy import (
    CheckConstraint, Column, DateTime, ForeignKey, Integer, Numeric, String, Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class StaffReview(Base):
    """A facility's rating of a staff member after a completed shift.

    Feeds the Reviews tab on the admin Staff Profile, and the star rating shown
    on both the staff's own profile and the applicants table.
    """

    __tablename__ = "staff_reviews"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="SET NULL"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    rating = Column(Numeric(2, 1), nullable=False)
    comment = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    facility = relationship("Facility")
    shift = relationship("Shift")

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_review_rating_range"),
    )


class StaffNote(Base):
    """Private note a facility keeps about a staff member.

    Never exposed through the mobile API — the Notes tab is admin-only, and
    notes are scoped to the facility that wrote them.
    """

    __tablename__ = "staff_notes"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    facility_id = Column(Integer, ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class BookingMessage(Base):
    """One entry in the Communication Log on the Booking Details screen."""

    __tablename__ = "booking_messages"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"),
                            nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Denormalised so the log still reads correctly if the author is removed.
    author_name = Column(String(120), nullable=False)
    author_side = Column(String(20), nullable=False)   # "staff" | "facility"
    body = Column(Text, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
