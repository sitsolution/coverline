from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ActivityActionType, UserRole, enum_column


class ActivityLog(Base):
    """Immutable audit trail. Powers three surfaces:

    - Staff "My Activity" screen  (scoped to actor_id)
    - Admin "Activity Log" page   (scoped to facility_id)
    - Super Admin "System Log"    (unscoped)

    Never update or delete rows — compliance requirement NFR-SEC-05.
    """

    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Who — denormalized so the log remains intact after user deletion
    actor_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    actor_name = Column(String(120), nullable=False)
    actor_role = Column(enum_column(UserRole), nullable=False)

    # What
    action = Column(enum_column(ActivityActionType), nullable=False, index=True)
    description = Column(String(255), nullable=False)  # human-readable sentence

    # Affected entity
    entity_type = Column(String(50), nullable=True)   # "shift" | "application" | "document" | "user"
    entity_id = Column(Integer, nullable=True)

    # Facility context (null for cross-facility / platform-level actions)
    facility_id = Column(
        Integer, ForeignKey("facilities.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # When — indexed for efficient descending queries
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )

    actor = relationship("User", foreign_keys=[actor_id])
