"""Super Admin facility management — /superadmin/facilities."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.api.v1.endpoints.superadmin.deps import require_super_admin
from app.core.deps import get_db
from app.core.security import hash_password
from app.models.enums import AdminPermission, FacilityRole, FacilityType, UserRole
from app.models.facility import Facility, FacilityMember
from app.models.user import User
from app.schemas.base import CamelModel

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────

class FacilityListItem(CamelModel):
    id: int
    name: str
    facility_type: FacilityType
    city: str
    area: Optional[str] = None
    contact_email: Optional[str] = None
    staff_count: int
    admin_contact: str
    created_at: datetime


class FacilityListResponse(CamelModel):
    items: List[FacilityListItem]
    total: int


class MemberItem(CamelModel):
    id: int
    user_id: int
    full_name: str
    email: str
    facility_role: str
    joined_at: Optional[datetime] = None


class FacilityDetail(FacilityListItem):
    state: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    members: List[MemberItem] = []


class CreateFacilityBody(CamelModel):
    # Facility details
    name: str
    facility_type: FacilityType
    city: str
    area: Optional[str] = None
    state: Optional[str] = None
    # Admin account
    admin_full_name: str
    admin_email: str
    admin_phone: Optional[str] = None
    admin_password: str


class UpdateFacilityBody(CamelModel):
    name: Optional[str] = None
    facility_type: Optional[FacilityType] = None
    city: Optional[str] = None
    area: Optional[str] = None
    state: Optional[str] = None
    contact_email: Optional[str] = None
    description: Optional[str] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _build_item(fac: Facility, staff_count: int, admin_contact: str) -> FacilityListItem:
    return FacilityListItem(
        id=fac.id,
        name=fac.name,
        facility_type=fac.facility_type,
        city=fac.city,
        area=fac.area,
        contact_email=fac.contact_email,
        staff_count=staff_count,
        admin_contact=admin_contact,
        created_at=fac.created_at,
    )


def _enrich(db: Session, facilities: list[Facility]) -> List[FacilityListItem]:
    """Attach staff_count and admin_contact for each facility in one pass."""
    if not facilities:
        return []

    fids = [f.id for f in facilities]

    # Total member count per facility
    count_rows = (
        db.query(FacilityMember.facility_id, func.count(FacilityMember.id).label("cnt"))
        .filter(FacilityMember.facility_id.in_(fids))
        .group_by(FacilityMember.facility_id)
        .all()
    )
    staff_counts: dict[int, int] = {fid: cnt for fid, cnt in count_rows}

    # First member's user name per facility (ordered by member id)
    member_rows = (
        db.query(FacilityMember.facility_id, User.full_name)
        .join(User, FacilityMember.user_id == User.id)
        .filter(FacilityMember.facility_id.in_(fids))
        .order_by(FacilityMember.facility_id, FacilityMember.id)
        .all()
    )
    admin_contacts: dict[int, str] = {}
    for fid, fname in member_rows:
        admin_contacts.setdefault(fid, fname)

    return [
        _build_item(fac, staff_counts.get(fac.id, 0), admin_contacts.get(fac.id, "—"))
        for fac in facilities
    ]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=FacilityListResponse)
def list_facilities(
    _: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    facility_type: Optional[FacilityType] = Query(None),
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    sort_by: Optional[str] = Query(None, alias="sortBy", pattern="^(name|city|created_at)$"),
    sort_order: Optional[str] = Query("desc", alias="sortOrder", pattern="^(asc|desc)$"),
):
    query = db.query(Facility)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(Facility.name.ilike(pattern), Facility.contact_email.ilike(pattern))
        )
    if city:
        query = query.filter(Facility.city.ilike(f"%{city}%"))
    if facility_type:
        query = query.filter(Facility.facility_type == facility_type)

    total = query.count()
    desc = sort_order == "desc"
    if sort_by == "name":
        order_col = Facility.name.desc() if desc else Facility.name.asc()
    elif sort_by == "city":
        order_col = Facility.city.desc() if desc else Facility.city.asc()
    else:
        order_col = Facility.created_at.desc() if desc else Facility.created_at.asc()
    facilities = query.order_by(order_col).offset(offset).limit(limit).all()

    items = _enrich(db, facilities)
    return FacilityListResponse(items=items, total=total)


@router.get("/{facility_id}", response_model=FacilityDetail)
def get_facility(
    facility_id: int,
    _: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

    items = _enrich(db, [facility])
    base = items[0]

    member_rows = (
        db.query(FacilityMember, User)
        .join(User, FacilityMember.user_id == User.id)
        .filter(FacilityMember.facility_id == facility_id)
        .order_by(FacilityMember.id)
        .all()
    )
    members = [
        MemberItem(
            id=m.id,
            user_id=m.user_id,
            full_name=u.full_name,
            email=u.email,
            facility_role=m.facility_role.value if hasattr(m.facility_role, "value") else m.facility_role,
            joined_at=m.accepted_at or m.created_at,
        )
        for m, u in member_rows
    ]

    return FacilityDetail(
        **base.model_dump(),
        state=facility.state,
        address=facility.address,
        description=facility.description,
        members=members,
    )


@router.post("", response_model=FacilityListItem, status_code=status.HTTP_201_CREATED)
def create_facility(
    body: CreateFacilityBody,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    # Check admin email not already taken
    if db.query(User).filter(User.email == body.admin_email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Create facility
    facility = Facility(
        name=body.name,
        facility_type=body.facility_type,
        city=body.city,
        area=body.area,
        state=body.state,
        contact_email=body.admin_email,
        created_by_id=current_user.id,
    )
    db.add(facility)
    db.flush()

    # Create facility admin user
    admin_user = User(
        full_name=body.admin_full_name,
        email=body.admin_email,
        phone=body.admin_phone,
        hashed_password=hash_password(body.admin_password),
        role=UserRole.facility_admin,
        is_active=True,
        is_verified=True,
    )
    db.add(admin_user)
    db.flush()

    # Link admin to facility with full permissions
    db.add(FacilityMember(
        facility_id=facility.id,
        user_id=admin_user.id,
        facility_role=FacilityRole.super_admin,
        permissions=",".join(p.value for p in AdminPermission),
        accepted_at=None,
    ))

    db.commit()
    db.refresh(facility)

    items = _enrich(db, [facility])
    return items[0]


@router.put("/{facility_id}", response_model=FacilityListItem)
def update_facility(
    facility_id: int,
    body: UpdateFacilityBody,
    _: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

    if body.name is not None:
        facility.name = body.name
    if body.facility_type is not None:
        facility.facility_type = body.facility_type
    if body.city is not None:
        facility.city = body.city
    if body.area is not None:
        facility.area = body.area
    if body.state is not None:
        facility.state = body.state
    if body.contact_email is not None:
        facility.contact_email = body.contact_email
    if body.description is not None:
        facility.description = body.description

    db.commit()
    db.refresh(facility)

    items = _enrich(db, [facility])
    return items[0]
