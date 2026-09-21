"""Super admin global search — GET /superadmin/search?q="""

from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.v1.endpoints.superadmin.deps import require_super_admin
from app.core.deps import get_db
from app.models.enums import UserRole
from app.models.facility import Facility, FacilityMember
from app.models.user import User
from app.schemas.base import CamelModel

router = APIRouter()

LIMIT = 5


# ── Response shapes ───────────────────────────────────────────────────────────

class UserResult(CamelModel):
    id: int
    name: str
    email: str
    role: str
    is_active: bool
    url: str = ""


class FacilityResult(CamelModel):
    id: int
    name: str
    facility_type: str
    city: str
    url: str = ""


class SearchResponse(CamelModel):
    query: str
    users: List[UserResult] = []
    facilities: List[FacilityResult] = []


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.get("/search", response_model=SearchResponse, tags=["superadmin: search"])
def superadmin_search(
    q: str = Query(..., min_length=2, max_length=100),
    db: Session = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    term = f"%{q.strip()}%"

    # ── Users ─────────────────────────────────────────────────────────────────
    user_rows = (
        db.query(User)
        .filter(
            User.role != UserRole.super_admin,
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
            ),
        )
        .limit(LIMIT)
        .all()
    )
    user_results = [
        UserResult(
            id=u.id,
            name=u.full_name,
            email=u.email,
            role=u.role.value,
            is_active=u.is_active,
            url=f"/superadmin/users",
        )
        for u in user_rows
    ]

    # ── Facilities ────────────────────────────────────────────────────────────
    facility_rows = (
        db.query(Facility)
        .filter(
            or_(
                Facility.name.ilike(term),
                Facility.city.ilike(term),
                Facility.area.ilike(term),
                Facility.contact_email.ilike(term),
            )
        )
        .limit(LIMIT)
        .all()
    )
    facility_results = [
        FacilityResult(
            id=f.id,
            name=f.name,
            facility_type=f.facility_type.value,
            city=f.city,
            url=f"/superadmin/facilities",
        )
        for f in facility_rows
    ]

    return SearchResponse(
        query=q,
        users=user_results,
        facilities=facility_results,
    )
