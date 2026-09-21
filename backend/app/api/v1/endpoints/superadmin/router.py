from fastapi import APIRouter

from app.api.v1.endpoints.superadmin import activity, dashboard, facilities, reports, roles, search, users

superadmin_router = APIRouter()
superadmin_router.include_router(dashboard.router, tags=["superadmin: overview"])
superadmin_router.include_router(users.router, prefix="/users", tags=["superadmin: users"])
superadmin_router.include_router(roles.router, prefix="/roles", tags=["superadmin: roles"])
superadmin_router.include_router(facilities.router, prefix="/facilities", tags=["superadmin: facilities"])
superadmin_router.include_router(reports.router, prefix="/reports", tags=["superadmin: reports"])
superadmin_router.include_router(activity.router, prefix="/activity", tags=["superadmin: activity"])
superadmin_router.include_router(search.router, tags=["superadmin: search"])
