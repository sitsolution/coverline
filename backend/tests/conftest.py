"""Test fixtures.

Each test runs against a fresh in-memory SQLite database with the real schema,
so tests are isolated and need no MySQL server.
"""

import os
import tempfile

# Set before app.core.config is imported — Settings is cached at import time.
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-used-anywhere-real")
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("DEBUG", "true")
# Keep uploaded fixtures out of the working tree.
os.environ.setdefault("UPLOAD_DIR", tempfile.mkdtemp(prefix="coverline-test-uploads-"))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import the model registry first: it populates Base.metadata, and importing
# it as `app.models` afterwards would rebind the name `app` away from the
# FastAPI instance.
import app.models  # noqa: F401

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,   # one shared connection, so :memory: persists
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


DOCTOR = {
    "fullName": "Dr. Ananya Rao",
    "email": "ananya@example.com",
    "phone": "+919812345678",
    "password": "Password1",
    "role": "doctor",
    "licenseNumber": "MCI-2019-88213",
    "specialty": "Emergency Med.",
    "experience": "6–10 years",
    "acceptedTerms": True,
}


@pytest.fixture
def registered_doctor(client):
    """A registered, OTP-verified doctor plus their auth header."""
    response = client.post("/api/v1/auth/register", json=DOCTOR)
    assert response.status_code == 201, response.text
    body = response.json()

    verified = client.post(
        "/api/v1/auth/verify-otp",
        json={"email": DOCTOR["email"], "code": body["debugOtp"]},
    )
    assert verified.status_code == 200, verified.text
    token = verified.json()["accessToken"]
    return {"headers": {"Authorization": f"Bearer {token}"}, "body": verified.json()}


@pytest.fixture
def auth_headers(registered_doctor):
    return registered_doctor["headers"]
