"""add shift_type column to shifts

Revision ID: 20260905_0001
Revises: 20260904_1230
Create Date: 2026-09-05
"""
from alembic import op
import sqlalchemy as sa

revision = '20260905_0001'
down_revision = 'eab4e10a9c4d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('shifts', sa.Column('shift_type', sa.String(20), nullable=True))


def downgrade() -> None:
    op.drop_column('shifts', 'shift_type')
