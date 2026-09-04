"""Helpers for building test data directly against the ORM."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.enums import FacilityType, PaymentStatus, ShiftStatus, UserRole
from app.models.facility import Facility
from app.models.payment import Payment
from app.models.shift import Shift


def make_facility(db: Session, name: str = "Apollo Hospital", city: str = "Pune") -> Facility:
    facility = Facility(
        name=name,
        facility_type=FacilityType.hospital,
        city=city,
        area="Kothrud",
        rating=Decimal("4.6"),
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


def make_shift(
    db: Session,
    facility: Facility,
    *,
    role: UserRole = UserRole.doctor,
    specialty: str = "Emergency Med.",
    days_ahead: int = 3,
    start_hour: int = 9,
    hours: int = 8,
    pay: int = 9500,
    urgent: bool = False,
    slots: int = 1,
    status: ShiftStatus = ShiftStatus.open,
) -> Shift:
    start = (datetime.now(timezone.utc) + timedelta(days=days_ahead)).replace(
        hour=start_hour, minute=0, second=0, microsecond=0
    )
    shift = Shift(
        facility_id=facility.id,
        role=role,
        specialty=specialty,
        title=f"{specialty} shift",
        start_time=start,
        end_time=start + timedelta(hours=hours),
        pay_rate=Decimal(str(pay)),
        slots=slots,
        status=status,
        is_urgent=urgent,
        requirements="BLS certification required.",
        amenities="On-call room,Meals provided",
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


def make_payment(
    db: Session,
    user_id: int,
    shift: Shift,
    *,
    amount: int = 9500,
    status: PaymentStatus = PaymentStatus.paid,
    days_ago: int = 5,
) -> Payment:
    earned = datetime.now(timezone.utc) - timedelta(days=days_ago)
    payment = Payment(
        user_id=user_id,
        shift_id=shift.id,
        amount=Decimal(str(amount)),
        status=status,
        earned_at=earned,
        paid_at=earned + timedelta(days=1) if status == PaymentStatus.paid else None,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
