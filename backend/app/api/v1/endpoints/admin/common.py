"""Helpers shared by the admin endpoints."""

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.enums import ApplicationStatus, ShiftStatus
from app.models.shift import Shift
from app.models.user import User


def shift_reference(shift_id: int) -> str:
    """Human-facing shift id, as the tables display it."""
    return f"SH-{shift_id + 2000:04d}"


def booking_reference(application_id: int) -> str:
    return f"BK-{application_id + 8800:04d}"


def as_aware(value: datetime) -> datetime:
    """MySQL hands back naive datetimes; treat them as UTC."""
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def shift_display_status(shift: Shift, pending_count: int) -> str:
    """The Status column on Shift Management.

    The table shows five states but only four are stored: "Pending" is an open
    shift with applicants awaiting a decision, which is derived rather than
    persisted so a shift can never sit in a stale state.
    """
    if shift.status == ShiftStatus.cancelled:
        return "cancelled"
    if shift.status == ShiftStatus.completed:
        return "completed"
    if shift.status == ShiftStatus.draft:
        return "draft"
    if shift.slots_filled >= shift.slots:
        return "filled"
    if pending_count > 0:
        return "pending"
    return "open"


def booking_display_status(application: Application) -> str:
    """Bookings adds an "Upcoming" tab, which is a confirmed booking whose
    shift has not started yet."""
    if application.status == ApplicationStatus.confirmed:
        starts = as_aware(application.shift.start_time)
        return "upcoming" if starts > datetime.now(timezone.utc) else "confirmed"
    return application.status.value


def pending_counts_for(db: Session, shift_ids: List[int]) -> dict[int, int]:
    """Pending applicants per shift, in one query."""
    if not shift_ids:
        return {}
    from sqlalchemy import func

    rows = (
        db.query(Application.shift_id, func.count(Application.id))
        .filter(
            Application.shift_id.in_(shift_ids),
            Application.status == ApplicationStatus.pending,
        )
        .group_by(Application.shift_id)
        .all()
    )
    return {shift_id: count for shift_id, count in rows}


def assigned_staff_for(db: Session, shift_ids: List[int]) -> dict[int, List[str]]:
    """Confirmed staff names per shift, in one query."""
    if not shift_ids:
        return {}
    rows = (
        db.query(Application.shift_id, User.full_name)
        .join(User, Application.staff_id == User.id)
        .filter(
            Application.shift_id.in_(shift_ids),
            Application.status.in_([ApplicationStatus.confirmed, ApplicationStatus.completed]),
        )
        .all()
    )
    result: dict[int, List[str]] = {}
    for shift_id, name in rows:
        result.setdefault(shift_id, []).append(name)
    return result


def csv_or_none(values: Optional[List[str]]) -> Optional[str]:
    if values is None:
        return None
    return ", ".join(v.strip() for v in values if v and v.strip()) or None
