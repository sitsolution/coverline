from datetime import date, datetime
from typing import List, Optional

from app.models.enums import DocumentStatus, DocumentType
from app.schemas.base import CamelModel


class DocumentOut(CamelModel):
    id: int
    doc_type: DocumentType
    label: Optional[str] = None
    display_name: str
    document_number: Optional[str] = None
    original_filename: str
    content_type: str
    file_size: int
    file_url: str
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: DocumentStatus
    rejection_reason: Optional[str] = None
    is_expiring_soon: bool
    days_until_expiry: Optional[int] = None
    created_at: datetime


class DocumentGroup(CamelModel):
    """One card on the Docs screen — a type, its overall badge, and its files."""

    doc_type: DocumentType
    title: str
    status_label: str          # "Verified" | "1 Pending" | "Expired" | "Missing"
    status_variant: str        # "success" | "warning" | "urgent" | "neutral"
    documents: List[DocumentOut]


class DocumentListResponse(CamelModel):
    groups: List[DocumentGroup]
    total: int
    verified_count: int
    pending_count: int
    expired_count: int


class DocumentTypeOption(CamelModel):
    value: DocumentType
    label: str
    requires_number: bool
    requires_expiry: bool
