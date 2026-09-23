"""add facility_created and role_updated to activity_logs action enum

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-09-23 00:03:00.000000
"""
from typing import Sequence, Union

from alembic import op

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# All values in order — MySQL requires the full list when modifying an ENUM
_ALL_VALUES = ",".join(f"'{v}'" for v in [
    "shift_applied", "application_cancelled", "availability_updated",
    "document_uploaded", "document_verified", "document_rejected",
    "shift_created", "shift_updated", "shift_cancelled",
    "booking_confirmed", "booking_completed", "booking_cancelled",
    "user_added", "user_deactivated",
    "role_updated", "facility_created",
])


def upgrade() -> None:
    op.execute(
        f"ALTER TABLE activity_logs MODIFY COLUMN action ENUM({_ALL_VALUES}) NOT NULL"
    )


def downgrade() -> None:
    _old_values = ",".join(f"'{v}'" for v in [
        "shift_applied", "application_cancelled", "availability_updated",
        "document_uploaded", "document_verified", "document_rejected",
        "shift_created", "shift_updated", "shift_cancelled",
        "booking_confirmed", "booking_completed", "booking_cancelled",
        "user_added", "user_deactivated",
    ])
    op.execute(
        f"ALTER TABLE activity_logs MODIFY COLUMN action ENUM({_old_values}) NOT NULL"
    )
