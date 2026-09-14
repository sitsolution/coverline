"""Staff-facing activity endpoints — My Activity screen (2.11)."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.deps import get_current_staff
from app.models.activity_log import ActivityLog
from app.models.application import Application
from app.models.enums import ApplicationStatus
from app.models.shift import Shift
from app.models.user import User
from app.schemas.activity_log import ActivityLogItem, ActivityLogResponse, ActivityStats

router = APIRouter()


@router.get("/me/stats", response_model=ActivityStats)
def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff),
):
    """Stats grid: Shifts Completed · Hours Worked · Pending Applications · Completion Rate."""
    completed = (
        db.query(Application)
        .options(joinedload(Application.shift))
        .filter(
            Application.staff_id == current_user.id,
            Application.status == ApplicationStatus.completed,
        )
        .all()
    )
    pending_count = (
        db.query(Application)
        .filter(
            Application.staff_id == current_user.id,
            Application.status == ApplicationStatus.pending,
        )
        .count()
    )
    cancelled_count = (
        db.query(Application)
        .filter(
            Application.staff_id == current_user.id,
            Application.status.in_([ApplicationStatus.cancelled, ApplicationStatus.rejected]),
        )
        .count()
    )

    shifts_completed = len(completed)
    hours_worked = round(
        sum(a.shift.duration_hours for a in completed if a.shift), 1
    )

    total_closed = shifts_completed + cancelled_count
    completion_rate = (
        round((shifts_completed / total_closed) * 100, 1) if total_closed > 0 else 0.0
    )

    return ActivityStats(
        shifts_completed=shifts_completed,
        hours_worked=hours_worked,
        pending_applications=pending_count,
        completion_rate=completion_rate,
    )


@router.get("/me", response_model=ActivityLogResponse)
def get_my_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Chronological activity feed on the My Activity screen.

    Shows recent actions: shift applied, shift completed, document uploaded,
    availability updated.  Oldest offset-based pagination via "View Full
    Activity History".
    """
    query = db.query(ActivityLog).filter(ActivityLog.actor_id == current_user.id)
    total = query.count()
    items = (
        query
        .order_by(ActivityLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return ActivityLogResponse(
        items=[ActivityLogItem.model_validate(item) for item in items],
        total=total,
        has_more=offset + len(items) < total,
    )
