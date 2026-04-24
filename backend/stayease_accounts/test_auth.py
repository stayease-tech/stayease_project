"""
Tests for authentication flows: session login, JWT mobile login, logout, and rate limiting.
"""
import json
import pytest
from django.test import override_settings


# ---------------------------------------------------------------------------
# Session-based login  (POST /accounts/login-data/)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestSessionLogin:
    url = "/accounts/login-data/"

    def test_staff_login_valid_credentials(self, client, staff_user):
        """Valid username/password returns 200 with success=True."""
        payload = json.dumps({"username": "teststaff", "password": "TestPass@1234"})
        response = client.post(self.url, data=payload, content_type="application/json")
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["username"] == "teststaff"

    def test_staff_login_invalid_credentials(self, client, staff_user):
        """Wrong password returns 400 with success=False."""
        payload = json.dumps({"username": "teststaff", "password": "WrongPass"})
        response = client.post(self.url, data=payload, content_type="application/json")
        assert response.status_code == 400
        body = response.json()
        assert body["success"] is False

    def test_staff_login_missing_fields(self, client, db):
        """Missing username/password should not cause a 500."""
        payload = json.dumps({})
        response = client.post(self.url, data=payload, content_type="application/json")
        # The view calls authenticate with None/None which returns None -> 400
        assert response.status_code == 400

    def test_staff_login_nonexistent_user(self, client, db):
        """Login with a user that does not exist returns 400."""
        payload = json.dumps({"username": "nobody", "password": "NoPass@123"})
        response = client.post(self.url, data=payload, content_type="application/json")
        assert response.status_code == 400


# ---------------------------------------------------------------------------
# JWT mobile login  (POST /api/token/)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestMobileLogin:
    url = "/api/token/"

    def test_mobile_login_valid(self, api_client, staff_user):
        """Valid credentials return 200 with JWT tokens."""
        response = api_client.post(
            self.url,
            {"username": "teststaff", "password": "TestPass@1234"},
            format="json",
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert "access" in body
        assert "refresh" in body

    def test_mobile_login_invalid(self, api_client, staff_user):
        """Invalid credentials return 401."""
        response = api_client.post(
            self.url,
            {"username": "teststaff", "password": "WrongPass"},
            format="json",
        )
        assert response.status_code == 401

    def test_mobile_login_missing_fields(self, api_client, db):
        """Missing fields return 400."""
        response = api_client.post(self.url, {}, format="json")
        assert response.status_code == 400

    @override_settings(
        CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}},
    )
    def test_mobile_login_rate_limiting(self, api_client, staff_user):
        """After 5 failed attempts, the 6th should be throttled (429)."""
        for i in range(5):
            api_client.post(
                self.url,
                {"username": "teststaff", "password": "bad"},
                format="json",
            )
        response = api_client.post(
            self.url,
            {"username": "teststaff", "password": "bad"},
            format="json",
        )
        assert response.status_code == 429


# ---------------------------------------------------------------------------
# Logout  (POST /accounts/logout/)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestLogout:
    url = "/accounts/logout/"

    def test_logout_requires_auth(self, client, db):
        """Unauthenticated user is redirected (302) by @login_required."""
        response = client.post(self.url, content_type="application/json")
        assert response.status_code == 302

    def test_logout_authenticated(self, authenticated_client):
        """Authenticated user can log out successfully."""
        response = authenticated_client.post(
            self.url,
            data=json.dumps({}),
            content_type="application/json",
        )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True


# ---------------------------------------------------------------------------
# Auth check  (GET /accounts/auth-check/)
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestAuthCheck:

    def test_auth_check_unauthenticated(self, client, db):
        """Unauthenticated access to auth-check should redirect (302)."""
        response = client.get("/accounts/auth-check/")
        assert response.status_code == 302

    def test_auth_check_authenticated(self, authenticated_client):
        """Authenticated user sees isAuthenticated=True."""
        response = authenticated_client.get("/accounts/auth-check/")
        assert response.status_code == 200
        body = response.json()
        assert body["isAuthenticated"] is True
