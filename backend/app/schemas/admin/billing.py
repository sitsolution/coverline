from datetime import date, datetime
from typing import List, Optional

from pydantic import Field

from app.models.enums import InvoiceStatus
from app.schemas.base import CamelModel
from app.schemas.admin.dashboard import KpiCard


class InvoiceLineOut(CamelModel):
    id: int
    description: str
    quantity: float
    unit_amount: float
    amount: float
    shift_id: Optional[int] = None


class InvoiceRow(CamelModel):
    id: int
    number: str
    issued_on: date
    due_on: date
    total: float
    status: InvoiceStatus          # already resolved to `overdue` when past due
    paid_at: Optional[datetime] = None


class InvoiceDetail(InvoiceRow):
    facility_name: str
    period_start: date
    period_end: date
    subtotal: float
    tax: float
    notes: Optional[str] = None
    line_items: List[InvoiceLineOut] = []


class PaymentMethodOut(CamelModel):
    id: int
    label: str
    last4: str
    method_type: str
    is_primary: bool


class InvoiceListResponse(CamelModel):
    items: List[InvoiceRow]
    total: int
    counts: dict[str, int]
    kpis: List[KpiCard]
    payment_method: Optional[PaymentMethodOut] = None


class PayInvoiceRequest(CamelModel):
    payment_method_id: Optional[int] = None
    reference: Optional[str] = Field(default=None, max_length=80)
