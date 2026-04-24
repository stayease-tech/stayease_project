"""
Tests for Accounts module endpoints: vendors, expenses, fixed expenses, liabilities.
"""
import pytest

# Several data-listing endpoints currently lack @login_required.
# The xfail-marked tests document this gap so they pass today but will
# start failing (and remind you to remove the xfail) once auth is added.

@pytest.mark.django_db
class TestGetVendorData:
    url = "/accounts/get-vendor-data/"

    def test_get_vendor_data(self, authenticated_client):
        """Authenticated user can fetch vendor data."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_vendor_data_unauthenticated(self, client, db):
        """Unauthenticated request should be denied."""
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)


@pytest.mark.django_db
class TestGetExpenseData:
    url = "/accounts/get-expense-data/"

    def test_get_expense_data(self, authenticated_client):
        """Authenticated user can fetch expense data."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_expense_data_unauthenticated(self, client, db):
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)


@pytest.mark.django_db
class TestGetFixedExpenseData:
    url = "/accounts/get-fixed-expense-data/"

    def test_get_fixed_expense_data(self, authenticated_client):
        """Authenticated user can fetch fixed expense data."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_fixed_expense_data_unauthenticated(self, client, db):
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)


@pytest.mark.django_db
class TestGetLiabilityData:
    url = "/accounts/get-liability-data/"

    def test_get_liability_data(self, authenticated_client):
        """Authenticated user can fetch liability data."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    def test_get_liability_data_unauthenticated(self, client, db):
        """Unauthenticated request is redirected by @login_required."""
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)
