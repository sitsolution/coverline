import secrets
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.admin import AdminContext, get_admin, require_admin
from app.core.config import settings as app_settings
from app.core.security import hash_password
from app.models.enums import AdminPermission, FacilityRole, UserRole
from app.models.facility import Facility, FacilityMember
from app.models.user import User, UserSettings
from app.schemas.admin.settings import (
    AdminUserInvite,
    AdminUserInviteResponse,
    AdminUserRow,
    AdminUserUpdate,
    FacilityProfileOut,
    FacilityProfileUpdate,
    PermissionOption,
)
from app.schemas.base import MessageResponse
from app.services import otp as otp_service

router = APIRouter()

PERMISSION_LABELS = {
    AdminPermission.shifts: "Shifts",
    AdminPermission.staff: "Staff",
    AdminPermission.bookings: "Bookings",
    AdminPermission.documents: "Documents",
    AdminPermission.reports: "Reports",
    AdminPermission.billing: "Billing",
}


def _facility_out(facility: Facility) -> FacilityProfileOut:
    return FacilityProfileOut(
        id=facility.id,
        name=facility.name,
        facility_type=facility.facility_type,
        city=facility.city,
        area=facility.area,
        state=facility.state,
        address=facility.address,
        contact_email=facility.contact_email,
        description=facility.description,
        logo_url=facility.logo_url,
        rating=float(facility.rating or 0),
    )


def _resolve_facility(admin: AdminContext, facility_id: Optional[int]) -> Facility:
    target = facility_id or admin.primary_facility_id
    if target is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No facility selected"
        )
    admin.assert_facility(target)

    facility = admin.db.query(Facility).filter(Facility.id == target).first()
    if facility is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")
    return facility


@router.get("/facility", response_model=FacilityProfileOut)
def get_facility(
    admin: AdminContext = Depends(get_admin),
    facility_id: Optional[int] = Query(None, alias="facilityId"),
):
    """Settings → Facility Profile."""
    return _facility_out(_resolve_facility(admin, facility_id))


@router.patch("/facility", response_model=FacilityProfileOut)
def update_facility(
    payload: FacilityProfileUpdate,
    admin: AdminContext = Depends(get_admin),
    facility_id: Optional[int] = Query(None, alias="facilityId"),
):
    """'Save Changes' on the Facility Profile form."""
    facility = _resolve_facility(admin, facility_id)

    member = (
        admin.db.query(FacilityMember)
        .filter(
            FacilityMember.facility_id == facility.id,
            FacilityMember.user_id == admin.user.id,
        )
        .first()
    )
    # Editing the facility itself is an owner-level action, not a per-screen
    # permission, so it is gated on the facility role instead.
    if not admin.is_platform_admin and (
        member is None or member.facility_role != FacilityRole.super_admin
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a facility super admin can edit the facility profile",
        )

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(facility, field, value)
    admin.db.commit()
    admin.db.refresh(facility)
    return _facility_out(facility)


@router.get("/permissions", response_model=List[PermissionOption])
def list_permissions(admin: AdminContext = Depends(get_admin)):
    """Populates the checkbox list on Add Admin User."""
    return [
        PermissionOption(value=permission, label=label)
        for permission, label in PERMISSION_LABELS.items()
    ]


def _member_row(member: FacilityMember, user: User) -> AdminUserRow:
    return AdminUserRow(
        id=user.id,
        member_id=member.id,
        name=user.full_name,
        email=user.email,
        phone=user.phone,
        facility_role=member.facility_role,
        permissions=member.permission_list,
        is_active=user.is_active,
        accepted_at=member.accepted_at,
        invited_at=member.created_at,
    )


@router.get("/users", response_model=List[AdminUserRow])
def list_admin_users(
    admin: AdminContext = Depends(get_admin),
    facility_id: Optional[int] = Query(None, alias="facilityId"),
):
    """Settings → Users & Permissions."""
    facility = _resolve_facility(admin, facility_id)

    rows = (
        admin.db.query(FacilityMember, User)
        .join(User, FacilityMember.user_id == User.id)
        .filter(FacilityMember.facility_id == facility.id)
        .order_by(FacilityMember.created_at.asc())
        .all()
    )
    return [_member_row(member, user) for member, user in rows]


