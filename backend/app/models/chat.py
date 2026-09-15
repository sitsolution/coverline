from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class ChatRoom(Base):
    """One row per admin↔staff pair. Created on first message."""

    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True)
    # Stable key: "admin_{admin_id}_staff_{staff_id}"
    room_key = Column(String(80), unique=True, nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    staff_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)

    admin = relationship("User", foreign_keys=[admin_id])
    staff = relationship("User", foreign_keys=[staff_id])
    messages = relationship("DirectMessage", back_populates="room", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_chat_rooms_admin_staff", "admin_id", "staff_id"),
    )


class DirectMessage(Base):
    """A single chat message in a ChatRoom."""

    __tablename__ = "direct_messages"

    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender_name = Column(String(120), nullable=False)
    # "admin" | "staff"
    sender_role = Column(String(10), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    room = relationship("ChatRoom", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
