from app.models.enums import UserRole
from tests.factories import make_facility, make_shift


def test_list_shows_only_the_callers_role(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, role=UserRole.doctor)
    make_shift(db_session, facility, role=UserRole.nurse, specialty="ICU Nursing")

    body = client.get("/api/v1/shifts", headers=auth_headers).json()
    assert body["total"] == 1
    assert {item["role"] for item in body["items"]} == {"doctor"}


def test_night_and_weekend_tags_are_derived_from_the_schedule(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, start_hour=20, hours=12, urgent=True)

    item = client.get("/api/v1/shifts", headers=auth_headers).json()["items"][0]
    assert "Night" in item["tags"]
    assert "Urgent" in item["tags"]
    assert item["durationHours"] == 12.0


def test_shift_type_filter_actually_narrows_results(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, start_hour=20, days_ahead=3)   # night
    make_shift(db_session, facility, start_hour=9, days_ahead=4)    # day

    assert client.get("/api/v1/shifts", headers=auth_headers).json()["total"] == 2

    night = client.get("/api/v1/shifts?shiftType=Night", headers=auth_headers).json()
    assert night["total"] == 1
    assert all("Night" in item["tags"] for item in night["items"])

    day = client.get("/api/v1/shifts?shiftType=Day", headers=auth_headers).json()
    assert day["total"] == 1


def test_pay_filter_is_applied_in_sql_so_totals_stay_correct(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, pay=9500, days_ahead=3)
    make_shift(db_session, facility, pay=6200, days_ahead=4)

    body = client.get("/api/v1/shifts?minPay=9000", headers=auth_headers).json()
    assert body["total"] == 1, "total must reflect the filter, not the unfiltered count"
    assert body["items"][0]["payRate"] == 9500.0


def test_search_matches_facility_and_specialty(client, auth_headers, db_session):
    apollo = make_facility(db_session, name="Apollo Hospital")
    ruby = make_facility(db_session, name="Ruby Medical Centre")
    make_shift(db_session, apollo)
    make_shift(db_session, ruby, days_ahead=4)

    body = client.get("/api/v1/shifts?search=Apollo", headers=auth_headers).json()
    assert body["total"] == 1
    assert body["items"][0]["facility"]["name"] == "Apollo Hospital"


def test_past_and_full_shifts_are_not_listed(client, auth_headers, db_session):
    facility = make_facility(db_session)
    make_shift(db_session, facility, days_ahead=-2)               # already started
    full = make_shift(db_session, facility, days_ahead=5, slots=1)
    full.slots_filled = 1
    db_session.commit()

    assert client.get("/api/v1/shifts", headers=auth_headers).json()["total"] == 0


def test_facility_initials_are_generated_for_the_card_avatar(client, auth_headers, db_session):
    facility = make_facility(db_session, name="St. Joseph Hospital")
    make_shift(db_session, facility)

    item = client.get("/api/v1/shifts", headers=auth_headers).json()["items"][0]
    assert item["facility"]["initials"] == "SJ"
    assert item["facility"]["location"] == "Kothrud, Pune"


def test_favorite_round_trip(client, auth_headers, db_session):
    facility = make_facility(db_session)
    shift = make_shift(db_session, facility)

    assert client.post(f"/api/v1/shifts/{shift.id}/favorite", headers=auth_headers).status_code == 201
    detail = client.get(f"/api/v1/shifts/{shift.id}", headers=auth_headers).json()
    assert detail["isFavorite"] is True
    assert client.get("/api/v1/shifts/favorites", headers=auth_headers).json()["total"] == 1

    client.delete(f"/api/v1/shifts/{shift.id}/favorite", headers=auth_headers)
    assert client.get("/api/v1/shifts/favorites", headers=auth_headers).json()["total"] == 0


def test_favoriting_the_same_shift_twice_is_idempotent(client, auth_headers, db_session):
    facility = make_facility(db_session)
    shift = make_shift(db_session, facility)

    client.post(f"/api/v1/shifts/{shift.id}/favorite", headers=auth_headers)
    client.post(f"/api/v1/shifts/{shift.id}/favorite", headers=auth_headers)
    assert client.get("/api/v1/shifts/favorites", headers=auth_headers).json()["total"] == 1


def test_shift_detail_includes_requirements_and_amenities(client, auth_headers, db_session):
    facility = make_facility(db_session)
    shift = make_shift(db_session, facility)

    body = client.get(f"/api/v1/shifts/{shift.id}", headers=auth_headers).json()
    assert body["requirements"]
    assert body["amenities"] == ["On-call room", "Meals provided"]
