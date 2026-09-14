"""add role_permissions table

Revision ID: 20260914_0001
Revises: 9a0b7c228f98
Create Date: 2026-09-14 10:00:00.000000
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260914_0001"
down_revision: Union[str, None] = "9a0b7c228f98"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Convenience table reference for bulk_insert (no ORM import needed)
_rp = sa.table(
    "role_permissions",
    sa.column("role_key", sa.String),
    sa.column("display_name", sa.String),
    sa.column("scope", sa.String),
    sa.column("view_shifts", sa.Boolean),
    sa.column("create_edit_shifts", sa.Boolean),
    sa.column("view_staff_directory", sa.Boolean),
    sa.column("manage_bookings", sa.Boolean),
    sa.column("verify_documents", sa.Boolean),
    sa.column("view_reports", sa.Boolean),
    sa.column("manage_facility_settings", sa.Boolean),
    sa.column("manage_users", sa.Boolean),
)

_DEFAULT_ROLES = [
    dict(
        role_key="super_admin",
        display_name="Super Admin",
        scope="Platform-wide",
        view_shifts=True, create_edit_shifts=True, view_staff_directory=True,
        manage_bookings=True, verify_documents=True, view_reports=True,
        manage_facility_settings=True, manage_users=True,
    ),
    dict(
        role_key="facility_admin_manager",
        display_name="Facility Admin (Manager)",
        scope="Single facility",
        view_shifts=True, create_edit_shifts=True, view_staff_directory=True,
        manage_bookings=True, verify_documents=True, view_reports=True,
        manage_facility_settings=True, manage_users=False,
    ),
    dict(
        role_key="facility_admin_staff",
        display_name="Facility Admin (Staff)",
        scope="Single facility",
        view_shifts=True, create_edit_shifts=True, view_staff_directory=True,
        manage_bookings=True, verify_documents=False, view_reports=False,
        manage_facility_settings=False, manage_users=False,
    ),
    dict(
        role_key="doctor",
        display_name="Doctor",
        scope="Own profile & shifts",
        view_shifts=True, create_edit_shifts=False, view_staff_directory=False,
        manage_bookings=False, verify_documents=False, view_reports=False,
        manage_facility_settings=False, manage_users=False,
    ),
    dict(
        role_key="nurse",
        display_name="Nurse",
        scope="Own profile & shifts",
        view_shifts=True, create_edit_shifts=False, view_staff_directory=False,
        manage_bookings=False, verify_documents=False, view_reports=False,
        manage_facility_settings=False, manage_users=False,
    ),
    dict(
        role_key="ot_tech",
        display_name="OT Technician",
        scope="Own profile & shifts",
        view_shifts=True, create_edit_shifts=False, view_staff_directory=False,
        manage_bookings=False, verify_documents=False, view_reports=False,
        manage_facility_settings=False, manage_users=False,
    ),
    dict(
        role_key="housekeeping",
        display_name="Housekeeping Staff",
        scope="Own profile & shifts",
        view_shifts=True, create_edit_shifts=False, view_staff_directory=False,
        manage_bookings=False, verify_documents=False, view_reports=False,
        manage_facility_settings=False, manage_users=False,
    ),
]


def upgrade() -> None:
    op.create_table(
        "role_permissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("role_key", sa.String(length=50), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("scope", sa.String(length=100), nullable=False),
        sa.Column("view_shifts", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("create_edit_shifts", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("view_staff_directory", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("manage_bookings", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("verify_documents", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("view_reports", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("manage_facility_settings", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("manage_users", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("role_key"),
    )
    op.create_index(op.f("ix_role_permissions_id"), "role_permissions", ["id"], unique=False)
    op.create_index(op.f("ix_role_permissions_role_key"), "role_permissions", ["role_key"], unique=True)

    op.bulk_insert(_rp, _DEFAULT_ROLES)


def downgrade() -> None:
    op.drop_index(op.f("ix_role_permissions_role_key"), table_name="role_permissions")
    op.drop_index(op.f("ix_role_permissions_id"), table_name="role_permissions")
    op.drop_table("role_permissions")
