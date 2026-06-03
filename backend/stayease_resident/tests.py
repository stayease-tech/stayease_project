# Copyright (c) 2026 Aravind Adari. All rights reserved.

import pytest
from django.contrib.auth.models import User, Group
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from stayease_sales.models import resident_Data
from stayease_resident.views import _validate_kyc_file


# ── Fixtures ──────────────────────────────────────────────────────────

@pytest.fixture
def resident_user(db):
    """Create a User with a linked resident_Data record (KYC Pending)."""
    user = User.objects.create_user(username='9876543210', password='ResPass@1234')
    group, _ = Group.objects.get_or_create(name='Resident')
    user.groups.add(group)
    resident = resident_Data.objects.create(
        residentUser=user,
        residentsName='Test Resident',
        phoneNumber='9876543210',
        email='resident@example.com',
        kycApprovalStatus='Pending',
    )
    return user, resident


@pytest.fixture
def approved_resident_user(db):
    """Create a User with a linked resident_Data record (KYC Approved)."""
    user = User.objects.create_user(username='9876500000', password='ResPass@1234')
    group, _ = Group.objects.get_or_create(name='Resident')
    user.groups.add(group)
    resident = resident_Data.objects.create(
        residentUser=user,
        residentsName='Approved Resident',
        phoneNumber='9876500000',
        email='approved@example.com',
        kycApprovalStatus='Approved',
    )
    return user, resident


@pytest.fixture
def resident_api_client(resident_user):
    """APIClient authenticated as a KYC-pending resident."""
    user, _ = resident_user
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def approved_api_client(approved_resident_user):
    """APIClient authenticated as a KYC-approved resident."""
    user, _ = approved_resident_user
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# ── Helper: build test files ──────────────────────────────────────────

def _jpeg_file(name='test.jpg', size=1024):
    """Valid JPEG (starts with \\xff\\xd8\\xff)."""
    content = b'\xff\xd8\xff\xe0' + b'\x00' * (size - 4)
    return SimpleUploadedFile(name, content, content_type='image/jpeg')


def _png_file(name='test.png', size=1024):
    """Valid PNG (starts with \\x89PNG\\r\\n\\x1a\\n)."""
    content = b'\x89PNG\r\n\x1a\n' + b'\x00' * (size - 8)
    return SimpleUploadedFile(name, content, content_type='image/png')


def _pdf_file(name='test.pdf', size=1024):
    """Valid PDF (starts with %PDF)."""
    content = b'%PDF-1.4' + b'\x00' * (size - 8)
    return SimpleUploadedFile(name, content, content_type='application/pdf')


def _exe_file(name='malicious.pdf', size=1024):
    """EXE disguised as PDF — MZ header."""
    content = b'MZ' + b'\x00' * (size - 2)
    return SimpleUploadedFile(name, content, content_type='application/pdf')


def _oversized_file(name='huge.jpg'):
    """File that exceeds 5 MB limit."""
    f = SimpleUploadedFile(name, b'\xff\xd8\xff\xe0' + b'\x00' * 100)
    f.size = 6 * 1024 * 1024  # 6 MB
    return f


# ══════════════════════════════════════════════════════════════════════
# Tests: _validate_kyc_file helper
# ══════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestValidateKycFile:

    def test_valid_jpeg(self):
        assert _validate_kyc_file(_jpeg_file()) is None

    def test_valid_png(self):
        assert _validate_kyc_file(_png_file()) is None

    def test_valid_pdf(self):
        assert _validate_kyc_file(_pdf_file()) is None

    def test_rejects_oversized_file(self):
        error = _validate_kyc_file(_oversized_file())
        assert error is not None
        assert '5 MB' in error

    def test_rejects_exe_disguised_as_pdf(self):
        error = _validate_kyc_file(_exe_file())
        assert error is not None
        assert 'not a valid' in error

    def test_rejects_plain_text(self):
        txt = SimpleUploadedFile('doc.txt', b'Hello world', content_type='text/plain')
        error = _validate_kyc_file(txt)
        assert error is not None
        assert 'not a valid' in error

    def test_rejects_empty_file_bad_magic(self):
        empty = SimpleUploadedFile('empty.jpg', b'\x00\x00\x00\x00', content_type='image/jpeg')
        error = _validate_kyc_file(empty)
        assert error is not None


# ══════════════════════════════════════════════════════════════════════
# Tests: KYC gating on rent-history endpoint
# ══════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestRentHistoryKycGating:
    url = '/resident-portal/rent-history/'

    def test_blocked_when_kyc_pending(self, resident_api_client):
        response = resident_api_client.get(self.url)
        assert response.status_code == 403
        assert response.json()['success'] is False
        assert 'KYC' in response.json()['message']

    def test_allowed_when_kyc_approved(self, approved_api_client):
        response = approved_api_client.get(self.url)
        assert response.status_code == 200
        assert response.json()['success'] is True

    def test_unauthenticated_rejected(self):
        client = APIClient()
        response = client.get(self.url)
        assert response.status_code == 401


