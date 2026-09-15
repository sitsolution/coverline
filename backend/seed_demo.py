"""
Clears all data (except super admin) then seeds fresh demo data.

Usage:
    cd backend
    source .venv/bin/activate
    python seed_demo.py
"""

from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.application import Application
from app.models.document import Document
from app.models.enums import (
    AdminPermission, ApplicationStatus, DocumentStatus,
    DocumentType, FacilityRole, FacilityType, ShiftStatus, UserRole,
)
from app.models.facility import Facility, FacilityMember
from app.models.shift import Shift
from app.models.user import StaffProfile, User

db = SessionLocal()
NOW = datetime.now(timezone.utc)

try:
    # ── 1. Keep only super admin, delete everything else ──────────────────────
    print("Cleaning existing data (keeping super admin)...")

    superadmin = db.query(User).filter(User.role == UserRole.super_admin).first()
    if not superadmin:
        print("[ERROR] No super admin found. Run seed_superadmin.py first.")
        exit(1)

    db.query(Application).delete()
    db.query(Document).delete()
    db.query(Shift).delete()
    db.query(StaffProfile).delete()
    db.query(FacilityMember).delete()
    db.query(Facility).delete()
    db.query(User).filter(User.role != UserRole.super_admin).delete()
    db.flush()
    print(f"  [ok] Cleared. Super admin kept (id={superadmin.id})\n")

    # ── 2. Facility ───────────────────────────────────────────────────────────
    print("── Creating Facility ──")
    facility = Facility(
        name="Apollo Multispeciality Hospital",
        facility_type=FacilityType.hospital,
        city="Pune",
        area="Kothrud",
        state="Maharashtra",
        address="Survey No. 12, Kothrud, Pune 411038",
        contact_email="admin@apollo-pune.com",
        description="A leading multispeciality hospital in Pune offering 24/7 emergency and elective care.",
    )
    db.add(facility)
    db.flush()
    print(f"  [ok] {facility.name} (id={facility.id})")

    # ── 3. Facility Admin ─────────────────────────────────────────────────────
    print("\n── Creating Facility Admin ──")
    admin_user = User(
        email="admin@apollo-pune.com",
        full_name="Rajesh Sharma",
        hashed_password=hash_password("Admin@1234"),
        role=UserRole.facility_admin,
        is_active=True,
        is_verified=True,
    )
    db.add(admin_user)
    db.flush()

    db.add(FacilityMember(
        facility_id=facility.id,
        user_id=admin_user.id,
        facility_role=FacilityRole.super_admin,
        permissions=",".join(p.value for p in AdminPermission),
        accepted_at=NOW,
    ))
    db.flush()
    print(f"  [ok] {admin_user.full_name} → {facility.name}")

    # ── 4. Staff users ────────────────────────────────────────────────────────
    print("\n── Creating Staff ──")
    staff_data = [
        ("priya.mehta@example.com",     "Dr. Priya Mehta",   UserRole.doctor,       "Emergency Medicine",          "6–10 years"),
        ("amit.kulkarni@example.com",   "Amit Kulkarni",     UserRole.nurse,        "ICU Nursing",                 "3–5 years"),
        ("sunita.rao@example.com",      "Sunita Rao",        UserRole.ot_tech,      "Diploma in OT Technology",    "3–5 years"),
        ("ravi.patil@example.com",      "Ravi Patil",        UserRole.housekeeping, "General Ward",                "0–2 years"),
    ]
    staff_users = []
    for email, name, role, specialty, exp in staff_data:
        u = User(
            email=email, full_name=name,
            hashed_password=hash_password("Staff@1234"),
            role=role, is_active=True, is_verified=True,
        )
        db.add(u)
        db.flush()
        db.add(StaffProfile(
            user_id=u.id, specialty=specialty, experience=exp,
            rating=4.5, shifts_completed=12,
        ))
        db.flush()
        staff_users.append(u)
        print(f"  [ok] {name} ({role.value})")

    doctor, nurse, ot_tech, housekeeping = staff_users

    # ── 5. Documents ──────────────────────────────────────────────────────────
    print("\n── Creating Documents ──")
    docs = [
        (doctor,       DocumentType.medical_license,      "medical_license_priya.pdf",  DocumentStatus.pending),
        (doctor,       DocumentType.bls_certification,    "bls_cert_priya.pdf",         DocumentStatus.verified),
        (nurse,        DocumentType.nursing_registration, "nursing_reg_amit.pdf",       DocumentStatus.pending),
        (nurse,        DocumentType.id_proof,             "id_proof_amit.pdf",          DocumentStatus.verified),
        (ot_tech,      DocumentType.ot_certification,     "ot_cert_sunita.pdf",         DocumentStatus.pending),
        (housekeeping, DocumentType.id_proof,             "id_proof_ravi.pdf",          DocumentStatus.pending),
    ]
    for user, doc_type, filename, status in docs:
        db.add(Document(
            user_id=user.id, doc_type=doc_type,
            original_filename=filename,
            file_path=f"demo/{user.id}/{filename}",
            content_type="application/pdf", file_size=102400,
            status=status,
            issue_date=(NOW - timedelta(days=365)).date(),
            expiry_date=(NOW + timedelta(days=365)).date(),
        ))
    db.flush()
    print(f"  [ok] 6 documents (4 pending, 2 verified)")

    # ── 6. Shifts ─────────────────────────────────────────────────────────────
    print("\n── Creating Shifts ──")
    shifts_data = [
        (UserRole.doctor,       "Emergency Medicine",       "Emergency Night Cover – ICU",    6,  12, 6000, 2, True),
        (UserRole.nurse,        "ICU Nursing",              "ICU Day Shift – Ward B",         8,  8,  3500, 3, False),
        (UserRole.doctor,       "General Medicine",         "OPD Morning Round",              10, 6,  4000, 1, False),
        (UserRole.ot_tech,      "Diploma in OT Technology", "OT Assist – Ortho Surgery",     24, 8,  3000, 2, False),
        (UserRole.nurse,        "General Ward",             "General Ward Night Duty",        18, 10, 3200, 2, False),
        (UserRole.housekeeping, "General Ward",             "Ward Housekeeping – Morning",    4,  6,  1800, 2, False),
    ]
    shift_objs = []
    for role, specialty, title, offset, duration, pay, slots, urgent in shifts_data:
        start = NOW + timedelta(hours=offset)
        s = Shift(
            facility_id=facility.id, role=role, specialty=specialty,
            title=title, start_time=start,
            end_time=start + timedelta(hours=duration),
            pay_rate=pay, slots=slots, slots_filled=0,
            status=ShiftStatus.open, is_urgent=urgent,
            shift_type="Emergency" if urgent else "Regular",
            is_visible=True, published_at=NOW,
            created_by_id=admin_user.id,
        )
        db.add(s)
        db.flush()
        shift_objs.append(s)
        print(f"  [ok] {title}")

    shift_emergency, shift_icu, shift_opd, shift_ot, shift_night, shift_hk = shift_objs

    # ── 7. Applications / Bookings ────────────────────────────────────────────
    print("\n── Creating Bookings ──")
    applications = [
        (shift_emergency, doctor,       ApplicationStatus.pending),
        (shift_icu,       nurse,        ApplicationStatus.pending),
        (shift_ot,        ot_tech,      ApplicationStatus.pending),
        (shift_hk,        housekeeping, ApplicationStatus.pending),
        (shift_opd,       doctor,       ApplicationStatus.confirmed),
    ]
    for shift, staff, status in applications:
        db.add(Application(
            shift_id=shift.id, staff_id=staff.id,
            status=status,
            applied_at=NOW - timedelta(hours=2),
        ))
    shift_opd.slots_filled = 1
    db.flush()
    print(f"  [ok] 4 pending applications + 1 confirmed booking")

    db.commit()

    print("\n" + "─" * 54)
    print("  Demo data ready!")
    print("─" * 54)
    print(f"\n  Facility : {facility.name}")
    print(f"\n  Admin Login (web):")
    print(f"    Email    : admin@apollo-pune.com")
    print(f"    Password : Admin@1234")
    print(f"\n  Staff accounts (password: Staff@1234):")
    print(f"    Doctor       : priya.mehta@example.com")
    print(f"    Nurse        : amit.kulkarni@example.com")
    print(f"    OT Tech      : sunita.rao@example.com")
    print(f"    Housekeeping : ravi.patil@example.com")
    print(f"\n  What to show in video:")
    print(f"    Dashboard  → stats, urgent shift banner")
    print(f"    Shifts     → 6 shifts (1 urgent)")
    print(f"    Bookings   → 4 pending to accept/reject + 1 confirmed")
    print(f"    Staff DB   → 4 staff with specialties")
    print(f"    Documents  → 4 pending verifications to approve/reject")
    print(f"    Search     → try 'Priya', 'ICU', 'Emergency'")

except Exception as e:
    db.rollback()
    print(f"\n[ERROR] {e}")
    raise
finally:
    db.close()
