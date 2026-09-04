from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import DocumentStatus, DocumentType, enum_column


class Document(Base):
    """Credentials uploaded from the Docs tab."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    doc_type = Column(enum_column(DocumentType), nullable=False, index=True)
    label = Column(String(160), nullable=True)      # free-text name for `other`
    document_number = Column(String(120), nullable=True)

    file_path = Column(String(500), nullable=False)   # relative to UPLOAD_DIR
    original_filename = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)

    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True, index=True)

    status = Column(enum_column(DocumentStatus), default=DocumentStatus.pending,
                    nullable=False, index=True)
    rejection_reason = Column(Text, nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="documents", foreign_keys=[user_id])

    @property
    def display_name(self) -> str:
        return self.label or self.original_filename
