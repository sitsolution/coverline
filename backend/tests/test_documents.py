from datetime import date, timedelta

PDF = ("license.pdf", b"%PDF-1.4 fake", "application/pdf")


def _upload(client, headers, **overrides):
    data = {"docType": "medical_license", "confirmed": "true", **overrides}
    return client.post("/api/v1/documents", headers=headers, files={"file": PDF}, data=data)


def test_upload_requires_the_confirmation_checkbox(client, auth_headers):
    response = _upload(client, auth_headers, confirmed="false")
    assert response.status_code == 400
    assert "confirm" in response.json()["detail"]


def test_upload_rejects_a_disallowed_file_type(client, auth_headers):
    response = client.post(
        "/api/v1/documents",
        headers=auth_headers,
        files={"file": ("x.exe", b"MZ", "application/x-msdownload")},
        data={"docType": "medical_license", "confirmed": "true"},
    )
    assert response.status_code == 415


def test_upload_rejects_an_already_expired_document(client, auth_headers):
    past = (date.today() - timedelta(days=1)).isoformat()
    response = _upload(client, auth_headers, expiryDate=past)
    assert response.status_code == 400
    assert "expired" in response.json()["detail"]


def test_upload_rejects_expiry_before_issue(client, auth_headers):
    response = _upload(
        client, auth_headers,
        issueDate=(date.today() + timedelta(days=10)).isoformat(),
        expiryDate=(date.today() + timedelta(days=5)).isoformat(),
    )
    assert response.status_code == 400


def test_uploaded_document_starts_pending_review(client, auth_headers):
    response = _upload(client, auth_headers, documentNumber="MCI-2019-88213")
    assert response.status_code == 201

    body = response.json()
    assert body["status"] == "pending"
    assert body["documentNumber"] == "MCI-2019-88213"
    assert body["fileUrl"].endswith("/file")


def test_documents_are_grouped_with_one_badge_per_type(client, auth_headers):
    _upload(client, auth_headers)

    body = client.get("/api/v1/documents", headers=auth_headers).json()
    groups = {group["title"]: group for group in body["groups"]}

    assert groups["Medical License"]["statusLabel"] == "Pending"
    assert groups["Medical License"]["statusVariant"] == "warning"
    # A required type with nothing uploaded still appears, so the screen can prompt.
    assert groups["ID Proof"]["statusLabel"] == "Missing"
    assert body["pendingCount"] == 1


def test_expiring_soon_is_flagged(client, auth_headers):
    soon = (date.today() + timedelta(days=10)).isoformat()
    body = _upload(client, auth_headers, expiryDate=soon).json()
    assert body["isExpiringSoon"] is True
    assert body["daysUntilExpiry"] == 10


def test_owner_can_download_their_file(client, auth_headers):
    document_id = _upload(client, auth_headers).json()["id"]
    response = client.get(f"/api/v1/documents/{document_id}/file", headers=auth_headers)
    assert response.status_code == 200
    assert response.content == PDF[1]


def test_another_user_cannot_download_the_file(client, auth_headers):
    """Documents are served through an authorised route, not as static files."""
    document_id = _upload(client, auth_headers).json()["id"]

    other = client.post("/api/v1/auth/register", json={
        "fullName": "Other Doctor", "email": "other@example.com", "phone": "+919888888888",
        "password": "Password1", "role": "doctor", "licenseNumber": "MCI-2", 
        "specialty": "General Med.", "acceptedTerms": True}).json()
    headers = {"Authorization": f"Bearer {other['accessToken']}"}

    assert client.get(f"/api/v1/documents/{document_id}/file", headers=headers).status_code == 404


def test_delete_removes_the_document(client, auth_headers):
    document_id = _upload(client, auth_headers).json()["id"]
    assert client.delete(f"/api/v1/documents/{document_id}", headers=auth_headers).status_code == 200
    assert client.get(f"/api/v1/documents/{document_id}/file", headers=auth_headers).status_code == 404
