from datetime import date, datetime
from typing import List, Optional

from pydantic import Field

from app.models.enums import PaymentStatus, PayoutStatus
from app.schemas.base import CamelModel


class EarningsSummary(CamelModel):
    """The gradient hero card on the Earnings screen."""

    total_earnings: float
    this_month: float
    pending: float
    available_to_withdraw: float
    next_payout_date: Optional[date] = None
    currency: str = "INR"


class TrendPoint(CamelModel):
    """One bar in the Earnings Trend chart."""

    label: str          # "Mar", "Apr", …
    period_start: date
    amount: float


class TransactionOut(CamelModel):
    id: int
    facility_name: Optional[str] = None
    facility_initials: Optional[str] = None
    specialty: Optional[str] = None
    amount: float
    status: PaymentStatus
    earned_at: datetime
    paid_at: Optional[datetime] = None
    reference: Optional[str] = None


class TransactionListResponse(CamelModel):
    items: List[TransactionOut]
    total: int
    limit: int
    offset: int
    has_more: bool


class PayoutRequestCreate(CamelModel):
    amount: Optional[float] = Field(default=None, gt=0,
                                    description="Omit to withdraw the full available balance")


class PayoutRequestOut(CamelModel):
    id: int
    amount: float
    status: PayoutStatus
    requested_at: datetime
    processed_at: Optional[datetime] = None
    reference: Optional[str] = None
