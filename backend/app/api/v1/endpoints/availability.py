from datetime import time

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_staff
from app.models.availability import Availability, ShiftPreference
from app.models.user import User
from app.schemas.availability import (
    AvailabilityDay,
    AvailabilityOut,
    AvailabilityUpdate,
    ShiftPreferencesOut,
)
from app.services.labels import WEEKDAY_NAMES

router = APIRouter()

DEFAULT_START = time(9, 0)
DEFAULT_END = time(18, 0)


def _load(db: Session, user: User) -> AvailabilityOut:
    rows = {
        row.weekday: row
        for row in db.query(Availability).filter(Availability.user_id == user.id).all()
    }
    prefs = db.query(ShiftPreference).filter(ShiftPreference.user_id == user.id).first()

    # Always return all seven days so the screen renders a full week even for
    # an account created before a day row existed.
    days = [
        AvailabilityDay(
            weekday=weekday,
            day_name=name,
            is_available=rows[weekday].is_available if weekday in rows else weekday < 5,
            start_time=rows[weekday].start_time if weekday in rows else DEFAULT_START,
            end_time=rows[weekday].end_time if weekday in rows else DEFAULT_END,
        )
        for weekday, name in enumerate(WEEKDAY_NAMES)
    ]

    return AvailabilityOut(
        days=days,
        preferences=ShiftPreferencesOut(
            urgent_shifts=prefs.urgent_shifts if prefs else True,
            night_shifts=prefs.night_shifts if prefs else True,
            weekend_shifts=prefs.weekend_shifts if prefs else False,
        ),
    )


@router.get("", response_model=AvailabilityOut)
def get_availability(db: Session = Depends(get_db), current_user: User = Depends(get_current_staff)):
    """Set Your Availability screen."""
    return _load(db, current_user)


@router.put("", response_model=AvailabilityOut)
def update_availability(
    payload: AvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_staff),
):
    """'Save Availability'. Days and preferences can be sent together or apart."""
    if payload.days is not None:
        existing = {
            row.weekday: row
            for row in db.query(Availability).filter(Availability.user_id == current_user.id).all()
        }
        for day in payload.days:
            row = existing.get(day.weekday)
            if row is None:
                row = Availability(user_id=current_user.id, weekday=day.weekday)
                db.add(row)
            row.is_available = day.is_available
            row.start_time = day.start_time or DEFAULT_START
            row.end_time = day.end_time or DEFAULT_END

    if payload.preferences is not None:
        prefs = db.query(ShiftPreference).filter(ShiftPreference.user_id == current_user.id).first()
        if prefs is None:
            prefs = ShiftPreference(user_id=current_user.id)
            db.add(prefs)
        prefs.urgent_shifts = payload.preferences.urgent_shifts
        prefs.night_shifts = payload.preferences.night_shifts
        prefs.weekend_shifts = payload.preferences.weekend_shifts

    db.commit()
    return _load(db, current_user)
