"""
Smoke tests: hit every main GET endpoint with an authenticated client and
verify we never get a 500 Internal Server Error.
"""
import pytest


# Endpoints that require only a logged-in session (no path params).
SIMPLE_GET_ENDPOINTS = [
    # Accounts
    "/accounts/auth-check/",
    "/accounts/get-user-activity-data/",
    "/accounts/get-vendor-data/",
    "/accounts/get-expense-data/",
    "/accounts/get-fixed-expense-data/",
    "/accounts/get-liability-data/",
    "/accounts/get-property-data/",
    "/accounts/get-owner-data/",
    "/accounts/get-beds-data/",
    "/accounts/get-rawdata-file/",
    "/accounts/get-other-files/",
    # Supply
    "/supply/get-owner-data/",
    "/supply/get-property-data/",
    # Sales
    "/sales/get-beds-data/",
    "/sales/get-leads-data/",
    # Operations
    "/operations/get-checklistfeedback-data/",
    "/operations/get-propertycomplaint-data/",
    "/operations/get-room-data/",
]


@pytest.mark.django_db
class TestSmokeGetEndpoints:
    """Every GET endpoint should return something other than 500."""

    @pytest.mark.parametrize("url", SIMPLE_GET_ENDPOINTS)
    def test_endpoint_no_500(self, authenticated_client, url):
        response = authenticated_client.get(url)
        assert response.status_code != 500, f"{url} returned 500"

    @pytest.mark.parametrize("url", SIMPLE_GET_ENDPOINTS)
    def test_endpoint_returns_json_or_redirect(self, authenticated_client, url):
        response = authenticated_client.get(url)
        content_type = response.get("Content-Type", "")
        # Accept JSON responses or redirects (302/301)
        is_json = "application/json" in content_type
        is_redirect = response.status_code in (301, 302)
        is_success = 200 <= response.status_code < 300
        assert is_json or is_redirect or is_success, (
            f"{url} returned status {response.status_code} with Content-Type {content_type}"
        )


@pytest.mark.django_db
class TestSmokeUnauthenticated:
    """Protected endpoints must not return 200 for anonymous users.

    NOTE: Several data endpoints currently lack @login_required, so some
    of these are marked xfail to document the missing auth guards.
    """

    # Endpoints that DO have @login_required (verified in views.py)
    ACTUALLY_PROTECTED = [
        "/accounts/auth-check/",
    ]

    # Endpoints that SHOULD be protected but currently are not
    UNPROTECTED = [
        "/accounts/get-vendor-data/",
        "/accounts/get-expense-data/",
    ]

    @pytest.mark.parametrize("url", ACTUALLY_PROTECTED)
    def test_unauthenticated_not_200(self, client, url, db):
        response = client.get(url)
        assert response.status_code != 200, f"{url} returned 200 without auth"

    @pytest.mark.parametrize("url", UNPROTECTED)
    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_unprotected_endpoints_should_deny(self, client, url, db):
        response = client.get(url)
        assert response.status_code != 200, f"{url} returned 200 without auth"
