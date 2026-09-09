from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import PaymentStatus, PayoutStatus, enum_column


class Payment(Base):
    """What a completed shift earned — the Earnings screen's transaction rows."""

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id", ondelete="SET NULL"), nullable=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="SET NULL"), nullable=True)

    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(enum_column(PaymentStatus), default=PaymentStatus.pending,
                    nullable=False, index=True)

    earned_at = Column(DateTime(timezone=True), nullable=False, index=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    reference = Column(String(80), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    shift = relationship("Shift")


class PayoutRequest(Base):
    """A withdrawal requested from the Earnings screen."""

    __tablename__ = "payout_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(enum_column(PayoutStatus), default=PayoutStatus.requested,
                    nullable=False, index=True)

    requested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    reference = Column(String(80), nullable=True)
    failure_reason = Column(String(255), nullable=True)
