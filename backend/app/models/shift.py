from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ShiftStatus(str, enum.Enum):
    open = "open"
    applied = "applied"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    specialty = Column(String(100), nullable=False)
    location = Column(String(255), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    pay_rate = Column(Float, nullable=False)
    status = Column(Enum(ShiftStatus), default=ShiftStatus.open)
    is_urgent = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
