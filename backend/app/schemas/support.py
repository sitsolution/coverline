from datetime import datetime
from typing import List, Optional

from pydantic import Field

from app.models.enums import TicketStatus
from app.schemas.base import CamelModel


class FaqOut(CamelModel):
    id: int
    question: str
    answer: str
    category: Optional[str] = None


class FaqListResponse(CamelModel):
    items: List[FaqOut]
    total: int


class SupportTicketCreate(CamelModel):
    subject: str = Field(min_length=3, max_length=255)
    message: str = Field(min_length=10)


class SupportTicketOut(CamelModel):
    id: int
    subject: str
    message: str
    status: TicketStatus
    created_at: datetime
    resolved_at: Optional[datetime] = None
