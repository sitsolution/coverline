"""Coverage for the remaining staff screens: dashboard, calendar,
availability, notifications, profile, settings and support."""

from tests.factories import make_facility, make_shift


# ── Dashboard (Home) ──────────────────────────────────────────────────────────

def test_dashboard_returns_the_whole_screen_in_one_call(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, urgent=True, days_ahead=1)
    make_shift(db_session, facility, days_ahead=5)

    body = client.get("/api/v1/users/me/dashboard", headers=auth_headers).json()

    assert body["greeting"] in {"Good morning", "Good afternoon", "Good evening"}
    assert body["stats"]["availableShifts"] == 2
    assert len(body["urgentShifts"]) == 1
    assert body["user"]["initials"] == "AR"
    assert "unreadNotifications" in body


def test_recommendations_rank_by_specialty_without_excluding_others(
    client, auth_headers, db_session
):
    """A specialty mismatch must not empty the section."""
    # Accept every shift type, so the assertion does not depend on which
    # weekday the suite happens to run on.
    client.put("/api/v1/availability", headers=auth_headers, json={
        "preferences": {"urgentShifts": True, "nightShifts": True, "weekendShifts": True}})

    facility = make_facility(db_session)
    make_shift(db_session, facility, specialty="Pediatrics", days_ahead=2)
    make_shift(db_session, facility, specialty="Emergency Med.", days_ahead=6)

    items = client.get("/api/v1/shifts/recommended", headers=auth_headers).json()["items"]
    assert len(items) == 2
    assert items[0]["specialty"] == "Emergency Med.", "profile specialty should rank first"


# ── Calendar ──────────────────────────────────────────────────────────────────

def test_calendar_marks_applied_days(client, auth_headers, db_session):
    from datetime import datetime, timedelta, timezone

    shift = make_shift(db_session, make_facility(db_session), days_ahead=5)
    client.post(f"/api/v1/shifts/{shift.id}/apply", headers=auth_headers, json={})

    target = datetime.now(timezone.utc) + timedelta(days=5)
    body = client.get(
        f"/api/v1/calendar?year={target.year}&month={target.month}", headers=auth_headers
    ).json()

    marked = {day["day"]: day["marker"] for day in body["days"]}
    assert marked.get(target.date().isoformat()) == "pending"
    assert len(body["upcoming"]) == 1


def test_calendar_rejects_an_invalid_month(client, auth_headers):
    assert client.get("/api/v1/calendar?year=2026&month=13", headers=auth_headers).status_code == 422


# ── Availability ──────────────────────────────────────────────────────────────

def test_availability_defaults_to_a_full_week(client, auth_headers):
    body = client.get("/api/v1/availability", headers=auth_headers).json()
    assert len(body["days"]) == 7
    assert body["days"][0]["dayName"] == "Monday"
    assert body["days"][0]["isAvailable"] is True
    assert body["days"][5]["isAvailable"] is False   # Saturday off by default


def test_saving_availability_persists_days_and_preferences(client, auth_headers):
    response = client.put("/api/v1/availability", headers=auth_headers, json={
        "days": [{"weekday": 5, "isAvailable": True,
                  "startTime": "10:00:00", "endTime": "16:00:00"}],
        "preferences": {"urgentShifts": False, "nightShifts": False, "weekendShifts": True},
    })
    assert response.status_code == 200

    body = client.get("/api/v1/availability", headers=auth_headers).json()
    assert body["days"][5]["isAvailable"] is True
    assert body["days"][5]["startTime"] == "10:00:00"
    assert body["preferences"]["weekendShifts"] is True


def test_night_preference_filters_recommendations(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, start_hour=20, hours=12, days_ahead=2)   # night
    make_shift(db_session, facility, start_hour=9, days_ahead=3)              # day

    client.put("/api/v1/availability", headers=auth_headers, json={
        "preferences": {"urgentShifts": True, "nightShifts": False, "weekendShifts": True}})

    items = client.get("/api/v1/shifts/recommended", headers=auth_headers).json()["items"]
    assert all("Night" not in item["tags"] for item in items)


# ── Notifications ─────────────────────────────────────────────────────────────

def test_applying_produces_a_notification(client, auth_headers, db_session):
    shift = make_shift(db_session, make_facility(db_session))
    client.post(f"/api/v1/shifts/{shift.id}/apply", headers=auth_headers, json={})

    body = client.get("/api/v1/notifications", headers=auth_headers).json()
    assert body["total"] == 1
    assert body["unreadCount"] == 1
    assert body["items"][0]["category"] == "application"