# ══════════════════════════════════════════════════════════════════════
# Tests: KYC gating on complaints endpoints
# ══════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestComplaintsKycGating:
    list_url = '/resident-portal/complaints/'
    submit_url = '/resident-portal/complaints/submit/'

    def test_list_blocked_when_kyc_pending(self, resident_api_client):
        response = resident_api_client.get(self.list_url)
        assert response.status_code == 403
        assert 'KYC' in response.json()['message']

    def test_list_allowed_when_kyc_approved(self, approved_api_client):
        response = approved_api_client.get(self.list_url)
        assert response.status_code == 200
        assert response.json()['success'] is True

    def test_submit_blocked_when_kyc_pending(self, resident_api_client):
        response = resident_api_client.post(
            self.submit_url,
            {'issueDesc': 'Leaking tap', 'preferredTime': 'Morning'},
            format='json',
        )
        assert response.status_code == 403

    def test_submit_allowed_when_kyc_approved(self, approved_api_client):
        response = approved_api_client.post(
            self.submit_url,
            {'issueDesc': 'Leaking tap', 'preferredTime': 'Morning'},
            format='json',
        )
        assert response.status_code == 200
        assert response.json()['success'] is True

    def test_unauthenticated_rejected(self):
        client = APIClient()
        response = client.get(self.list_url)
        assert response.status_code == 401


# ══════════════════════════════════════════════════════════════════════
# Tests: KYC upload file validation
# ══════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestKycUploadValidation:
    url = '/resident-portal/kyc/upload/'

    def test_upload_valid_jpeg(self, resident_api_client):
        response = resident_api_client.post(self.url, {
            'aadharNumber': '123456789012',
            'aadharFrontCopy': _jpeg_file(),
        }, format='multipart')
        assert response.status_code == 200
        assert response.json()['success'] is True

    def test_upload_valid_pdf(self, resident_api_client):
        response = resident_api_client.post(self.url, {
            'aadharFrontCopy': _pdf_file(),
        }, format='multipart')
        assert response.status_code == 200

    def test_upload_valid_png(self, resident_api_client):
        response = resident_api_client.post(self.url, {
            'panFrontCopy': _png_file(),
        }, format='multipart')
        assert response.status_code == 200

    def test_rejects_exe_disguised_as_pdf(self, resident_api_client):
        response = resident_api_client.post(self.url, {
            'aadharFrontCopy': _exe_file(),
        }, format='multipart')
        assert response.status_code == 400
        assert 'not a valid' in response.json()['message']

    def test_rejects_oversized_file(self, resident_api_client):
        # Build a file >5MB with valid JPEG header
        large_content = b'\xff\xd8\xff\xe0' + b'\x00' * (5 * 1024 * 1024 + 100)
        large_file = SimpleUploadedFile('big.jpg', large_content, content_type='image/jpeg')
        response = resident_api_client.post(self.url, {
            'aadharFrontCopy': large_file,
        }, format='multipart')
        assert response.status_code == 400
        assert '5 MB' in response.json()['message']

    def test_rejects_text_file(self, resident_api_client):
        txt = SimpleUploadedFile('notes.txt', b'some text', content_type='text/plain')
        response = resident_api_client.post(self.url, {
            'aadharFrontCopy': txt,
        }, format='multipart')
        assert response.status_code == 400

    def test_upload_blocked_when_already_approved(self, approved_api_client):
        response = approved_api_client.post(self.url, {
            'aadharFrontCopy': _jpeg_file(),
        }, format='multipart')
        assert response.status_code == 400
        assert 'already approved' in response.json()['message']

    def test_rejected_kyc_resets_to_pending(self, resident_user):
        user, resident = resident_user
        resident.kycApprovalStatus = 'Rejected'
        resident.kycRejectionReason = 'Blurry document'
        resident.save()

        client = APIClient()
        client.force_authenticate(user=user)
        response = client.post(self.url, {
            'aadharFrontCopy': _jpeg_file(),
        }, format='multipart')
        assert response.status_code == 200

        resident.refresh_from_db()
        assert resident.kycApprovalStatus == 'Pending'
        assert resident.kycRejectionReason is None


# ══════════════════════════════════════════════════════════════════════
# Tests: Dashboard returns KYC status correctly
# ══════════════════════════════════════════════════════════════════════

@pytest.mark.django_db
class TestDashboardKycStatus:
    url = '/resident-portal/dashboard/'

    def test_dashboard_returns_pending_status(self, resident_api_client):
        response = resident_api_client.get(self.url)
        assert response.status_code == 200
        body = response.json()
        assert body['kycApprovalStatus'] == 'Pending'

    def test_dashboard_returns_approved_status(self, approved_api_client):
        response = approved_api_client.get(self.url)
        assert response.status_code == 200
        body = response.json()
        assert body['kycApprovalStatus'] == 'Approved'
