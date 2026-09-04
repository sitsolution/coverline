from datetime import time
from typing import List, Optional

from pydantic import Field

from app.schemas.base import CamelModel


class AvailabilityDay(CamelModel):
    weekday: int = Field(ge=0, le=6, description="0 = Monday … 6 = Sunday")
    day_name: str
    is_available: bool
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class ShiftPreferencesOut(CamelModel):
    urgent_shifts: bool
    night_shifts: bool
    weekend_shifts: bool


class AvailabilityOut(CamelModel):
    days: List[AvailabilityDay]
    preferences: ShiftPreferencesOut


class AvailabilityDayInput(CamelModel):
    weekday: int = Field(ge=0, le=6)
    is_available: bool
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class AvailabilityUpdate(CamelModel):
    days: Optional[List[AvailabilityDayInput]] = None
    preferences: Optional[ShiftPreferencesOut] = None
