"""Authorisation for the admin panel.

Two rules govern every admin endpoint:

1. **Facility scoping.** A facility admin only ever sees data belonging to the
   facilities they are a member of. A platform ``super_admin`` is unscoped.
2. **Permissions.** Each admin screen maps to an :class:`AdminPermission`; a
   member must hold it. A facility ``super_admin`` implicitly holds all of them.

Both are enforced here rather than in each handler, so a new endpoint cannot
forget them: it must declare the permission it needs to get a context at all.
"""

from dataclasses import dataclass
from typing import List, Optional, Sequence

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.enums import AdminPermission, UserRole
from app.models.facility import Facility, FacilityMember
from app.models.user import User


@dataclass
class AdminContext:
    """Who is acting, and over which facilities."""

    user: User
    db: Session
    #: None means unscoped (platform super_admin). Otherwise the facilities the
    #: user administers — never empty, since a member with none is rejected.
    facility_ids: Optional[List[int]]
    permissions: List[str]

    @property
    def is_platform_admin(self) -> bool:
        return self.facility_ids is None

    def can(self, permission: AdminPermission) -> bool:
        return self.is_platform_admin or permission.value in self.permissions

    def scope(self, query, column):
        """Constrain a query to this admin's facilities.

        ``column`` is whichever column holds the facility id on the entity being
        queried (e.g. ``Shift.facility_id``).
        """
        if self.is_platform_admin:
            return query
        return query.filter(column.in_(self.facility_ids))

    def assert_facility(self, facility_id: int) -> None:
        """Guard a facility id that arrived from the client."""
        if self.is_platform_admin:
            return
        if facility_id not in self.facility_ids:
            # 404 rather than 403: a facility the caller cannot see should not
            # be confirmed to exist.
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Not found"
            )

    @property
    def primary_facility_id(self) -> Optional[int]:
        return self.facility_ids[0] if self.facility_ids else None

    def primary_facility(self) -> Optional[Facility]:
        facility_id = self.primary_facility_id
        if facility_id is None:
            return None
        return self.db.query(Facility).filter(Facility.id == facility_id).first()


def require_admin(*permissions: AdminPermission):
    """Dependency factory: admin access, optionally gated on permissions."""

    def _resolve(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
    ) -> AdminContext:
        if current_user.role == UserRole.super_admin:
            return AdminContext(
                user=current_user,
                db=db,
                facility_ids=None,
                permissions=[p.value for p in AdminPermission],
            )

        if current_user.role != UserRole.facility_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin panel access is restricted to facility administrators",
            )

        members: Sequence[FacilityMember] = (
            db.query(FacilityMember).filter(FacilityMember.user_id == current_user.id).all()
        )
        if not members:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is not linked to any facility",
            )

        granted: set[str] = set()
        for member in members:
            granted.update(member.permission_list)

        context = AdminContext(
            user=current_user,
            db=db,
            facility_ids=[member.facility_id for member in members],
            permissions=sorted(granted),
        )

        for permission in permissions:
            if not context.can(permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"You do not have the '{permission.value}' permission",
                )
        return context

    return _resolve


#: Any admin, no specific permission — dashboards, notifications, own settings.
get_admin = require_admin()
