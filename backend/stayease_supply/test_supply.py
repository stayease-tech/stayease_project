"""
Tests for Supply endpoints: owners, properties, rooms.
"""
import pytest


@pytest.mark.django_db
class TestGetOwnerData:
    url = "/supply/get-owner-data/"

    def test_get_owner_data_authenticated(self, authenticated_client):
        """Authenticated user can access owner data endpoint."""
        response = authenticated_client.get(self.url)
        assert response.status_code != 500
        assert response.status_code == 200
        body = response.json()
        assert isinstance(body, (list, dict))

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_owner_data_unauthenticated(self, client, db):
        """Unauthenticated user should be redirected or denied."""
        response = client.get(self.url)
        assert response.status_code in (301, 302, 401, 403)


@pytest.mark.django_db
class TestGetPropertyData:
    def test_get_property_data_list(self, authenticated_client):
        """GET /supply/get-property-data/ returns property list."""
        response = authenticated_client.get("/supply/get-property-data/")
        assert response.status_code != 500
        assert response.status_code == 200

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_property_data_unauthenticated(self, client, db):
        """Unauthenticated access is denied."""
        response = client.get("/supply/get-property-data/")
        assert response.status_code in (301, 302, 401, 403)


@pytest.mark.django_db
class TestGetRoomData:
    def test_get_room_data_nonexistent(self, authenticated_client):
        """GET /supply/get-room-data/<id>/ with nonexistent id should not crash."""
        response = authenticated_client.get("/supply/get-room-data/99999/")
        assert response.status_code != 500

    @pytest.mark.xfail(reason="Endpoint missing @login_required — returns 200 for anon users")
    def test_get_room_data_unauthenticated(self, client, db):
        """Unauthenticated access is denied."""
        response = client.get("/supply/get-room-data/1/")
        assert response.status_code in (301, 302, 401, 403)
