"""Creating in-app notifications.

Rows are written synchronously with the action that caused them. Push delivery
would hang off the same call site once a provider is wired up.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.enums import NotificationCategory
from app.models.notification import Notification


def notify(
    db: Session,
    user_id: int,
    category: NotificationCategory,
    title: str,
    body: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    commit: bool = True,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        category=category,
        title=title,
        body=body,
        entity_type=entity_type,
        entity_id=entity_id,
    )
    db.add(notification)
    if commit:
        db.commit()
        db.refresh(notification)
    return notification