def test_mark_all_read_clears_the_badge(client, auth_headers, db_session):
    shift = make_shift(db_session, make_facility(db_session))
    client.post(f"/api/v1/shifts/{shift.id}/apply", headers=auth_headers, json={})

    assert client.post("/api/v1/notifications/read-all", headers=auth_headers).json()["count"] == 1
    assert client.get("/api/v1/notifications/unread-count", headers=auth_headers).json()["count"] == 0


def test_notification_tabs_filter_by_category(client, auth_headers, db_session):
    shift = make_shift(db_session, make_facility(db_session))
    client.post(f"/api/v1/shifts/{shift.id}/apply", headers=auth_headers, json={})

    assert client.get("/api/v1/notifications?tab=shift_alerts",
                      headers=auth_headers).json()["total"] == 1
    assert client.get("/api/v1/notifications?tab=payments",
                      headers=auth_headers).json()["total"] == 0


# ── Profile & settings ────────────────────────────────────────────────────────

def test_profile_labels_the_credential_for_the_role(client, auth_headers):
    body = client.get("/api/v1/users/me", headers=auth_headers).json()
    assert body["user"]["fullName"] == "Dr. Ananya Rao"
    assert body["user"]["initials"] == "AR", "the honorific should not become an initial"
    assert body["profile"]["credentialLabel"] == "Medical License"
    assert body["profile"]["credentialNumber"] == "MCI-2019-88213"


def test_partial_profile_update_leaves_other_fields_alone(client, auth_headers):
    client.patch("/api/v1/users/me", headers=auth_headers,
                 json={"qualifications": "MBBS, MD (Emergency Medicine)"})
    body = client.patch("/api/v1/users/me", headers=auth_headers,
                        json={"minPayRate": 8000}).json()

    assert body["profile"]["minPayRate"] == 8000.0
    assert body["profile"]["qualifications"] == "MBBS, MD (Emergency Medicine)"
    assert body["user"]["fullName"] == "Dr. Ananya Rao"


def test_preferred_locations_round_trip_as_a_list(client, auth_headers):
    body = client.patch("/api/v1/users/me", headers=auth_headers,
                        json={"preferredLocations": ["Pune", "Mumbai"]}).json()
    assert body["profile"]["preferredLocations"] == ["Pune", "Mumbai"]


def test_settings_toggles_persist(client, auth_headers):
    assert client.get("/api/v1/users/me/settings",
                      headers=auth_headers).json()["emailAlerts"] is False

    client.patch("/api/v1/users/me/settings", headers=auth_headers, json={"emailAlerts": True})
    assert client.get("/api/v1/users/me/settings",
                      headers=auth_headers).json()["emailAlerts"] is True


def test_device_token_can_be_registered(client, auth_headers):
    response = client.post("/api/v1/users/me/device-token", headers=auth_headers,
                           json={"token": "ExponentPushToken[xyz]", "platform": "ios"})
    assert response.status_code == 201


# ── Help & support ────────────────────────────────────────────────────────────

def test_faqs_are_public(client, db_session):
    from app.models.support import Faq
    db_session.add(Faq(question="When will I receive my payment?",
                       answer="On the 28th of each month.", sort_order=0))
    db_session.commit()

    body = client.get("/api/v1/support/faqs").json()
    assert body["total"] == 1


def test_faq_search_matches_question_text(client, db_session):
    from app.models.support import Faq
    db_session.add(Faq(question="When will I receive my payment?", answer="Monthly.", sort_order=0))
    db_session.add(Faq(question="How do I verify documents?", answer="Upload them.", sort_order=1))
    db_session.commit()

    body = client.get("/api/v1/support/faqs?search=payment").json()
    assert body["total"] == 1


def test_support_ticket_is_created_open(client, auth_headers):
    response = client.post("/api/v1/support/tickets", headers=auth_headers, json={
        "subject": "Cannot upload", "message": "The upload button does nothing on Android."})
    assert response.status_code == 201
    assert response.json()["status"] == "open"


# ── Role isolation ────────────────────────────────────────────────────────────

def test_facility_admin_cannot_reach_staff_only_routes(client):
    admin = client.post("/api/v1/auth/register", json={
        "fullName": "Rakesh Menon", "email": "admin@example.com", "phone": "+919444444444",
        "password": "Password1", "role": "facility_admin", "facilityName": "Apollo Hospital",
        "facilityType": "hospital", "city": "Pune", "acceptedTerms": True}).json()
    headers = {"Authorization": f"Bearer {admin['accessToken']}"}

    for path in ("/api/v1/shifts", "/api/v1/earnings/summary",
                 "/api/v1/availability", "/api/v1/applications"):
        assert client.get(path, headers=headers).status_code == 403, path
