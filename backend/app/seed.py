"""Development seed data.

Run with:  backend/.venv/bin/python -m app.seed

Creates one staff account per role, a facility admin, three facilities, a
spread of shifts, plus documents, payments and notifications — enough for every
mobile screen to render real data. Idempotent: re-running updates nothing and
skips if the demo users already exist.
"""

import random
from datetime import date, datetime, time, timedelta, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.application import Application
from app.models.availability import Availability, ShiftPreference
from app.models.document import Document
from app.models.billing import Invoice, InvoiceLineItem, PaymentMethod
from app.models.enums import (
    ApplicationStatus,
    FacilityRole,
    InvoiceStatus,
    DocumentStatus,
    DocumentType,
    FacilityType,
    NotificationCategory,
    PaymentStatus,
    ShiftStatus,
    UserRole,
)
from app.models.facility import Facility, FacilityMember
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.shift import Shift
from app.models.staff_meta import StaffReview
from app.models.support import Faq
from app.models.user import StaffProfile, User, UserSettings

PASSWORD = "Password1"

STAFF = [
    {
        "email": "ananya.rao@example.com", "full_name": "Dr. Ananya Rao", "phone": "+919800000021",
        "role": UserRole.doctor, "credential": "MCI-2019-88213", "specialty": "Emergency Med.",
        "qualifications": "MBBS, MD (Emergency Medicine)", "min_pay": 9500,
    },
    {
        "email": "sneha.kulkarni@example.com", "full_name": "Sneha Kulkarni", "phone": "+919700000034",
        "role": UserRole.nurse, "credential": "NCR-2020-45231", "specialty": "ICU Nursing",
        "qualifications": "B.Sc Nursing", "min_pay": 3400,
    },
    {
        "email": "vikram.nair@example.com", "full_name": "Vikram Nair", "phone": "+919600000078",
        "role": UserRole.ot_tech, "credential": "OT-2021-78912", "specialty": "Cardiac OT",
        "qualifications": "Diploma in OT Technology", "min_pay": 3100,
    },
    {
        "email": "meena.pawar@example.com", "full_name": "Meena Pawar", "phone": "+919500000056",
        "role": UserRole.housekeeping, "credential": "EMP-2022-34501", "specialty": "OT Housekeeping",
        "qualifications": "Secondary Education", "min_pay": 1200,
    },
]

FACILITIES = [
    ("Apollo Hospital", FacilityType.hospital, "Pune", "Kothrud", 4.6),
    ("St. Joseph Hospital", FacilityType.hospital, "Pune", "Kalyani Nagar", 4.4),
    ("CityCare Clinic", FacilityType.clinic, "Pune", "Viman Nagar", 4.2),
    ("Ruby Medical Centre", FacilityType.hospital, "Pune", "Wakad", 4.5),
]

# role -> (specialty, pay) options, matching the app's role switcher.
SHIFT_TEMPLATES = {
    UserRole.doctor: [("Emergency Med.", 9500), ("General Med.", 7000),
                      ("Pediatrics", 6200), ("Anaesthesia", 8800)],
    UserRole.nurse: [("ICU Nursing", 4200), ("General Ward", 3400),
                     ("OT Nursing", 3900), ("Pediatric Nursing", 3700)],
    UserRole.ot_tech: [("Cardiac OT", 3800), ("General Surgery OT", 3100), ("Ortho OT", 3300)],
    UserRole.housekeeping: [("OT Housekeeping", 1600), ("General Ward", 1200),
                            ("Admin Block", 1350), ("ICU Housekeeping", 1800)],
}

REQUIREMENTS = {
    UserRole.doctor: "BLS certification required. Minimum 2 years ER experience. Valid state medical license.",
    UserRole.nurse: "BLS/ACLS preferred. Minimum 1 year ICU experience. Valid nursing council registration.",
    UserRole.ot_tech: "OT Technician certification required. Minimum 1 year surgical support experience.",
    UserRole.housekeeping: "Prior hospital housekeeping experience preferred. Basic infection-control training required.",
}

