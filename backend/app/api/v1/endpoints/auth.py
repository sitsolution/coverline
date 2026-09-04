from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.availability import Availability, ShiftPreference
from app.models.enums import STAFF_ROLES, OtpPurpose, UserRole
from app.models.facility import Facility, FacilityMember
from app.models.user import StaffProfile, User, UserSettings
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    OtpSentResponse,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    ResendOtpRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyOtpRequest,
)
from app.schemas.base import MessageResponse
from app.services import otp as otp_service
from app.services.labels import WEEKDAY_NAMES

router = APIRouter()


def _token_response(user: User) -> dict:
    return {
        "access_token": create_access_token(user.id, user.role.value),
        "refresh_token": create_refresh_token(user.id),
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user_id": user.id,
        "role": user.role,
        "is_verified": user.is_verified,
    }


def _seed_defaults(db: Session, user: User) -> None:
    """Every user gets settings; staff also get a default week of availability
    so the Set Availability screen has something to render on first open."""
    db.add(UserSettings(user_id=user.id))

    if user.role in STAFF_ROLES:
        db.add(ShiftPreference(user_id=user.id))
        for weekday in range(len(WEEKDAY_NAMES)):
            db.add(
                Availability(
                    user_id=user.id,
                    weekday=weekday,
                    is_available=weekday < 5,   # weekdays on, weekend off
                    start_time=datetime.strptime("09:00", "%H:%M").time(),
                    end_time=datetime.strptime("18:00", "%H:%M").time(),
                )
            )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Backs all five sign-up screens.

    Returns tokens immediately so the app can proceed to OTP entry with an
    authenticated session; ``isVerified`` stays false until the code is checked.
    """
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if payload.phone and db.query(User).filter(User.phone == payload.phone).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone number already registered")

    user = User(
        email=payload.email,
        phone=payload.phone,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        accepted_terms_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()   # assign user.id without ending the transaction

    if payload.role in STAFF_ROLES:
        db.add(
            StaffProfile(
                user_id=user.id,
                credential_number=payload.credential,
                specialty=payload.classification,
                experience=payload.experience,
            )
        )
    elif payload.role == UserRole.facility_admin:
        facility = Facility(
            name=payload.facility_name,
            facility_type=payload.facility_type,
            city=payload.city,
            created_by_id=user.id,
        )
        db.add(facility)
        db.flush()
        db.add(FacilityMember(facility_id=facility.id, user_id=user.id))

    _seed_defaults(db, user)
    db.commit()
    db.refresh(user)

    code = otp_service.issue_code(db, user, OtpPurpose.signup_verification)

    return RegisterResponse(
        **_token_response(user),
        otp_sent_to=user.email,
        debug_otp=code if settings.expose_otp else None,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()

    # Same error and roughly the same work whether the email exists or not, so
    # the response cannot be used to enumerate accounts.
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    return TokenResponse(**_token_response(user))


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_payload = decode_token(payload.refresh_token, expected_type="refresh")
    if token_payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token"
        )

    user = db.query(User).filter(User.id == int(token_payload["sub"])).first()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account unavailable")
    return TokenResponse(**_token_response(user))


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: VerifyOtpRequest, db: Session = Depends(get_db)):
    """OTP Verification screen."""
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")

    ok, reason = otp_service.verify_code(db, user, payload.code, OtpPurpose.signup_verification)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=reason)

    user.is_verified = True
    db.commit()
    db.refresh(user)
    # Fresh tokens so the client's stored claims reflect the verified state.
    return TokenResponse(**_token_response(user))


@router.post("/resend-otp", response_model=OtpSentResponse)
def resend_otp(payload: ResendOtpRequest, db: Session = Depends(get_db)):
    """The 'Resend Code' link once the screen's timer hits zero."""
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    if user.is_verified:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is already verified")

    cooldown = otp_service.seconds_until_resend(db, user.id, OtpPurpose.signup_verification)
    if cooldown > 0:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {cooldown} seconds before requesting another code",
        )

    code = otp_service.issue_code(db, user, OtpPurpose.signup_verification)
    return OtpSentResponse(
        message="Verification code sent",
        sent_to=user.email,
        expires_in_seconds=settings.OTP_TTL_MINUTES * 60,
        resend_available_in_seconds=settings.OTP_RESEND_COOLDOWN_SECONDS,
        debug_otp=code if settings.expose_otp else None,
    )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Always reports success — the screen shows 'Reset link sent' either way,
    so an unregistered email is not distinguishable from a registered one."""
    user = db.query(User).filter(User.email == payload.email).first()
    if user is not None:
        otp_service.issue_reset_token(db, user)
    return MessageResponse(message="If that email is registered, a reset link is on its way.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = otp_service.consume_reset_token(db, payload.token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This reset link is invalid or has expired"
        )

    user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password updated. You can now log in.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Settings → Change Password."""
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect"
        )
    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from the current one",
        )

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()
    return MessageResponse(message="Password changed successfully")


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Tokens are stateless, so this is advisory: the client discards them.
    Kept as an endpoint so revocation can be added without a client change."""
    return MessageResponse(message="Logged out")
