import sys
import types

# Python 3.13+ removed imghdr; provide a stub so legacy imports don't break.
if "imghdr" not in sys.modules:
    _stub = types.ModuleType("imghdr")
    _stub.what = lambda *a, **kw: None  # type: ignore[attr-defined]
    sys.modules["imghdr"] = _stub

import pytest
from django.test import Client
from django.contrib.auth.models import User


@pytest.fixture
def client():
    return Client()


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        username='teststaff',
        password='TestPass@1234',
        is_staff=True,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username='testadmin',
        password='AdminPass@1234',
    )


@pytest.fixture
def authenticated_client(client, staff_user):
    client.login(username='teststaff', password='TestPass@1234')
    return client


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient
    return APIClient()


@pytest.fixture
def authenticated_api_client(api_client, staff_user):
    api_client.force_authenticate(user=staff_user)
    return api_client
