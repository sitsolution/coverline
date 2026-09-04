from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ApplicationStatus, enum_column


class Application(Base):
    """A staff member applying for a shift — the My Applications screen."""

    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    status = Column(enum_column(ApplicationStatus), default=ApplicationStatus.pending,
                    nullable=False, index=True)
    note = Column(Text, nullable=True)

    applied_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(String(255), nullable=True)

    shift = relationship("Shift", back_populates="applications")
    staff = relationship("User", back_populates="applications")

    # One application per person per shift. Re-applying after cancelling
    # reuses this row rather than creating a second one.
    __table_args__ = (UniqueConstraint("shift_id", "staff_id", name="uq_application_shift_staff"),)
