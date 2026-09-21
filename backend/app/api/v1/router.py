from fastapi import APIRouter

from app.api.v1.endpoints.admin.router import admin_router
from app.api.v1.endpoints.superadmin.router import superadmin_router
from app.api.v1.endpoints import (
    activity,
    applications,
    auth,
    availability,
    calendar,
    chat,
    documents,
    earnings,
    notifications,
    shifts,
    support,
    users,
)

api_router = APIRouter()

api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
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
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

# Admin panel. Every route inside is gated on facility membership and a
# per-screen permission — see app/core/admin.py.
api_router.include_router(admin_router, prefix="/admin")

# Super Admin panel. Every route is gated on UserRole.super_admin.
api_router.include_router(superadmin_router, prefix="/superadmin")
