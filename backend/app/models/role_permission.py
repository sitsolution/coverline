from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class RolePermission(Base):
    """DB-driven permissions for each platform role.

    Seeded on first migration; Super Admin can edit all roles except
    ``super_admin`` itself (that row is display-only).
    """

    __tablename__ = "role_permissions"

    id = Column(Integer, primary_key=True, index=True)
    role_key = Column(String(50), nullable=False, unique=True, index=True)
    display_name = Column(String(100), nullable=False)
    scope = Column(String(100), nullable=False)

    # 8 module permission flags
    view_shifts = Column(Boolean, nullable=False, default=False)
    create_edit_shifts = Column(Boolean, nullable=False, default=False)
    view_staff_directory = Column(Boolean, nullable=False, default=False)
    manage_bookings = Column(Boolean, nullable=False, default=False)
    verify_documents = Column(Boolean, nullable=False, default=False)
    view_reports = Column(Boolean, nullable=False, default=False)
    manage_facility_settings = Column(Boolean, nullable=False, default=False)
    manage_users = Column(Boolean, nullable=False, default=False)

    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
