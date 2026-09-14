"""Append-only activity log helper.

Call ``log_activity()`` before ``db.commit()`` so the log entry and the
main action commit together atomically.  Never commit inside this function.
"""

from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.enums import ActivityActionType, UserRole
from app.models.user import User


def log_activity(
    db: Session,
    *,
    actor: User,
    action: ActivityActionType,
    description: str,
    entity_type: str | None = None,
    entity_id: int | None = None,
    facility_id: int | None = None,
) -> None:
    """Add an immutable activity log entry to the current session.

    The caller is responsible for ``db.commit()``.
    """
    entry = ActivityLog(
        actor_id=actor.id,
        actor_name=actor.full_name,
        actor_role=actor.role,
        action=action,
        description=description,
        entity_type=entity_type,
        entity_id=entity_id,
        facility_id=facility_id,
    )
    db.add(entry)
