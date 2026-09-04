from typing import Iterable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_token
from app.models.enums import STAFF_ROLES, UserRole
from app.models.user import User

# auto_error=False so a missing header produces our own 401 shape rather than
# FastAPI's, keeping every auth failure consistent for the client.
bearer_scheme = HTTPBearer(auto_error=False)

CREDENTIALS_ERROR = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise CREDENTIALS_ERROR

    payload = decode_token(credentials.credentials, expected_type="access")
    if payload is None:
        raise CREDENTIALS_ERROR

    user_id = payload.get("sub")
    if user_id is None:
        raise CREDENTIALS_ERROR

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise CREDENTIALS_ERROR
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    return user


def get_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """For routes that require a completed OTP verification."""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please verify the code sent to you.",
        )
    return current_user


def require_roles(*roles: UserRole):
    allowed: Iterable[UserRole] = roles

    def _guard(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this resource",
            )
        return current_user

    return _guard


#: Doctor / nurse / OT tech / housekeeping — everyone who applies for shifts.
get_current_staff = require_roles(*STAFF_ROLES)

get_current_facility_admin = require_roles(UserRole.facility_admin, UserRole.super_admin)
