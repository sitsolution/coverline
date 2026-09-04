from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.support import Faq, SupportTicket
from app.models.user import User
from app.schemas.support import (
    FaqListResponse,
    FaqOut,
    SupportTicketCreate,
    SupportTicketOut,
)

router = APIRouter()


@router.get("/faqs", response_model=FaqListResponse)
def list_faqs(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Matches the FAQ search box"),
    category: Optional[str] = None,
):
    """Help & Support FAQs. Public — the screen is reachable before login."""
    query = db.query(Faq).filter(Faq.is_published.is_(True))

    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(Faq.question.ilike(term), Faq.answer.ilike(term)))
    if category:
        query = query.filter(Faq.category == category)

    faqs = query.order_by(Faq.sort_order.asc(), Faq.id.asc()).all()
    return FaqListResponse(
        items=[FaqOut.model_validate(f) for f in faqs],
        total=len(faqs),
    )


@router.post("/tickets", response_model=SupportTicketOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """'Contact Support' / 'Report a Bug'."""
    ticket = SupportTicket(
        user_id=current_user.id, subject=payload.subject, message=payload.message
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return SupportTicketOut.model_validate(ticket)


@router.get("/tickets", response_model=list[SupportTicketOut])
def list_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.user_id == current_user.id)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )
    return [SupportTicketOut.model_validate(t) for t in tickets]
