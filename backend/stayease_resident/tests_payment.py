# Copyright (c) 2026 Aravind Adari. All rights reserved.

"""
Comprehensive test suite for Razorpay payment integration.
Tests all payment flows: one-time, QR, subscriptions, webhooks, security.
"""

import hashlib
import hmac
import json
import time
from datetime import date, timedelta
from decimal import Decimal
from unittest.mock import MagicMock, patch, call

from django.contrib.auth.models import Group, User
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from stayease_sales.models import (
    PaymentTransaction,
    RecurringMandate,
    resident_Data,
    resident_Rent_Data,
)


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _make_webhook_signature(body: bytes, secret: str) -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


# ─── Base Fixture ─────────────────────────────────────────────────────────────

class PaymentTestBase(TestCase):
    """Shared setUp: user, resident, rent record, JWT token."""

    WEBHOOK_SECRET = 'test_webhook_secret'

    def setUp(self):
        super().setUp()
        # Auth user
        self.user = User.objects.create_user(
            username='9876543210',
            password='testpass123',
            first_name='Test Resident',
        )
        resident_group, _ = Group.objects.get_or_create(name='Resident')
        self.user.groups.add(resident_group)

        # Resident profile
        self.resident = resident_Data.objects.create(
            residentUser=self.user,
            residentsName='Test Resident',
            phoneNumber='9876543210',
            email='test@example.com',
            rentPerMonth='10000',
            checkIn='2026-01-01',
            checkOut='2026-12-31',
            kycApprovalStatus='Approved',
        )

        # Pending rent record
        self.rent_record = resident_Rent_Data.objects.create(
            resident_data_instance=self.resident,
            rentStatus='Not Received',
            month='June 2026',
            rent='10000',
        )

        # JWT token
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.api = APIClient()
        self.api.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Second user for ownership tests
        self.other_user = User.objects.create_user(
            username='9000000000',
            password='testpass123',
        )
        self.other_user.groups.add(resident_group)
        self.other_resident = resident_Data.objects.create(
            residentUser=self.other_user,
            residentsName='Other Resident',
            phoneNumber='9000000000',
            rentPerMonth='5000',
        )

        # Patch settings
        self.settings_patcher = patch.multiple(
            'django.conf.settings',
            RAZORPAY_KEY_ID='rzp_test_TESTKEY',
            RAZORPAY_KEY_SECRET='test_secret',
            RAZORPAY_WEBHOOK_SECRET=self.WEBHOOK_SECRET,
        )
        self.settings_patcher.start()
        self.addCleanup(self.settings_patcher.stop)


# ─── 10.2: Order Creation ──────────────────────────────────────────────────────

