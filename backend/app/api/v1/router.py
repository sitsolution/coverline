from fastapi import APIRouter

from app.api.v1.endpoints import (
    applications,
    auth,
    availability,
    calendar,
    documents,
    earnings,
    notifications,
    shifts,
    support,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(shifts.router, prefix="/shifts", tags=["shifts"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(availability.router, prefix="/availability", tags=["availability"])
api_router.include_router(calendar.router, prefix="/calendar", tags=["calendar"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(earnings.router, prefix="/earnings", tags=["earnings"])
api_router.include_router(support.router, prefix="/support", tags=["support"])
