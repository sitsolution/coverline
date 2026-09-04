from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.admin import AdminContext, require_admin
from app.models.application import Application
from app.models.document import Document
from app.models.enums import AdminPermission, DocumentStatus, NotificationCategory
from app.models.shift import Shift
from app.models.user import User
from app.schemas.admin.document import (
    DocumentReviewRow,
    DocumentReviewListResponse,
    RejectDocumentRequest,
)
from app.services import storage
from app.services.labels import DOCUMENT_TYPE_LABELS
from app.services.notifications import notify

router = APIRouter()

TABS = ("all", "pending", "verified", "expired", "rejected")


def _connected_staff_ids(admin: AdminContext):
    """Only staff who have applied to one of this admin's facilities.

    Credential review is sensitive: a facility has no business reading the
    documents of someone who has never approached it.
    """
    if admin.is_platform_admin:
        return None
    return (
        admin.db.query(Application.staff_id)
        .join(Shift, Application.shift_id == Shift.id)
        .filter(Shift.facility_id.in_(admin.facility_ids))
        .distinct()
    )


def _row(document: Document, user: User) -> DocumentReviewRow:
    days_left = (document.expiry_date - date.today()).days if document.expiry_date else None
    return DocumentReviewRow(
        id=document.id,
        staff_id=user.id,
        staff_name=user.full_name,
        staff_initials=user.initials,
        staff_role=user.role,
        doc_type=document.doc_type,
        doc_type_label=DOCUMENT_TYPE_LABELS.get(document.doc_type, document.doc_type.value),
        document_number=document.document_number,
        original_filename=document.original_filename,
        content_type=document.content_type,
        file_url=f"/api/v1/admin/documents/{document.id}/file",
        uploaded_at=document.created_at,
        issue_date=document.issue_date,
        expiry_date=document.expiry_date,
        days_until_expiry=days_left,
        status=document.status,
        rejection_reason=document.rejection_reason,
        verified_at=document.verified_at,
    )


def _refresh_expired(db: Session, documents: List[Document]) -> None:
    today = date.today()
    changed = False
    for document in documents:
        if (
            document.expiry_date
            and document.expiry_date < today
            and document.status != DocumentStatus.expired
        ):
            document.status = DocumentStatus.expired
            changed = True
    if changed:
        db.commit()


@router.get("", response_model=DocumentReviewListResponse)
def list_documents(
    admin: AdminContext = Depends(require_admin(AdminPermission.documents)),
    tab: str = Query("pending", pattern="^(all|pending|verified|expired|rejected)$"),
    search: Optional[str] = None,
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Document Verification queue and its five tabs."""
    db = admin.db
    query = db.query(Document, User).join(User, Document.user_id == User.id)

    connected = _connected_staff_ids(admin)
    if connected is not None:
        query = query.filter(Document.user_id.in_(connected))

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(User.full_name.ilike(term), Document.document_number.ilike(term))
        )

    # Refresh expiry before filtering, so the tabs agree with the badges.
    _refresh_expired(db, [document for document, _ in query.all()])

    if tab != "all":
        query = query.filter(Document.status == DocumentStatus(tab))

    total = query.count()
    rows = query.order_by(Document.created_at.desc()).offset(offset).limit(limit).all()

    count_query = db.query(Document.status, func.count(Document.id))
    if connected is not None:
        count_query = count_query.filter(Document.user_id.in_(connected))
    raw_counts = dict(count_query.group_by(Document.status).all())

    counts = {"all": sum(raw_counts.values())}
    for tab_name in TABS[1:]:
        counts[tab_name] = raw_counts.get(DocumentStatus(tab_name), 0)

    return DocumentReviewListResponse(
        items=[_row(document, user) for document, user in rows],
        total=total,
        counts=counts,
        limit=limit,
        offset=offset,
        has_more=offset + len(rows) < total,
    )


def _get_document(admin: AdminContext, document_id: int) -> tuple[Document, User]:
    row = (
        admin.db.query(Document, User)
        .join(User, Document.user_id == User.id)
        .filter(Document.id == document_id)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    document, user = row
    connected = _connected_staff_ids(admin)
    if connected is not None and document.user_id not in {sid for (sid,) in connected}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document, user


@router.get("/{document_id}", response_model=DocumentReviewRow)
def get_document(
    document_id: int,
    admin: AdminContext = Depends(require_admin(AdminPermission.documents)),
):
    document, user = _get_document(admin, document_id)
    return _row(document, user)


@router.get("/{document_id}/file")
def preview_document(
    document_id: int,
    admin: AdminContext = Depends(require_admin(AdminPermission.documents)),
):
    """The Document Preview panel. Served inline so a PDF renders in-page."""
    document, _ = _get_document(admin, document_id)

    path = storage.resolve(document.file_path)
    if not path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File is missing from storage"
        )
    return FileResponse(
        path,
        media_type=document.content_type,
        headers={"Content-Disposition": f'inline; filename="{document.original_filename}"'},
    )


@router.post("/{document_id}/verify", response_model=DocumentReviewRow)
def verify_document(
    document_id: int,
    admin: AdminContext = Depends(require_admin(AdminPermission.documents)),
):
    """The Verify button."""
    document, user = _get_document(admin, document_id)

    if document.status == DocumentStatus.verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This document is already verified"
        )
    if document.expiry_date and document.expiry_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This document has expired and cannot be verified",
        )

    document.status = DocumentStatus.verified
    document.verified_at = datetime.now(timezone.utc)
    document.verified_by_id = admin.user.id
    document.rejection_reason = None

    notify(
        admin.db,
        user_id=user.id,
        category=NotificationCategory.document,
        title="Document verified",
        body=DOCUMENT_TYPE_LABELS.get(document.doc_type, document.doc_type.value),
        entity_type="document",
        entity_id=document.id,
        commit=False,
    )
    admin.db.commit()
    admin.db.refresh(document)
    return _row(document, user)


@router.post("/{document_id}/reject", response_model=DocumentReviewRow)
def reject_document(
    document_id: int,
    payload: RejectDocumentRequest,
    admin: AdminContext = Depends(require_admin(AdminPermission.documents)),
):
    """The Reject button. A reason is required — the staff member has to know
    what to fix before re-uploading."""
    document, user = _get_document(admin, document_id)

    if document.status == DocumentStatus.rejected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This document is already rejected"
        )

    document.status = DocumentStatus.rejected
    document.rejection_reason = payload.reason
    document.verified_at = None
    document.verified_by_id = admin.user.id

    notify(
        admin.db,
        user_id=user.id,
        category=NotificationCategory.document,
        title="Document needs attention",
        body=payload.reason,
        entity_type="document",
        entity_id=document.id,
        commit=False,
    )
    admin.db.commit()
    admin.db.refresh(document)
    return _row(document, user)
