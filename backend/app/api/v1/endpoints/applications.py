from datetime import datetime, timezone
from zoneinfo import ZoneInfo

_IST = ZoneInfo("Asia/Kolkata")


def _now_ist() -> datetime:
    return datetime.now(_IST).replace(tzinfo=None)
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_staff
from app.models.application import Application
from app.models.enums import ActivityActionType, ApplicationStatus, NotificationCategory
from app.models.facility import FacilityMember
from app.models.payment import Payment
from app.models.shift import Shift
from app.models.user import User
from app.schemas.application import (
    ApplicationListResponse,
    ApplicationOut,
    CancelApplicationRequest,
)
from app.services import serializers
from app.services.activity_log import log_activity
from app.services.notifications import notify

router = APIRouter()

#: The My Applications screen's four tabs, and the statuses each covers.
TAB_STATUSES = {
    "pending": [ApplicationStatus.pending],
    "confirmed": [ApplicationStatus.confirmed],
    "completed": [ApplicationStatus.completed],
    "cancelled": [ApplicationStatus.cancelled, ApplicationStatus.rejected],
}


def _to_out(application: Application, payment: Payment | None = None) -> ApplicationOut:
    return ApplicationOut(
        id=application.id,
        status=application.status,
        applied_at=application.applied_at,
        responded_at=application.responded_at,
        cancelled_at=application.cancelled_at,
        cancellation_reason=application.cancellation_reason,
        can_cancel=serializers.can_cancel_application(application),
        shift=serializers.shift_item(
            application.shift, {application.shift_id: application.status.value}, set()
        ),
        payment_id=payment.id if payment else None,
        payment_status=payment.status.value if payment else None,
    )


@router.get("", response_model=ApplicationListResponse)
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff),
    tab: Optional[str] = Query(None, pattern="^(pending|confirmed|completed|cancelled)$"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """My Applications. ``counts`` populates the tab badges in one round trip."""
    base = (
        db.query(Application)
        .options(joinedload(Application.shift).joinedload(Shift.facility))
        .filter(Application.staff_id == current_user.id)
    )

    raw_counts = dict(
        db.query(Application.status, func.count(Application.id))
        .filter(Application.staff_id == current_user.id)
        .group_by(Application.status)
        .all()
    )
    counts = {
        tab_name: sum(raw_counts.get(s, 0) for s in statuses)
        for tab_name, statuses in TAB_STATUSES.items()
    }

    query = base.filter(Application.status.in_(TAB_STATUSES[tab])) if tab else base
    total = query.count()
    applications = query.order_by(Application.applied_at.desc()).offset(offset).limit(limit).all()

    # Fetch payments for all returned applications in one query
    app_ids = [a.id for a in applications]
    payments_by_app = {}
    if app_ids:
        for p in db.query(Payment).filter(Payment.application_id.in_(app_ids)).all():
            payments_by_app[p.application_id] = p

    return ApplicationListResponse(
        items=[_to_out(a, payments_by_app.get(a.id)) for a in applications],
        total=total,
        counts=counts,
    )


@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff),
):
    """The 'View Details' button on a pending application."""
    application = (
        db.query(Application)
        .options(joinedload(Application.shift).joinedload(Shift.facility))
        .filter(Application.id == application_id, Application.staff_id == current_user.id)
        .first()
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    payment = db.query(Payment).filter(Payment.application_id == application.id).first()
    return _to_out(application, payment)


@router.post("/{application_id}/cancel", response_model=ApplicationOut)
def cancel_application(
    application_id: int,
    payload: CancelApplicationRequest = CancelApplicationRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff),
):
    """'Cancel Application'. A confirmed shift frees its slot again."""
    application = (
        db.query(Application)
        .options(joinedload(Application.shift).joinedload(Shift.facility))
        .filter(Application.id == application_id, Application.staff_id == current_user.id)
        .first()
    )
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if application.status in (ApplicationStatus.cancelled, ApplicationStatus.completed):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A {application.status.value} application cannot be cancelled",
        )
    if not serializers.can_cancel_application(application):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This shift is too close to its start time to cancel. Contact support.",
        )

    was_confirmed = application.status == ApplicationStatus.confirmed
    application.status = ApplicationStatus.cancelled
    application.cancelled_at = _now_ist()
    application.cancellation_reason = payload.reason

    if was_confirmed:
        shift = application.shift
        shift.slots_filled = max(0, shift.slots_filled - 1)
        # Re-open a shift that had been filled by this now-cancelled booking.
        if shift.status.value == "filled" and shift.slots_filled < shift.slots:
            from app.models.enums import ShiftStatus
            shift.status = ShiftStatus.open

    # Activity log — visible in staff My Activity and admin Activity Log
    log_activity(
        db,
        actor=current_user,
        action=ActivityActionType.application_cancelled,
        description=(
            f"Cancelled application for {application.shift.specialty} at "
            f"{application.shift.facility.name} on "
            f"{application.shift.start_time.strftime('%d %b %Y')}"
        ),
        entity_type="application",
        entity_id=application.id,
        facility_id=application.shift.facility_id,
    )

    # Notify the staff member who cancelled
    notify(
        db,
        user_id=current_user.id,
        category=NotificationCategory.application,
        title="Application cancelled",
        body=f"{application.shift.facility.name} · {application.shift.specialty}",
        entity_type="shift",
        entity_id=application.shift_id,
        commit=False,
    )

    # Notify facility admins for both pending and confirmed cancellations
    admin_ids = [
        m.user_id
        for m in db.query(FacilityMember)
        .filter(FacilityMember.facility_id == application.shift.facility_id)
        .all()
    ]
    notif_title = "Booking cancelled by staff" if was_confirmed else "Application withdrawn by staff"
    for admin_id in admin_ids:
        notify(
            db,
            user_id=admin_id,
            category=NotificationCategory.application,
            title=notif_title,
            body=f"{current_user.full_name} · {application.shift.specialty}",
            entity_type="application",
            entity_id=application.id,
            commit=False,
        )

    db.commit()
    db.refresh(application)
    return _to_out(application)
