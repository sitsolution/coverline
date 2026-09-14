"""Super Admin roles & permissions — /superadmin/roles."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.v1.endpoints.superadmin.deps import require_super_admin
from app.core.deps import get_db
from app.models.enums import FacilityRole, UserRole
from app.models.facility import FacilityMember
from app.models.role_permission import RolePermission
from app.models.user import User
from app.schemas.base import CamelModel

router = APIRouter()

# Order matches the client design table
_ROLE_ORDER = [
    "super_admin",
    "facility_admin_manager",
    "facility_admin_staff",
    "doctor",
    "nurse",
    "ot_tech",
    "housekeeping",
]


# ── Schemas ───────────────────────────────────────────────────────────────────

class PermissionSet(CamelModel):
    view_shifts: bool
    create_edit_shifts: bool
    view_staff_directory: bool
    manage_bookings: bool
    verify_documents: bool
    view_reports: bool
    manage_facility_settings: bool
    manage_users: bool


class RolePermissionItem(CamelModel):
    role_key: str
    display_name: str
    scope: str
    user_count: int
    is_super_admin: bool
    permissions: PermissionSet


class RolePermissionsListResponse(CamelModel):
    roles: List[RolePermissionItem]


class UpdateRolePermissionsRequest(PermissionSet):
    pass


# ── Helpers ───────────────────────────────────────────────────────────────────

def _live_user_counts(db: Session) -> dict:
    """Compute live user counts keyed by our role_key strings."""
    rows = (
        db.query(User.role, func.count(User.id).label("cnt"))
        .group_by(User.role)
        .all()
    )
    counts: dict = {}
    fa_total = 0
    for role, cnt in rows:
        key = role.value if hasattr(role, "value") else str(role)
        counts[key] = cnt
        if key == UserRole.facility_admin.value:
            fa_total = cnt

    # Split facility_admin into manager vs staff via FacilityMember.facility_role.
    # Founding admins (FacilityRole.super_admin = facility owner) are Manager-level.
    manager_count = (
        db.query(func.count(FacilityMember.id))
        .join(User, FacilityMember.user_id == User.id)
        .filter(
            User.role == UserRole.facility_admin,
            FacilityMember.facility_role.in_([FacilityRole.super_admin, FacilityRole.manager]),
        )
        .scalar()
        or 0
    )
    staff_count = (
        db.query(func.count(FacilityMember.id))
        .join(User, FacilityMember.user_id == User.id)
        .filter(
            User.role == UserRole.facility_admin,
            FacilityMember.facility_role == FacilityRole.staff,
        )
        .scalar()
        or 0
    )
    counts["facility_admin_manager"] = manager_count
    counts["facility_admin_staff"] = staff_count

    return counts


def _row_to_item(row: RolePermission, user_count: int) -> RolePermissionItem:
    return RolePermissionItem(
        role_key=row.role_key,
        display_name=row.display_name,
        scope=row.scope,
        user_count=user_count,
        is_super_admin=row.role_key == "super_admin",
        permissions=PermissionSet(
            view_shifts=row.view_shifts,
            create_edit_shifts=row.create_edit_shifts,
            view_staff_directory=row.view_staff_directory,
            manage_bookings=row.manage_bookings,
            verify_documents=row.verify_documents,
            view_reports=row.view_reports,
            manage_facility_settings=row.manage_facility_settings,
            manage_users=row.manage_users,
        ),
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=RolePermissionsListResponse)
def list_roles(
    _: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """Return all 7 platform roles with live user counts and current permissions."""
    rows = {r.role_key: r for r in db.query(RolePermission).all()}
    counts = _live_user_counts(db)
    roles = [
        _row_to_item(rows[key], counts.get(key, 0))
        for key in _ROLE_ORDER
        if key in rows
    ]
    return RolePermissionsListResponse(roles=roles)


@router.put("/{role_key}", response_model=RolePermissionItem)
def update_role_permissions(
    role_key: str,
    body: UpdateRolePermissionsRequest,
    _: User = Depends(require_super_admin),
    db: Session = Depends(get_db),
):
    """Update the 8 module permission flags for a role.

    ``super_admin`` is read-only — always has all permissions.
    """
    if role_key == "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super Admin permissions cannot be modified.",
        )

    row = (
        db.query(RolePermission)
        .filter(RolePermission.role_key == role_key)
        .first()
    )
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found.")

    row.view_shifts = body.view_shifts
    row.create_edit_shifts = body.create_edit_shifts
    row.view_staff_directory = body.view_staff_directory
    row.manage_bookings = body.manage_bookings
    row.verify_documents = body.verify_documents
    row.view_reports = body.view_reports
    row.manage_facility_settings = body.manage_facility_settings
    row.manage_users = body.manage_users

    db.commit()
    db.refresh(row)

    counts = _live_user_counts(db)
    return _row_to_item(row, counts.get(role_key, 0))
