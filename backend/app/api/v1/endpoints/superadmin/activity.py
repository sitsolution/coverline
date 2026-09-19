"""Super Admin activity log — GET /superadmin/activity.

Returns the full platform-wide activity log (no facility_id scope).
Adds facilityName to each row by joining Facility on facility_id.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.superadmin.deps import require_super_admin
from app.core.deps import get_db
from app.models.activity_log import ActivityLog
from app.models.enums import ActivityActionType, UserRole
from app.models.facility import Facility
from app.models.user import User
from app.schemas.base import CamelModel

router = APIRouter()

# Filter chip → entity_type stored in activity_logs rows
_CATEGORY_TO_ENTITY: dict[str, str] = {
    "shifts": "shift",
    "bookings": "application",
    "documents": "document",
    "users": "user",
}


# ── Schemas ───────────────────────────────────────────────────────────────────

class SuperAdminActivityItem(CamelModel):
    id: int
    actor_name: str
    actor_role: UserRole
    action: ActivityActionType
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    facility_id: Optional[int] = None
    facility_name: Optional[str] = None
    description: str
    created_at: datetime


class SuperAdminActivityResponse(CamelModel):
    items: List[SuperAdminActivityItem]
    total: int
    has_more: bool


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.get("", response_model=SuperAdminActivityResponse)
def list_activity(
    _: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: Optional[str] = Query(None, alias="sortBy", pattern="^(timestamp|actor)$"),
    sort_order: Optional[str] = Query("desc", alias="sortOrder", pattern="^(asc|desc)$"),
):
    """Platform-wide activity log. No facility scope — super admin sees everything."""
    query = db.query(ActivityLog)

    if category and category != "all":
        entity = _CATEGORY_TO_ENTITY.get(category)
        if entity:
            query = query.filter(ActivityLog.entity_type == entity)

    total = query.count()
    desc = sort_order == "desc"
    if sort_by == "actor":
        order_col = ActivityLog.actor_name.desc() if desc else ActivityLog.actor_name.asc()
    else:
        order_col = ActivityLog.created_at.desc() if desc else ActivityLog.created_at.asc()
    logs = (
        query
        .order_by(order_col)
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Resolve facility names in a single query
    facility_ids = list({log.facility_id for log in logs if log.facility_id})
    facility_names: dict[int, str] = {}
    if facility_ids:
        rows = (
            db.query(Facility.id, Facility.name)
            .filter(Facility.id.in_(facility_ids))
            .all()
        )
        facility_names = {fid: fname for fid, fname in rows}

    items = [
        SuperAdminActivityItem(
            id=log.id,
            actor_name=log.actor_name,
            actor_role=log.actor_role,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            facility_id=log.facility_id,
            facility_name=facility_names.get(log.facility_id) if log.facility_id else None,
            description=log.description,
            created_at=log.created_at,
        )
        for log in logs
    ]

    return SuperAdminActivityResponse(
        items=items,
        total=total,
        has_more=offset + len(items) < total,
    )
