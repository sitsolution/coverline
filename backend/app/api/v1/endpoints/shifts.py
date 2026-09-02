from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.shift import Shift

router = APIRouter()


@router.get("/")
def list_shifts(db: Session = Depends(get_db)):
    shifts = db.query(Shift).filter(Shift.status == "open").all()
    return shifts