def _assert_can_manage_members(admin: AdminContext, facility_id: int) -> None:
    if admin.is_platform_admin:
        return
    member = (
        admin.db.query(FacilityMember)
        .filter(
            FacilityMember.facility_id == facility_id,
            FacilityMember.user_id == admin.user.id,
        )
        .first()
    )
    if member is None or member.facility_role != FacilityRole.super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only a facility super admin can manage admin users",
        )


@router.post("/users", response_model=AdminUserInviteResponse, status_code=status.HTTP_201_CREATED)
def invite_admin_user(
    payload: AdminUserInvite,
    admin: AdminContext = Depends(get_admin),
):
    """'Send Invitation' on Add Admin User.

    Creates the account with an unusable random password and issues a one-time
    token; the invitee sets their own password via `/auth/accept-invitation`.
    No password is ever chosen on their behalf.
    """
    db = admin.db
    facility = _resolve_facility(admin, payload.facility_id)
    _assert_can_manage_members(admin, facility.id)

    user = db.query(User).filter(User.email == payload.email).first()

    if user is not None:
        if user.role not in (UserRole.facility_admin, UserRole.super_admin):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That email belongs to a staff account and cannot be an admin",
            )
        already = (
            db.query(FacilityMember)
            .filter(
                FacilityMember.facility_id == facility.id,
                FacilityMember.user_id == user.id,
            )
            .first()
        )
        if already is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That person is already an admin on this facility",
            )
    else:
        user = User(
            email=payload.email,
            phone=payload.phone,
            full_name=payload.full_name,
            # Unusable until the invitation is accepted.
            hashed_password=hash_password(secrets.token_urlsafe(32)),
            role=UserRole.facility_admin,
            is_verified=False,
        )
        db.add(user)
        db.flush()
        db.add(UserSettings(user_id=user.id))

    member = FacilityMember(
        facility_id=facility.id,
        user_id=user.id,
        facility_role=payload.facility_role,
        permissions=",".join(p.value for p in payload.permissions) or None,
        invited_by_id=admin.user.id,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    db.refresh(user)

    token = otp_service.issue_reset_token(db, user)
    row = _member_row(member, user)
    return AdminUserInviteResponse(
        **row.model_dump(by_alias=False),
        debug_invitation_token=token if app_settings.expose_otp else None,
    )


@router.patch("/users/{member_id}", response_model=AdminUserRow)
def update_admin_user(
    member_id: int,
    payload: AdminUserUpdate,
    admin: AdminContext = Depends(get_admin),
):
    db = admin.db
    member = db.query(FacilityMember).filter(FacilityMember.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")

    admin.assert_facility(member.facility_id)
    _assert_can_manage_members(admin, member.facility_id)

    if member.user_id == admin.user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot change your own access",
        )

    data = payload.model_dump(exclude_unset=True)
    if "facility_role" in data:
        member.facility_role = data["facility_role"]
    if "permissions" in data:
        member.permissions = ",".join(
            p.value if hasattr(p, "value") else str(p) for p in data["permissions"]
        ) or None

    user = db.query(User).filter(User.id == member.user_id).first()
    if "is_active" in data:
        user.is_active = data["is_active"]

    db.commit()
    db.refresh(member)
    return _member_row(member, user)


@router.delete("/users/{member_id}", response_model=MessageResponse)
def remove_admin_user(
    member_id: int,
    admin: AdminContext = Depends(get_admin),
):
    """Removes someone's access to this facility. The user account survives —
    they may still administer another facility."""
    db = admin.db
    member = db.query(FacilityMember).filter(FacilityMember.id == member_id).first()
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin user not found")

    admin.assert_facility(member.facility_id)
    _assert_can_manage_members(admin, member.facility_id)

    if member.user_id == admin.user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own access",
        )

    remaining = (
        db.query(FacilityMember)
        .filter(
            FacilityMember.facility_id == member.facility_id,
            FacilityMember.facility_role == FacilityRole.super_admin,
            FacilityMember.id != member.id,
        )
        .count()
    )
    if member.facility_role == FacilityRole.super_admin and remaining == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A facility must keep at least one super admin",
        )

    db.delete(member)
    db.commit()
    return MessageResponse(message="Admin access removed")