FAQS = [
    ("How do I get my documents verified?",
     "Upload each document from the Docs tab. Our team reviews new uploads within 24 hours, "
     "and you'll get a notification as soon as a document is verified."),
    ("When will I receive my payment?",
     "Payments are released after a shift is marked complete by the facility, and paid out on "
     "the 28th of each month to your registered bank account."),
    ("Can I cancel a confirmed shift?",
     "Yes, up to 24 hours before the shift starts, from My Applications. Closer than that, "
     "please contact support so the facility can arrange cover."),
    ("How do I update my availability?",
     "Open the Calendar tab and tap +, or go to Set Availability, to mark which days you're "
     "open for shifts and save."),
    ("What happens if a hospital cancels a shift?",
     "You'll be notified immediately and the shift is removed from your calendar. Cancellations "
     "by a facility never count against your record."),
]


def _utc(dt: datetime) -> datetime:
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def seed(db: Session) -> None:
    if db.query(User).filter(User.email == STAFF[0]["email"]).first():
        print("Seed data already present — nothing to do.")
        return

    random.seed(42)   # reproducible demo data
    now = datetime.now(timezone.utc).replace(microsecond=0)

    # ── Facility admin + facilities ───────────────────────────────────────────
    admin = User(
        email="admin@apollo.example.com",
        phone="+919400000001",
        full_name="Rakesh Menon",
        hashed_password=hash_password(PASSWORD),
        role=UserRole.facility_admin,
        is_verified=True,
        accepted_terms_at=now,
    )
    db.add(admin)
    db.flush()
    db.add(UserSettings(user_id=admin.id))

    facilities = []
    for name, ftype, city, area, rating in FACILITIES:
        facility = Facility(
            name=name, facility_type=ftype, city=city, area=area, state="Maharashtra",
            address=f"{area}, {city}, Maharashtra", rating=Decimal(str(rating)),
            created_by_id=admin.id,
        )
        db.add(facility)
        facilities.append(facility)
    db.flush()

    for facility in facilities:
        facility.contact_email = f"ops@{facility.name.split()[0].lower()}.example.com"
        facility.description = f"{facility.facility_type.value.title()} in {facility.city}"
        db.add(
            FacilityMember(
                facility_id=facility.id,
                user_id=admin.id,
                facility_role=FacilityRole.super_admin,
                accepted_at=now,
            )
        )
        db.add(
            PaymentMethod(
                facility_id=facility.id, label="HDFC Bank", last4="2291", is_primary=True
            )
        )

    # A manager with a narrower permission set, so the admin panel's
    # permission gating has something real to exercise.
    manager = User(
        email="manager@apollo.example.com",
        phone="+919400000002",
        full_name="Priya Menon",
        hashed_password=hash_password(PASSWORD),
        role=UserRole.facility_admin,
        is_verified=True,
        accepted_terms_at=now,
    )
    db.add(manager)
    db.flush()
    db.add(UserSettings(user_id=manager.id))
    db.add(
        FacilityMember(
            facility_id=facilities[0].id,
            user_id=manager.id,
            facility_role=FacilityRole.manager,
            permissions="shifts,bookings",
            invited_by_id=admin.id,
            accepted_at=now,
        )
    )

    # ── Staff accounts ────────────────────────────────────────────────────────
    staff_users = []
    for spec in STAFF:
        user = User(
            email=spec["email"],
            phone=spec["phone"],
            full_name=spec["full_name"],
            hashed_password=hash_password(PASSWORD),
            role=spec["role"],
            is_verified=True,
            accepted_terms_at=now,
            date_of_birth=datetime(1992, 6, 14, tzinfo=timezone.utc),
        )
        db.add(user)
        db.flush()

        db.add(StaffProfile(
            user_id=user.id,
            credential_number=spec["credential"],
            specialty=spec["specialty"],
            experience="6–10 years",
            qualifications=spec["qualifications"],
            preferred_locations="Pune, Mumbai",
            min_pay_rate=Decimal(str(spec["min_pay"])),
            bank_name="HDFC Bank",
            bank_account_last4="4521",
            rating=Decimal("4.8"),
            reviews_count=24,
            shifts_completed=24,
        ))
        db.add(UserSettings(user_id=user.id))
        db.add(ShiftPreference(user_id=user.id))
        for weekday in range(7):
            db.add(Availability(
                user_id=user.id, weekday=weekday, is_available=weekday < 5,
                start_time=time(9, 0), end_time=time(18, 0),
            ))
        staff_users.append(user)

    # ── Shifts: a mix of upcoming, urgent, night and weekend ──────────────────
    shifts = []
    for role, templates in SHIFT_TEMPLATES.items():
        for offset in range(1, 13):
            specialty, pay = random.choice(templates)
            facility = random.choice(facilities)
            is_night = offset % 3 == 0

            start_hour = 20 if is_night else 9
            duration = 12 if is_night else 8
            start = (now + timedelta(days=offset)).replace(
                hour=start_hour, minute=0, second=0, microsecond=0
            )

            shift = Shift(
                facility_id=facility.id,
                role=role,
                specialty=specialty,
                title=f"{specialty} shift",
                start_time=start,
                end_time=start + timedelta(hours=duration),
                pay_rate=Decimal(str(pay + (400 if is_night else 0))),
                slots=random.choice([1, 1, 2]),
                status=ShiftStatus.open,
                published_at=now,
                is_urgent=offset <= 3,
                requirements=REQUIREMENTS[role],
                amenities="On-call room,Meals provided,Cab pickup",
                description=f"{specialty} cover required at {facility.name}.",
                created_by_id=admin.id,
            )
            db.add(shift)
            shifts.append(shift)

    # Past shifts, so completed applications and earnings have something real
    # to point at.
    past_shifts = []
    for role in SHIFT_TEMPLATES:
        for offset in range(1, 5):
            specialty, pay = SHIFT_TEMPLATES[role][0]
            facility = random.choice(facilities)
            start = (now - timedelta(days=offset * 9)).replace(hour=9, minute=0, second=0, microsecond=0)
            shift = Shift(
                facility_id=facility.id, role=role, specialty=specialty,
                title=f"{specialty} shift", start_time=start, end_time=start + timedelta(hours=8),
                pay_rate=Decimal(str(pay)), slots=1, slots_filled=1,
                status=ShiftStatus.completed, published_at=start - timedelta(days=3),
                requirements=REQUIREMENTS[role],
                amenities="Meals provided", created_by_id=admin.id,
            )
            db.add(shift)
            past_shifts.append(shift)
    db.flush()

    # ── Applications, payments, documents, notifications per staff member ─────
    for user in staff_users:
        role_shifts = [s for s in shifts if s.role == user.role]
        role_past = [s for s in past_shifts if s.role == user.role]

        # One confirmed, one pending — fills the My Applications tabs.
        if role_shifts:
            confirmed_shift = role_shifts[0]
            confirmed_shift.slots_filled += 1
            db.add(Application(
                shift_id=confirmed_shift.id, staff_id=user.id,
                status=ApplicationStatus.confirmed,
                responded_at=now + timedelta(hours=6),
            ))
        if len(role_shifts) > 1:
            db.add(Application(
                shift_id=role_shifts[1].id, staff_id=user.id,
                status=ApplicationStatus.pending,
            ))

        for index, shift in enumerate(role_past):
            db.add(Application(
                shift_id=shift.id, staff_id=user.id,
                status=ApplicationStatus.completed, responded_at=_utc(shift.start_time),
            ))
            paid = index > 0   # leave the most recent one pending
            db.add(Payment(
                user_id=user.id, shift_id=shift.id, amount=shift.pay_rate,
                status=PaymentStatus.paid if paid else PaymentStatus.pending,
                earned_at=_utc(shift.end_time),
                paid_at=_utc(shift.end_time) + timedelta(days=3) if paid else None,
                reference=f"TXN{shift.id:06d}" if paid else None,
            ))

        db.add(Document(
            user_id=user.id, doc_type=DocumentType.id_proof,
            document_number="XXXX-XXXX-4501",
            file_path=f"{user.id}/seed-id-proof.pdf", original_filename="Aadhaar.pdf",
            content_type="application/pdf", file_size=182_400,
            issue_date=date(2019, 3, 4), status=DocumentStatus.verified,
            verified_at=now,
        ))

        for title, body, category in [
            ("New shift matches your profile", "Apollo Hospital · check the Shifts tab",
             NotificationCategory.shift_alert),
            ("Application confirmed", "Your upcoming shift is confirmed",
             NotificationCategory.application),
            ("Payment received", "Credited for a completed shift", NotificationCategory.payment),
        ]:
            db.add(Notification(
                user_id=user.id, category=category, title=title, body=body,
                is_read=category == NotificationCategory.payment,
            ))

    # Reviews, so staff ratings are computed from real rows.
    for user in staff_users:
        for index, facility in enumerate(facilities[:2]):
            db.add(
                StaffReview(
                    staff_id=user.id,
                    facility_id=facility.id,
                    author_id=admin.id,
                    rating=Decimal("5.0" if index == 0 else "4.5"),
                    comment="Reliable and professional." if index == 0 else "Good cover.",
                )
            )
        profile = db.query(StaffProfile).filter(StaffProfile.user_id == user.id).first()
        if profile is not None:
            profile.rating = Decimal("4.75")
            profile.reviews_count = 2

    # Invoices for the primary facility: one paid, one unpaid, one overdue.
    primary = facilities[0]
    invoice_specs = [
        (0, InvoiceStatus.unpaid, 92000),
        (1, InvoiceStatus.paid, 78400),
        (2, InvoiceStatus.unpaid, 105000),   # dated far enough back to be overdue
    ]
    for months_back, invoice_status, amount in invoice_specs:
        issued = (now.date().replace(day=1) - timedelta(days=months_back * 30)).replace(day=1)
        due = issued + timedelta(days=29)
        invoice = Invoice(
            facility_id=primary.id,
            number=f"INV-{3381 - months_back * 11}",
            status=invoice_status,
            period_start=issued,
            period_end=due,
            issued_on=issued,
            due_on=due,
            subtotal=Decimal(str(amount)),
            tax=Decimal("0"),
            total=Decimal(str(amount)),
            paid_at=now if invoice_status == InvoiceStatus.paid else None,
        )
        db.add(invoice)
        db.flush()
        db.add(
            InvoiceLineItem(
                invoice_id=invoice.id,
                description="Locum shift cover",
                quantity=Decimal("1"),
                unit_amount=Decimal(str(amount)),
                amount=Decimal(str(amount)),
            )
        )

    for order, (question, answer) in enumerate(FAQS):
        db.add(Faq(question=question, answer=answer, category="General", sort_order=order))

    db.commit()

    print("Seeded:")
    print(f"  {len(staff_users)} staff + 1 facility admin (password: {PASSWORD})")
    for spec in STAFF:
        print(f"    {spec['role'].value:<14} {spec['email']}")
    print(f"    facility_admin admin@apollo.example.com   (super admin, all permissions)")
    print(f"    facility_admin manager@apollo.example.com (manager, shifts + bookings only)")
    print(f"  {len(facilities)} facilities, {len(shifts) + len(past_shifts)} shifts, "
          f"{len(invoice_specs)} invoices, {len(FAQS)} FAQs")


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
