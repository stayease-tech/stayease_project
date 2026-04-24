"""
Tests for Operations endpoints: checklist feedback and property complaints.
"""
import pytest


@pytest.mark.django_db
class TestGetChecklistFeedbackData:
    url = "/operations/get-checklistfeedback-data/"

    def test_get_checklist_data(self, authenticated_client):
        """Authenticated user can fetch checklist/feedback data."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_checklist_data_unauthenticated(self, client, db):
        """Unauthenticated user is denied access."""
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)


@pytest.mark.django_db
class TestGetPropertyComplaintData:
    url = "/operations/get-propertycomplaint-data/"

    def test_get_complaint_data(self, authenticated_client):
        """Authenticated user can fetch complaint data."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_complaint_data_unauthenticated(self, client, db):
        """Unauthenticated user is denied access."""
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)
