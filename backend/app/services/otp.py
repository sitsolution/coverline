"""One-time codes for signup verification and password reset.

There is no SMS/email provider wired up yet, so ``deliver`` logs the code and,
in DEBUG only, the API echoes it back so the flow stays testable. Swapping in
a real provider means changing ``deliver`` and nothing else.
"""

import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import OtpPurpose
from app.models.otp import OtpCode, PasswordResetToken
from app.models.user import User

logger = logging.getLogger(__name__)


def _hash(value: str) -> str:
    # Codes are short-lived and high-entropy-limited; a fast hash is correct
    # here — bcrypt on a 6-digit code buys nothing and costs latency.
    return hashlib.sha256(f"{settings.SECRET_KEY}{value}".encode()).hexdigest()


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _as_aware(value: datetime) -> datetime:
    """MySQL returns naive datetimes; treat them as UTC for comparison."""
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def generate_code() -> str:
    upper = 10 ** settings.OTP_LENGTH
    return str(secrets.randbelow(upper)).zfill(settings.OTP_LENGTH)


def seconds_until_resend(db: Session, user_id: int, purpose: OtpPurpose) -> int:
    """0 when a new code may be sent, else the remaining cooldown."""
    latest = (
        db.query(OtpCode)
        .filter(OtpCode.user_id == user_id, OtpCode.purpose == purpose)
        .order_by(desc(OtpCode.created_at))
        .first()
    )
    if latest is None or latest.created_at is None:
        return 0
    elapsed = (_now() - _as_aware(latest.created_at)).total_seconds()
    remaining = settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed
    return max(0, int(remaining))


def issue_code(db: Session, user: User, purpose: OtpPurpose) -> str:
    """Invalidate any outstanding codes and mint a fresh one."""
    db.query(OtpCode).filter(
        OtpCode.user_id == user.id,
        OtpCode.purpose == purpose,
        OtpCode.consumed_at.is_(None),
    ).update({"consumed_at": _now()}, synchronize_session=False)

    code = generate_code()
    db.add(
        OtpCode(
            user_id=user.id,
            code_hash=_hash(code),
            purpose=purpose,
            expires_at=_now() + timedelta(minutes=settings.OTP_TTL_MINUTES),
        )
    )
    db.commit()
    deliver(user, code, purpose)
    return code


def deliver(user: User, code: str, purpose: OtpPurpose) -> None:
    """Replace this with a real SMS/email provider."""
    logger.info("OTP for %s (%s): %s", user.email, purpose.value, code)


def verify_code(db: Session, user: User, code: str, purpose: OtpPurpose) -> Tuple[bool, str]:
    """Return (ok, reason). Reason is client-safe on failure."""
    record = (
        db.query(OtpCode)
        .filter(
            OtpCode.user_id == user.id,
            OtpCode.purpose == purpose,
            OtpCode.consumed_at.is_(None),
        )
        .order_by(desc(OtpCode.created_at))
        .first()
    )
    if record is None:
        return False, "No verification code was requested. Please request a new one."

    if _as_aware(record.expires_at) < _now():
        return False, "This code has expired. Please request a new one."

    if record.attempts >= settings.OTP_MAX_ATTEMPTS:
        return False, "Too many incorrect attempts. Please request a new code."

    if not secrets.compare_digest(record.code_hash, _hash(code)):
        record.attempts += 1
        db.commit()
        remaining = settings.OTP_MAX_ATTEMPTS - record.attempts
        return False, f"Incorrect code. {remaining} attempt(s) remaining."

    record.consumed_at = _now()
    db.commit()
    return True, "verified"


# ── Password reset tokens ─────────────────────────────────────────────────────

def issue_reset_token(db: Session, user: User) -> str:
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.consumed_at.is_(None),
    ).update({"consumed_at": _now()}, synchronize_session=False)

    token = secrets.token_urlsafe(32)
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash(token),
            expires_at=_now() + timedelta(hours=1),
        )
    )
    db.commit()
    logger.info("Password reset token for %s: %s", user.email, token)
    return token


def consume_reset_token(db: Session, token: str) -> Optional[User]:
    record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == _hash(token),
            PasswordResetToken.consumed_at.is_(None),
        )
        .first()
    )
    if record is None or _as_aware(record.expires_at) < _now():
        return None

    record.consumed_at = _now()
    user = db.query(User).filter(User.id == record.user_id).first()
    db.commit()
    return user
