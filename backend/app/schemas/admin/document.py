from datetime import date, datetime
from typing import List, Optional

from pydantic import Field

from app.models.enums import DocumentStatus, DocumentType, UserRole
from app.schemas.base import CamelModel


class DocumentReviewRow(CamelModel):
    """One row in the admin Document Verification queue."""

    id: int
    staff_id: int
    staff_name: str
    staff_initials: str
    staff_role: UserRole

    doc_type: DocumentType
    doc_type_label: str
    document_number: Optional[str] = None
    original_filename: str
    content_type: str
    file_url: str

    uploaded_at: datetime
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    days_until_expiry: Optional[int] = None

    status: DocumentStatus
    rejection_reason: Optional[str] = None
    verified_at: Optional[datetime] = None


class DocumentReviewListResponse(CamelModel):
    items: List[DocumentReviewRow]
    total: int
    counts: dict[str, int]
    limit: int
    offset: int
    has_more: bool


class RejectDocumentRequest(CamelModel):
    #: Required: the staff member needs to know what to fix.
    reason: str = Field(min_length=3, max_length=500)
