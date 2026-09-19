"""
cleanup_db.py — Remove all transactional data, keep staff + superadmin users.

Run from the backend/ directory:
    python cleanup_db.py

What is kept:
  - users          (all rows — logins intact)
  - staff_profiles (linked to users)
  - user_settings  (linked to users)
  - role_permissions (seeded config)
  - faqs           (content)
  - availability   (staff schedule preferences)
  - shift_preferences (staff toggles)

What is deleted (in FK-safe order):
  - direct_messages, chat_rooms
  - booking_messages
  - applications
  - shift_favorites
  - shifts
  - staff_reviews, staff_notes
  - payments, payout_requests
  - invoice_line_items, invoices, payment_methods
  - documents
  - notifications, device_tokens
  - support_tickets
  - otp_codes, password_reset_tokens
  - facilities, facility_members
  - activity_logs
"""

import sys
import os

# Allow running from backend/ root
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import engine
from sqlalchemy import text

TABLES_TO_CLEAR = [
    # Chat (messages before rooms)
    "direct_messages",
    "chat_rooms",
    # Booking comms
    "booking_messages",
    # Applications (before shifts)
    "applications",
    # Shift-related
    "shift_favorites",
    "shifts",
    # Staff metadata
    "staff_reviews",
    "staff_notes",
    # Payments
    "payout_requests",
    "payments",
    "invoice_line_items",
    "invoices",
    "payment_methods",
    # Documents
    "documents",
    # Notifications
    "notifications",
    "device_tokens",
    # Support
    "support_tickets",
    # Auth tokens
    "otp_codes",
    "password_reset_tokens",
    # Facilities (members before facilities)
    "facility_members",
    "facilities",
    # Activity logs
    "activity_logs",
]

def main():
    print("=== Locum DB Cleanup ===")
    print("Keeping: users, staff_profiles, user_settings, role_permissions, faqs, availability, shift_preferences")
    print()

    with engine.begin() as conn:
        # Disable FK checks so we can delete in any order
        conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

        for table in TABLES_TO_CLEAR:
            result = conn.execute(text(f"DELETE FROM `{table}`"))
            print(f"  Cleared {table:35s} — {result.rowcount} rows deleted")

        conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))

    print()
    print("Done. All transactional data removed.")
    print("Staff and superadmin logins are intact.")

if __name__ == "__main__":
    main()
