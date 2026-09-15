"""add_message_to_notification_category

Revision ID: 4a45b1c1d9fa
Revises: eb4bfaa6f1a1
Create Date: 2026-09-15 14:49:51.730390
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '4a45b1c1d9fa'
down_revision: Union[str, None] = 'eb4bfaa6f1a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TABLE notifications MODIFY COLUMN category "
        "ENUM('shift_alert','application','payment','document','system','message') NOT NULL"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE notifications MODIFY COLUMN category "
        "ENUM('shift_alert','application','payment','document','system') NOT NULL"
    )
