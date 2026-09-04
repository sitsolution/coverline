"""The two rules every admin endpoint depends on: facility scoping and
per-screen permissions."""

import pytest

from tests.conftest import DOCTOR
from tests.factories import make_facility, make_shift

ADMIN_GET_ROUTES = [
    "/api/v1/admin/dashboard",
    "/api/v1/admin/reports",
    "/api/v1/admin/shifts",
    "/api/v1/admin/staff",
    "/api/v1/admin/bookings",
    "/api/v1/admin/documents",
    "/api/v1/admin/invoices",
    "/api/v1/admin/settings/facility",
]


@pytest.mark.parametrize("path", ADMIN_GET_ROUTES)
def test_admin_routes_reject_anonymous_callers(client, path):
    assert client.get(path).status_code == 401


@pytest.mark.parametrize("path", ADMIN_GET_ROUTES)
def test_admin_routes_reject_staff_accounts(client, auth_headers, path):
    """A doctor's token must not open the admin panel."""
    response = client.get(path, headers=auth_headers)
    assert response.status_code == 403, path


def test_admin_with_no_facility_is_rejected(client, db_session):
    from app.models.facility import FacilityMember

    body = client.post("/api/v1/auth/register", json={
        "fullName": "Orphan Admin", "email": "orphan@example.com", "phone": "+919111111111",
        "password": "Password1", "role": "facility_admin", "facilityName": "Temp Hospital",
        "facilityType": "clinic", "city": "Pune", "acceptedTerms": True}).json()

    db_session.query(FacilityMember).filter(
        FacilityMember.user_id == body["userId"]
    ).delete()
    db_session.commit()

    response = client.get(
        "/api/v1/admin/dashboard", headers={"Authorization": f"Bearer {body['accessToken']}"}
    )
    assert response.status_code == 403
    assert "not linked to any facility" in response.json()["detail"]


def test_permission_gating(client, limited_admin):
    """A manager holding only `shifts` is refused the other screens."""
    headers = limited_admin["headers"]

    assert client.get("/api/v1/admin/shifts", headers=headers).status_code == 200
    # No permission required — every admin sees their own dashboard.
    assert client.get("/api/v1/admin/dashboard", headers=headers).status_code == 200

    for path, permission in [
        ("/api/v1/admin/staff", "staff"),
        ("/api/v1/admin/bookings", "bookings"),
        ("/api/v1/admin/documents", "documents"),
        ("/api/v1/admin/invoices", "billing"),
        ("/api/v1/admin/reports", "reports"),
    ]:
        response = client.get(path, headers=headers)
        assert response.status_code == 403, path
        assert permission in response.json()["detail"]


def test_facility_scoping_hides_another_facilitys_shifts(
    client, admin_headers, registered_admin, db_session
):
    """A shift at a facility the admin does not belong to is invisible."""
    own = make_shift(db_session, registered_admin["facility"])
    other_facility = make_facility(db_session, name="Rival Hospital")
    theirs = make_shift(db_session, other_facility, days_ahead=4)

    body = client.get("/api/v1/admin/shifts", headers=admin_headers).json()
    assert [item["id"] for item in body["items"]] == [own.id]

    # And it 404s rather than 403s — the shift's existence is not confirmed.
    assert client.get(
        f"/api/v1/admin/shifts/{theirs.id}", headers=admin_headers
    ).status_code == 404


def test_cannot_create_a_shift_at_another_facility(
    client, admin_headers, db_session
):
    from datetime import date, timedelta
    other = make_facility(db_session, name="Rival Hospital")

    response = client.post("/api/v1/admin/shifts", headers=admin_headers, json={
        "facilityId": other.id,
        "specialty": "Emergency Med.",
        "date": (date.today() + timedelta(days=5)).isoformat(),
        "startTime": "09:00:00", "endTime": "17:00:00",
        "payRate": 9500,
    })
    assert response.status_code == 404


def test_manager_cannot_edit_the_facility_profile(client, limited_admin):
    """Editing the facility is owner-level, above any per-screen permission."""
    response = client.patch(
        "/api/v1/admin/settings/facility",
        headers=limited_admin["headers"],
        json={"name": "Renamed Hospital"},
    )
    assert response.status_code == 403
    assert "super admin" in response.json()["detail"]


def test_manager_cannot_invite_admin_users(client, limited_admin):
    response = client.post("/api/v1/admin/settings/users", headers=limited_admin["headers"], json={
        "fullName": "New Person", "email": "new@example.com", "facilityRole": "manager"})
    assert response.status_code == 403
