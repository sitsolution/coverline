from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Time, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Availability(Base):
    """One row per weekday — the Set Availability screen's day cards.

    ``weekday`` follows Python's convention: 0 = Monday … 6 = Sunday, matching
    the screen's Monday-first ordering.
    """

    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    weekday = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="availability")

    __table_args__ = (UniqueConstraint("user_id", "weekday", name="uq_availability_user_weekday"),)


class ShiftPreference(Base):
    """The three toggles under Shift Preferences."""

    __tablename__ = "shift_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"),
                     nullable=False, unique=True, index=True)

    urgent_shifts = Column(Boolean, default=True, nullable=False)
    night_shifts = Column(Boolean, default=True, nullable=False)
    weekend_shifts = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