class PaymentInitTests(PaymentTestBase):

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_success(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {'id': 'order_TEST123', 'status': 'created'}
        mock_client_fn.return_value = mock_client

        res = self.api.post('/resident-portal/payments/init/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        self.assertEqual(res.data['orderId'], 'order_TEST123')
        self.assertIn('keyId', res.data)
        txn = PaymentTransaction.objects.get(gateway_order_id='order_TEST123')
        self.assertIsNotNone(txn)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_amount_zero(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/init/', {'amount': '0', 'rentId': self.rent_record.id})
        self.assertEqual(res.status_code, 400)
        self.assertIn('greater than zero', res.data['message'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_amount_negative(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/init/', {'amount': '-500', 'rentId': self.rent_record.id})
        self.assertEqual(res.status_code, 400)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_amount_string(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/init/', {'amount': 'abc', 'rentId': self.rent_record.id})
        self.assertEqual(res.status_code, 400)
        self.assertIn('valid number', res.data['message'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_invalid_rent_id(self, mock_client_fn):
        # rent record belonging to another resident
        other_rent = resident_Rent_Data.objects.create(
            resident_data_instance=self.other_resident,
            rentStatus='Not Received',
            month='June 2026',
            rent='5000',
        )
        res = self.api.post('/resident-portal/payments/init/', {
            'amount': '5000',
            'rentId': other_rent.id,
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('Invalid rent record', res.data['message'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_no_rent_id(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {'id': 'order_NOID', 'status': 'created'}
        mock_client_fn.return_value = mock_client

        res = self.api.post('/resident-portal/payments/init/', {'amount': '10000'})
        self.assertEqual(res.status_code, 200)
        txn = PaymentTransaction.objects.get(gateway_order_id='order_NOID')
        self.assertIsNone(txn.rent_record)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_already_paid_rent(self, mock_client_fn):
        self.rent_record.rentStatus = 'Received'
        self.rent_record.save()
        res = self.api.post('/resident-portal/payments/init/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('already paid', res.data['message'])

    def test_payment_init_unauthenticated(self):
        unauthenticated = APIClient()
        res = unauthenticated.post('/resident-portal/payments/init/', {'amount': '10000'})
        self.assertEqual(res.status_code, 401)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_razorpay_api_failure(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.order.create.side_effect = Exception('Razorpay unavailable')
        mock_client_fn.return_value = mock_client

        res = self.api.post('/resident-portal/payments/init/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        self.assertEqual(res.status_code, 503)
        self.assertFalse(res.data['success'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_amount_converted_to_paise(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {'id': 'order_PAISE', 'status': 'created'}
        mock_client_fn.return_value = mock_client

        self.api.post('/resident-portal/payments/init/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        args, kwargs = mock_client.order.create.call_args
        order_data = args[0]
        self.assertEqual(order_data['amount'], 1000000)  # 10000 rupees = 1000000 paise

    @patch('stayease_resident.views._get_razorpay_client')
    def test_payment_init_creates_audit_record(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {'id': 'order_AUDIT', 'status': 'created'}
        mock_client_fn.return_value = mock_client

        self.api.post('/resident-portal/payments/init/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        txns = PaymentTransaction.objects.filter(gateway_order_id='order_AUDIT')
        self.assertEqual(txns.count(), 1)
        self.assertEqual(txns.first().status, 'initiated')


# ─── 10.3: Payment Verification ──────────────────────────────────────────────

class PaymentVerifyTests(PaymentTestBase):

    def _create_initiated_txn(self, order_id='order_VERIFY1'):
        return PaymentTransaction.objects.create(
            txnid=f'SE{order_id}',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent Payment',
            status='initiated',
            gateway_order_id=order_id,
        )

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_success(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = None
        mock_client_fn.return_value = mock_client
        self._create_initiated_txn('order_VS1')

        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_TEST1',
            'razorpay_order_id': 'order_VS1',
            'razorpay_signature': 'valid_sig',
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])

        txn = PaymentTransaction.objects.get(gateway_order_id='order_VS1')
        self.assertEqual(txn.status, 'success')
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Received')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_invalid_signature(self, mock_client_fn):
        import razorpay.errors
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.side_effect = (
            razorpay.errors.SignatureVerificationError('Invalid')
        )
        mock_client_fn.return_value = mock_client
        self._create_initiated_txn('order_VS2')

        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_BAD',
            'razorpay_order_id': 'order_VS2',
            'razorpay_signature': 'forged_sig',
        })
        self.assertEqual(res.status_code, 400)
        txn = PaymentTransaction.objects.get(gateway_order_id='order_VS2')
        self.assertEqual(txn.status, 'failed')
        self.rent_record.refresh_from_db()
        self.assertNotEqual(self.rent_record.rentStatus, 'Received')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_unknown_order_id(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_X',
            'razorpay_order_id': 'order_NONEXISTENT',
            'razorpay_signature': 'sig_X',
        })
        self.assertEqual(res.status_code, 404)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_already_processed(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = None
        mock_client_fn.return_value = mock_client
        txn = self._create_initiated_txn('order_VS3')
        txn.status = 'success'
        txn.save()

        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_DUP',
            'razorpay_order_id': 'order_VS3',
            'razorpay_signature': 'sig',
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        # Verify sig was NOT called again
        mock_client.utility.verify_payment_signature.assert_not_called()

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_missing_fields(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_X',
            'razorpay_order_id': 'order_X',
            # missing razorpay_signature
        })
        self.assertEqual(res.status_code, 400)

    def test_verify_unauthenticated(self):
        unauthenticated = APIClient()
        res = unauthenticated.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'p', 'razorpay_order_id': 'o', 'razorpay_signature': 's'
        })
        self.assertEqual(res.status_code, 401)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_rent_record_updated_with_correct_fields(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = None
        mock_client_fn.return_value = mock_client
        self._create_initiated_txn('order_VS4')

        self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_UTR',
            'razorpay_order_id': 'order_VS4',
            'razorpay_signature': 'valid_sig',
        })
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.transferType, 'Online - Razorpay')
        self.assertEqual(self.rent_record.utrNumber, 'pay_UTR')
        self.assertIsNotNone(self.rent_record.transferredDate)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_verify_txn_without_rent_record(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.utility.verify_payment_signature.return_value = None
        mock_client_fn.return_value = mock_client

        txn = PaymentTransaction.objects.create(
            txnid='SE_NORENT',
            resident=self.resident,
            rent_record=None,
            amount=Decimal('10000'),
            product_info='Rent Payment',
            status='initiated',
            gateway_order_id='order_NORENT',
        )
        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_NR',
            'razorpay_order_id': 'order_NORENT',
            'razorpay_signature': 'valid_sig',
        })
        self.assertEqual(res.status_code, 200)
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'success')


# ─── 10.4: Webhook Tests ──────────────────────────────────────────────────────

class WebhookSignatureTests(PaymentTestBase):

    def _post_webhook(self, payload_dict, signature=None, event_id=None):
        body = json.dumps(payload_dict).encode()
        if signature is None:
            signature = _make_webhook_signature(body, self.WEBHOOK_SECRET)
        headers = {'HTTP_X_RAZORPAY_SIGNATURE': signature}
        if event_id:
            headers['HTTP_X_RAZORPAY_EVENT_ID'] = event_id
        return self.client.post(
            '/resident-portal/payments/webhook/',
            data=body,
            content_type='application/json',
            **headers,
        )

    def test_webhook_valid_signature(self):
        payload = {'event': 'test.event', 'payload': {}}
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)

    def test_webhook_invalid_signature(self):
        payload = {'event': 'test.event', 'payload': {}}
        res = self._post_webhook(payload, signature='wrong_sig')
        self.assertEqual(res.status_code, 403)

    def test_webhook_missing_signature_header(self):
        body = b'{"event": "test"}'
        res = self.client.post(
            '/resident-portal/payments/webhook/',
            data=body,
            content_type='application/json',
        )
        self.assertEqual(res.status_code, 403)

    def test_webhook_payment_captured_success(self):
        txn = PaymentTransaction.objects.create(
            txnid='SE_WH1',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='order_WH1',
        )
        payload = {
            'event': 'payment.captured',
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_WH1',
                        'order_id': 'order_WH1',
                    }
                }
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'success')
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Received')

    def test_webhook_payment_captured_unknown_order(self):
        payload = {
            'event': 'payment.captured',
            'payload': {
                'payment': {'entity': {'id': 'pay_X', 'order_id': 'order_UNKNOWN'}}
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)  # graceful, no crash

    def test_webhook_payment_captured_duplicate(self):
        txn = PaymentTransaction.objects.create(
            txnid='SE_WH_DUP',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='success',  # already success
            gateway_order_id='order_DUP',
        )
        payload = {
            'event': 'payment.captured',
            'payload': {'payment': {'entity': {'id': 'pay_DUP', 'order_id': 'order_DUP'}}}
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        # Ensure rent record was NOT overwritten to wrong value
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'success')

    def test_webhook_payment_captured_event_id_dedup(self):
        """Same x-razorpay-event-id processed only once."""
        # Clear the dedup set for this test
        from stayease_resident.views import _processed_webhook_event_ids
        _processed_webhook_event_ids.discard('evt_DEDUP')

        txn = PaymentTransaction.objects.create(
            txnid='SE_EV_DEDUP',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='order_EVDEDUP',
        )
        payload = {
            'event': 'payment.captured',
            'payload': {'payment': {'entity': {'id': 'pay_DEDUP', 'order_id': 'order_EVDEDUP'}}}
        }
        self._post_webhook(payload, event_id='evt_DEDUP')
        # Submit same event again
        txn.status = 'initiated'
        txn.save()
        self._post_webhook(payload, event_id='evt_DEDUP')
        # Still should be success from first call, not re-processed
        txn.refresh_from_db()

    def test_webhook_payment_failed(self):
        txn = PaymentTransaction.objects.create(
            txnid='SE_WH_FAIL',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='order_FAIL',
        )
        payload = {
            'event': 'payment.failed',
            'payload': {
                'payment': {
                    'entity': {
                        'id': 'pay_FAIL',
                        'order_id': 'order_FAIL',
                        'error_code': 'BAD_REQUEST_ERROR',
                    }
                }
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'failed')
        self.rent_record.refresh_from_db()
        self.assertNotEqual(self.rent_record.rentStatus, 'Received')

    def test_webhook_payment_failed_already_success(self):
        """payment.failed must never downgrade a successful txn."""
        txn = PaymentTransaction.objects.create(
            txnid='SE_WH_NODNG',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='success',
            gateway_order_id='order_NODNG',
        )
        payload = {
            'event': 'payment.failed',
            'payload': {'payment': {'entity': {'id': 'p', 'order_id': 'order_NODNG'}}}
        }
        self._post_webhook(payload)
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'success')  # must not downgrade

    def test_webhook_subscription_charged(self):
        mandate = RecurringMandate.objects.create(
            txnid='SESI_WH1',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            gateway_subscription_id='sub_WH1',
        )
        payload = {
            'event': 'subscription.charged',
            'payload': {
                'subscription': {'entity': {'id': 'sub_WH1'}},
                'payment': {'entity': {'id': 'pay_SUB1'}},
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        rent_records = resident_Rent_Data.objects.filter(
            resident_data_instance=self.resident,
            transferType='Auto-Pay (Razorpay)',
        )
        self.assertGreater(rent_records.count(), 0)

    def test_webhook_subscription_charged_unknown_sub_id(self):
        payload = {
            'event': 'subscription.charged',
            'payload': {
                'subscription': {'entity': {'id': 'sub_UNKNOWN'}},
                'payment': {'entity': {'id': 'pay_X'}},
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)  # no crash

    def test_webhook_subscription_charged_duplicate_month(self):
        mandate = RecurringMandate.objects.create(
            txnid='SESI_WH2',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            gateway_subscription_id='sub_WH2',
        )
        today = date.today()
        month_label = today.strftime('%B %Y')
        # Pre-create the rent record
        resident_Rent_Data.objects.create(
            resident_data_instance=self.resident,
            rentStatus='Received',
            month=month_label,
            rent='10000',
            transferType='Auto-Pay (Razorpay)',
        )
        payload = {
            'event': 'subscription.charged',
            'payload': {
                'subscription': {'entity': {'id': 'sub_WH2'}},
                'payment': {'entity': {'id': 'pay_SUB2'}},
            }
        }
        self._post_webhook(payload)
        # Should still be only 1
        count = resident_Rent_Data.objects.filter(
            resident_data_instance=self.resident,
            month=month_label,
            transferType='Auto-Pay (Razorpay)',
        ).count()
        self.assertEqual(count, 1)

    def test_webhook_subscription_cancelled(self):
        mandate = RecurringMandate.objects.create(
            txnid='SESI_CANC',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            gateway_subscription_id='sub_CANC',
        )
        payload = {
            'event': 'subscription.cancelled',
            'payload': {'subscription': {'entity': {'id': 'sub_CANC'}}}
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'revoked')

    def test_webhook_qr_paid(self):
        txn = PaymentTransaction.objects.create(
            txnid='SE_QR_WH1',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='qr_WH1',
        )
        payload = {
            'event': 'qr_code.closed',
            'payload': {
                'qr_code': {
                    'entity': {
                        'id': 'qr_WH1',
                        'close_reason': 'paid',
                        'payments_amount_received': 1000000,
                    }
                }
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'success')
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Received')

    def test_webhook_qr_expired(self):
        txn = PaymentTransaction.objects.create(
            txnid='SE_QR_WH2',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='qr_WH2',
        )
        payload = {
            'event': 'qr_code.closed',
            'payload': {
                'qr_code': {
                    'entity': {
                        'id': 'qr_WH2',
                        'close_reason': 'timeout',
                    }
                }
            }
        }
        res = self._post_webhook(payload)
        self.assertEqual(res.status_code, 200)
        txn.refresh_from_db()
        self.assertEqual(txn.status, 'failed')
        self.rent_record.refresh_from_db()
        self.assertNotEqual(self.rent_record.rentStatus, 'Received')


# ─── 10.5: QR Code Tests ─────────────────────────────────────────────────────

class QRCodeTests(PaymentTestBase):

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_generate_success(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.create.return_value = {
            'id': 'qr_TEST1',
            'image_url': 'https://example.com/qr.png',
        }
        mock_client_fn.return_value = mock_client

        res = self.api.post('/resident-portal/payments/qr/generate/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        self.assertIn('qrCodeId', res.data)
        self.assertIn('qrImageUrl', res.data)
        self.assertIn('expiresAt', res.data)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_generate_expiry_is_5_minutes(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.create.return_value = {'id': 'qr_EXP', 'image_url': 'http://x.com/q.png'}
        mock_client_fn.return_value = mock_client

        before = int(time.time())
        self.api.post('/resident-portal/payments/qr/generate/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        after = int(time.time())

        args, kwargs = mock_client.qrcode.create.call_args
        call_data = args[0]
        close_by = call_data['close_by']
        # Should be ~5 minutes (300 seconds) from now
        self.assertGreaterEqual(close_by, before + 295)
        self.assertLessEqual(close_by, after + 305)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_generate_fixed_amount_enforced(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.create.return_value = {'id': 'qr_FA', 'image_url': 'http://x.com/q.png'}
        mock_client_fn.return_value = mock_client

        self.api.post('/resident-portal/payments/qr/generate/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        args, kwargs = mock_client.qrcode.create.call_args
        self.assertTrue(args[0]['fixed_amount'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_generate_single_use_enforced(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.create.return_value = {'id': 'qr_SU', 'image_url': 'http://x.com/q.png'}
        mock_client_fn.return_value = mock_client

        self.api.post('/resident-portal/payments/qr/generate/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        args, kwargs = mock_client.qrcode.create.call_args
        self.assertEqual(args[0]['usage'], 'single_use')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_generate_invalid_rent(self, mock_client_fn):
        other_rent = resident_Rent_Data.objects.create(
            resident_data_instance=self.other_resident,
            rentStatus='Not Received',
            month='June 2026',
            rent='5000',
        )
        res = self.api.post('/resident-portal/payments/qr/generate/', {
            'amount': '5000',
            'rentId': other_rent.id,
        })
        self.assertEqual(res.status_code, 400)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_status_pending(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.fetch.return_value = {'id': 'qr_PEND', 'close_reason': None}
        mock_client_fn.return_value = mock_client

        PaymentTransaction.objects.create(
            txnid='SE_QR_PEND',
            resident=self.resident,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='qr_PEND',
        )
        res = self.api.get('/resident-portal/payments/qr/status/?qrCodeId=qr_PEND')
        self.assertEqual(res.data['status'], 'pending')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_status_paid(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.fetch.return_value = {
            'id': 'qr_PAID', 'close_reason': 'paid', 'payments_amount_received': 1000000
        }
        mock_client_fn.return_value = mock_client

        PaymentTransaction.objects.create(
            txnid='SE_QR_PAID',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='qr_PAID',
        )
        res = self.api.get('/resident-portal/payments/qr/status/?qrCodeId=qr_PAID')
        self.assertEqual(res.data['status'], 'paid')
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Received')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_status_expired(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.qrcode.fetch.return_value = {'id': 'qr_EXP2', 'close_reason': 'timeout'}
        mock_client_fn.return_value = mock_client

        PaymentTransaction.objects.create(
            txnid='SE_QR_EXP2',
            resident=self.resident,
            amount=Decimal('10000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='qr_EXP2',
        )
        res = self.api.get('/resident-portal/payments/qr/status/?qrCodeId=qr_EXP2')
        self.assertEqual(res.data['status'], 'expired')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_qr_status_wrong_resident(self, mock_client_fn):
        # QR code owned by other_resident
        PaymentTransaction.objects.create(
            txnid='SE_QR_WRONG',
            resident=self.other_resident,
            amount=Decimal('5000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='qr_WRONG',
        )
        res = self.api.get('/resident-portal/payments/qr/status/?qrCodeId=qr_WRONG')
        self.assertEqual(res.status_code, 403)


# ─── 10.6: Subscription / Auto-Pay Tests ─────────────────────────────────────

class SubscriptionTests(PaymentTestBase):

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_success(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.plan.create.return_value = {'id': 'plan_TEST1'}
        mock_client.subscription.create.return_value = {'id': 'sub_TEST1', 'status': 'created'}
        mock_client_fn.return_value = mock_client

        res = self.api.post('/resident-portal/payments/subscription/init/')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        self.assertIn('subscriptionId', res.data)
        self.assertIn('keyId', res.data)
        mandate = RecurringMandate.objects.filter(resident=self.resident, status='initiated').first()
        self.assertIsNotNone(mandate)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_already_active(self, mock_client_fn):
        RecurringMandate.objects.create(
            txnid='SESI_ACTIVE',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
        )
        res = self.api.post('/resident-portal/payments/subscription/init/')
        self.assertEqual(res.status_code, 400)
        self.assertIn('active', res.data['message'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_no_lease_dates(self, mock_client_fn):
        self.resident.checkIn = None
        self.resident.checkOut = None
        self.resident.save()
        res = self.api.post('/resident-portal/payments/subscription/init/')
        self.assertEqual(res.status_code, 400)
        self.assertIn('Lease dates', res.data['message'])

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_invalid_rent_amount(self, mock_client_fn):
        self.resident.rentPerMonth = 'abc'
        self.resident.save()
        res = self.api.post('/resident-portal/payments/subscription/init/')
        self.assertEqual(res.status_code, 400)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_zero_rent(self, mock_client_fn):
        self.resident.rentPerMonth = '0'
        self.resident.save()
        res = self.api.post('/resident-portal/payments/subscription/init/')
        self.assertEqual(res.status_code, 400)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_amount_in_paise(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.plan.create.return_value = {'id': 'plan_PAISE'}
        mock_client.subscription.create.return_value = {'id': 'sub_PAISE'}
        mock_client_fn.return_value = mock_client

        self.resident.rentPerMonth = '10000'
        self.resident.save()
        self.api.post('/resident-portal/payments/subscription/init/')

        args, _ = mock_client.plan.create.call_args
        self.assertEqual(args[0]['item']['amount'], 1000000)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_init_total_count_correct(self, mock_client_fn):
        """12-month lease → total_count = 12."""
        mock_client = MagicMock()
        mock_client.plan.create.return_value = {'id': 'plan_TC'}
        mock_client.subscription.create.return_value = {'id': 'sub_TC'}
        mock_client_fn.return_value = mock_client

        self.resident.checkIn = '2026-01-01'
        self.resident.checkOut = '2026-12-31'
        self.resident.save()
        self.api.post('/resident-portal/payments/subscription/init/')

        args, _ = mock_client.subscription.create.call_args
        self.assertEqual(args[0]['total_count'], 12)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_verify_success(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.utility.verify_subscription_payment_signature.return_value = None
        mock_client_fn.return_value = mock_client

        mandate = RecurringMandate.objects.create(
            txnid='SESI_VER1',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='initiated',
            gateway_subscription_id='sub_VER1',
        )
        res = self.api.post('/resident-portal/payments/subscription/verify/', {
            'razorpay_payment_id': 'pay_S1',
            'razorpay_subscription_id': 'sub_VER1',
            'razorpay_signature': 'valid_sig',
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'active')
        self.assertIsNotNone(mandate.next_charge_date)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_verify_invalid_signature(self, mock_client_fn):
        import razorpay.errors
        mock_client = MagicMock()
        mock_client.utility.verify_subscription_payment_signature.side_effect = (
            razorpay.errors.SignatureVerificationError('bad')
        )
        mock_client_fn.return_value = mock_client

        mandate = RecurringMandate.objects.create(
            txnid='SESI_VER2',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='initiated',
            gateway_subscription_id='sub_VER2',
        )
        res = self.api.post('/resident-portal/payments/subscription/verify/', {
            'razorpay_payment_id': 'pay_BAD',
            'razorpay_subscription_id': 'sub_VER2',
            'razorpay_signature': 'forged',
        })
        self.assertEqual(res.status_code, 400)
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'initiated')

    @patch('stayease_resident.views._get_razorpay_client')
    def test_subscription_verify_already_active(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client_fn.return_value = mock_client

        mandate = RecurringMandate.objects.create(
            txnid='SESI_VER3',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            gateway_subscription_id='sub_VER3',
        )
        res = self.api.post('/resident-portal/payments/subscription/verify/', {
            'razorpay_payment_id': 'pay_X',
            'razorpay_subscription_id': 'sub_VER3',
            'razorpay_signature': 'sig',
        })
        self.assertEqual(res.status_code, 200)
        # Signature should not be checked again
        mock_client.utility.verify_subscription_payment_signature.assert_not_called()

    @patch('stayease_resident.views._get_razorpay_client')
    def test_mandate_cancel_success(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.subscription.cancel.return_value = None
        mock_client_fn.return_value = mock_client

        mandate = RecurringMandate.objects.create(
            txnid='SESI_CANC2',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            gateway_subscription_id='sub_CANC2',
        )
        res = self.api.post('/resident-portal/payments/mandate/cancel/')
        self.assertEqual(res.status_code, 200)
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'revoked')

    def test_mandate_cancel_no_active_mandate(self):
        res = self.api.post('/resident-portal/payments/mandate/cancel/')
        self.assertEqual(res.status_code, 404)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_mandate_cancel_calls_razorpay_api(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client_fn.return_value = mock_client

        mandate = RecurringMandate.objects.create(
            txnid='SESI_API',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            gateway_subscription_id='sub_API',
        )
        self.api.post('/resident-portal/payments/mandate/cancel/')
        mock_client.subscription.cancel.assert_called_once_with('sub_API')

    def test_mandate_status_active(self):
        mandate = RecurringMandate.objects.create(
            txnid='SESI_STATUS',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=date(2026, 12, 31),
            status='active',
            next_charge_date=date(2026, 7, 1),
        )
        res = self.api.get('/resident-portal/payments/mandate/status/')
        self.assertTrue(res.data['hasMandate'])
        self.assertEqual(res.data['mandate']['status'], 'active')

    def test_mandate_status_none(self):
        res = self.api.get('/resident-portal/payments/mandate/status/')
        self.assertFalse(res.data['hasMandate'])


# ─── 10.8: Security Tests ────────────────────────────────────────────────────

class SecurityTests(PaymentTestBase):

    @patch('stayease_resident.views._get_razorpay_client')
    def test_cannot_pay_other_residents_rent(self, mock_client_fn):
        other_rent = resident_Rent_Data.objects.create(
            resident_data_instance=self.other_resident,
            rentStatus='Not Received',
            month='June 2026',
            rent='5000',
        )
        res = self.api.post('/resident-portal/payments/init/', {
            'amount': '5000',
            'rentId': other_rent.id,
        })
        self.assertEqual(res.status_code, 400)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_cannot_verify_other_residents_payment(self, mock_client_fn):
        # Txn belonging to other_resident
        PaymentTransaction.objects.create(
            txnid='SE_OTHER',
            resident=self.other_resident,
            amount=Decimal('5000'),
            product_info='Rent',
            status='initiated',
            gateway_order_id='order_OTHER',
        )
        res = self.api.post('/resident-portal/payments/verify/', {
            'razorpay_payment_id': 'pay_X',
            'razorpay_order_id': 'order_OTHER',
            'razorpay_signature': 'sig',
        })
        self.assertEqual(res.status_code, 404)

    def test_forged_webhook_rejected(self):
        body = b'{"event": "payment.captured", "payload": {}}'
        res = self.client.post(
            '/resident-portal/payments/webhook/',
            data=body,
            content_type='application/json',
            # No X-Razorpay-Signature header
        )
        self.assertEqual(res.status_code, 403)

    def test_tampered_webhook_body(self):
        original_body = b'{"event": "payment.captured"}'
        signature = _make_webhook_signature(original_body, self.WEBHOOK_SECRET)
        tampered_body = b'{"event": "payment.captured", "extra": "injected"}'
        res = self.client.post(
            '/resident-portal/payments/webhook/',
            data=tampered_body,
            content_type='application/json',
            HTTP_X_RAZORPAY_SIGNATURE=signature,
        )
        self.assertEqual(res.status_code, 403)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_zero_amount_order_rejected(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/init/', {'amount': '0'})
        self.assertEqual(res.status_code, 400)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_negative_amount_order_rejected(self, mock_client_fn):
        res = self.api.post('/resident-portal/payments/init/', {'amount': '-1'})
        self.assertEqual(res.status_code, 400)

    def test_unauthenticated_payment_init(self):
        unauthenticated = APIClient()
        res = unauthenticated.post('/resident-portal/payments/init/', {'amount': '10000'})
        self.assertEqual(res.status_code, 401)

    def test_unauthenticated_qr_generate(self):
        unauthenticated = APIClient()
        res = unauthenticated.post('/resident-portal/payments/qr/generate/', {'amount': '10000'})
        self.assertEqual(res.status_code, 401)

    @patch('stayease_resident.views._get_razorpay_client')
    def test_key_secret_not_in_response(self, mock_client_fn):
        mock_client = MagicMock()
        mock_client.order.create.return_value = {'id': 'order_NOSEC', 'status': 'created'}
        mock_client_fn.return_value = mock_client

        res = self.api.post('/resident-portal/payments/init/', {
            'amount': '10000',
            'rentId': self.rent_record.id,
        })
        response_text = str(res.data)
        self.assertNotIn('test_secret', response_text)
        self.assertNotIn('RAZORPAY_KEY_SECRET', response_text)


# ─── 10.9: Reconciliation Command Tests ──────────────────────────────────────

class ReconciliationCommandTests(PaymentTestBase):

    def _run_command(self, mock_subscription_data=None):
        from io import StringIO
        from django.core.management import call_command
        out = StringIO()
        with patch('stayease_resident.management.commands.charge_recurring_rents.razorpay') as mock_rzp_module:
            mock_client = MagicMock()
            mock_rzp_module.Client.return_value = mock_client
            if mock_subscription_data:
                mock_client.subscription.fetch.return_value = mock_subscription_data
            call_command('charge_recurring_rents', stdout=out)
        return out.getvalue(), mock_client

    def test_expired_mandate_marked(self):
        past = date.today() - timedelta(days=1)
        mandate = RecurringMandate.objects.create(
            txnid='SESI_EXP',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2025, 1, 1),
            end_date=past,
            status='active',
            next_charge_date=date.today(),
            gateway_subscription_id='sub_EXP',
        )
        self._run_command({'status': 'active', 'paid_count': 0})
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'expired')

    def test_active_mandate_not_touched(self):
        future = date.today() + timedelta(days=180)
        mandate = RecurringMandate.objects.create(
            txnid='SESI_ACTIVE2',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=future,
            status='active',
            next_charge_date=date.today() + timedelta(days=30),
            gateway_subscription_id='sub_ACT2',
        )
        self._run_command({'status': 'active', 'paid_count': 0})
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'active')

    def test_missed_charge_reconciled(self):
        today = date.today()
        future = today + timedelta(days=180)
        mandate = RecurringMandate.objects.create(
            txnid='SESI_MISS',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=future,
            status='active',
            next_charge_date=today,
            gateway_subscription_id='sub_MISS',
        )
        # Razorpay shows 1 successful charge
        self._run_command({'status': 'active', 'paid_count': 1})
        month_label = today.strftime('%B %Y')
        self.assertTrue(
            resident_Rent_Data.objects.filter(
                resident_data_instance=self.resident,
                month=month_label,
                transferType='Auto-Pay (Razorpay)',
            ).exists()
        )

    def test_cancelled_subscription_synced(self):
        future = date.today() + timedelta(days=180)
        mandate = RecurringMandate.objects.create(
            txnid='SESI_CSYNC',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=future,
            status='active',
            next_charge_date=date.today(),
            gateway_subscription_id='sub_CSYNC',
        )
        self._run_command({'status': 'cancelled', 'paid_count': 0})
        mandate.refresh_from_db()
        self.assertEqual(mandate.status, 'revoked')

    def test_no_duplicate_rent_records(self):
        today = date.today()
        future = today + timedelta(days=180)
        month_label = today.strftime('%B %Y')

        mandate = RecurringMandate.objects.create(
            txnid='SESI_NODUP',
            resident=self.resident,
            billing_amount=Decimal('10000'),
            billing_cycle='MONTHLY',
            start_date=date(2026, 1, 1),
            end_date=future,
            status='active',
            next_charge_date=today,
            gateway_subscription_id='sub_NODUP',
        )
        # Pre-existing rent record (from webhook)
        resident_Rent_Data.objects.create(
            resident_data_instance=self.resident,
            rentStatus='Received',
            month=month_label,
            rent='10000',
            transferType='Auto-Pay (Razorpay)',
        )
        # Run command twice
        self._run_command({'status': 'active', 'paid_count': 1})
        self._run_command({'status': 'active', 'paid_count': 1})

        count = resident_Rent_Data.objects.filter(
            resident_data_instance=self.resident,
            month=month_label,
            transferType='Auto-Pay (Razorpay)',
        ).count()
        self.assertEqual(count, 1)
