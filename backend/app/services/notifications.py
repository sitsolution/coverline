"""Creating in-app notifications and dispatching push delivery.

Rows are written synchronously with the action that caused them.  After the
commit, push_service.deliver_push fires the Expo / Web Push channels in the
same request — failures there are logged and swallowed so the action is never
rolled back due to a broken push configuration.
"""

from typing import Optional

from sqlalchemy.orm import Session

from app.models.enums import NotificationCategory
from app.models.notification import Notification
from app.services.push_service import deliver_push


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
        # Fire push after the in-app row is committed so the data is durable
        # even if push delivery fails.
        deliver_push(
            db=db,
            user_id=user_id,
            title=title,
            body=body,
            entity_type=entity_type,
            entity_id=entity_id,
        )
    return notification
