"""Admin activity log endpoint — Activity Log page (3.16)."""

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.core.admin import AdminContext, require_admin
from app.models.activity_log import ActivityLog
from app.models.enums import AdminPermission
from app.schemas.activity_log import ActivityLogItem, ActivityLogResponse

router = APIRouter()

# Filter chip → entity_type stored in activity_logs rows
_CATEGORY_TO_ENTITY: dict[str, str] = {
    "shifts": "shift",
    "bookings": "application",
    "documents": "document",
    "users": "user",
}


@router.get("", response_model=ActivityLogResponse)
def list_activity(
    admin: AdminContext = Depends(require_admin(AdminPermission.activity_log)),
    category: Optional[str] = Query(
        None, pattern="^(all|shifts|bookings|documents|users)$"
    ),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Activity Log page — filter chips: All · Shifts · Bookings · Documents · Users.

    Facility admins see only their own facility's log.
    Super admins (is_platform_admin) see the full platform log.
    """
    db = admin.db
    query = db.query(ActivityLog)

    if not admin.is_platform_admin:
        query = query.filter(ActivityLog.facility_id.in_(admin.facility_ids))

    if category and category != "all":
        query = query.filter(ActivityLog.entity_type == _CATEGORY_TO_ENTITY[category])

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
