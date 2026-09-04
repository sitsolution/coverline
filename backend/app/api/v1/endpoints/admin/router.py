from fastapi import APIRouter

from app.api.v1.endpoints.admin import (
    billing,
    bookings,
    dashboard,
    documents,
    settings,
    shifts,
    staff,
)

admin_router = APIRouter()

# dashboard also carries /reports and /calendar — all three are read-only
# overviews of the same data.
admin_router.include_router(dashboard.router, tags=["admin: overview"])
admin_router.include_router(shifts.router, prefix="/shifts", tags=["admin: shifts"])
admin_router.include_router(staff.router, prefix="/staff", tags=["admin: staff"])
admin_router.include_router(bookings.router, prefix="/bookings", tags=["admin: bookings"])
admin_router.include_router(documents.router, prefix="/documents", tags=["admin: documents"])
admin_router.include_router(billing.router, prefix="/invoices", tags=["admin: billing"])
admin_router.include_router(settings.router, prefix="/settings", tags=["admin: settings"])
