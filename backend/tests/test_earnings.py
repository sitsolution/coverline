from app.models.enums import PaymentStatus
from tests.factories import make_facility, make_payment, make_shift


def _user_id(registered_doctor):
    return registered_doctor["body"]["userId"]


def test_summary_separates_paid_from_pending(client, registered_doctor, db_session):
    headers = registered_doctor["headers"]
    facility = make_facility(db_session)
    shift = make_shift(db_session, facility, days_ahead=-5)

    make_payment(db_session, _user_id(registered_doctor), shift, amount=9500,
                 status=PaymentStatus.paid)
    make_payment(db_session, _user_id(registered_doctor), shift, amount=7000,
                 status=PaymentStatus.pending)

    body = client.get("/api/v1/earnings/summary", headers=headers).json()
    assert body["totalEarnings"] == 9500.0
    assert body["pending"] == 7000.0
    assert body["availableToWithdraw"] == 9500.0
    assert body["nextPayoutDate"]


def test_trend_returns_a_fixed_number_of_bars_including_empty_months(
    client, registered_doctor, db_session
):
    body = client.get("/api/v1/earnings/trend?months=7", headers=registered_doctor["headers"]).json()
    assert len(body) == 7, "the chart needs a stable bar count even with no earnings"
    assert all(point["amount"] == 0.0 for point in body)
    assert all(point["label"] for point in body)


def test_payout_cannot_exceed_the_available_balance(client, registered_doctor, db_session):
    headers = registered_doctor["headers"]
    shift = make_shift(db_session, make_facility(db_session), days_ahead=-5)
    make_payment(db_session, _user_id(registered_doctor), shift, amount=9500)

    response = client.post("/api/v1/earnings/payouts", headers=headers, json={"amount": 50000})
    assert response.status_code == 400
    assert "exceeds" in response.json()["detail"]


def test_payout_below_the_minimum_is_rejected(client, registered_doctor, db_session):
    headers = registered_doctor["headers"]
    shift = make_shift(db_session, make_facility(db_session), days_ahead=-5)
    make_payment(db_session, _user_id(registered_doctor), shift, amount=9500)

    response = client.post("/api/v1/earnings/payouts", headers=headers, json={"amount": 100})
    assert response.status_code == 400
    assert "Minimum" in response.json()["detail"]


def test_payout_defaults_to_the_whole_balance_and_blocks_a_second_request(
    client, registered_doctor, db_session
):
    headers = registered_doctor["headers"]
    shift = make_shift(db_session, make_facility(db_session), days_ahead=-5)
    make_payment(db_session, _user_id(registered_doctor), shift, amount=9500)

    first = client.post("/api/v1/earnings/payouts", headers=headers, json={})
    assert first.status_code == 201
    assert first.json()["amount"] == 9500.0

    second = client.post("/api/v1/earnings/payouts", headers=headers, json={})
    assert second.status_code == 409, "an in-flight payout is the reason, not a zero balance"
    assert "in progress" in second.json()["detail"]


def test_payout_with_no_earnings_is_rejected(client, registered_doctor):
    response = client.post("/api/v1/earnings/payouts", headers=registered_doctor["headers"], json={})
    assert response.status_code == 400
    assert "no balance" in response.json()["detail"]
