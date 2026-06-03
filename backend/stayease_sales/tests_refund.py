"""
Test suite for Razorpay refund functionality.
"""

from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import Group, User
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from stayease_sales.models import (
    PaymentTransaction,
    PaymentRefund,
    resident_Data,
    resident_Rent_Data,
)


# ─── Base Fixture ─────────────────────────────────────────────────────────────

class RefundTestBase(TestCase):

    def setUp(self):
        super().setUp()
        # Sales team user
        self.sales_user = User.objects.create_user(
            username='sales_agent',
            password='testpass123',
        )
        sales_group, _ = Group.objects.get_or_create(name='Sales')
        self.sales_user.groups.add(sales_group)

        # Non-sales user
        self.regular_user = User.objects.create_user(
            username='regular_user',
            password='testpass123',
        )

        # Resident
        self.resident = resident_Data.objects.create(
            residentsName='Test Resident',
            phoneNumber='9876543210',
            email='test@example.com',
        )

        # Received rent record
        self.rent_record = resident_Rent_Data.objects.create(
            resident_data_instance=self.resident,
            rentStatus='Received',
            month='June 2026',
            rent='10000',
        )

        # Successful payment transaction
        self.txn = PaymentTransaction.objects.create(
            txnid='SE_REFUND1',
            resident=self.resident,
            rent_record=self.rent_record,
            amount=Decimal('10000'),
            product_info='Rent Payment',
            status='success',
            gateway_payment_id='pay_REFUND1',
        )

        # JWT tokens
        sales_refresh = RefreshToken.for_user(self.sales_user)
        self.sales_token = str(sales_refresh.access_token)
        self.sales_api = APIClient()
        self.sales_api.credentials(HTTP_AUTHORIZATION=f'Bearer {self.sales_token}')

        regular_refresh = RefreshToken.for_user(self.regular_user)
        self.regular_token = str(regular_refresh.access_token)
        self.regular_api = APIClient()
        self.regular_api.credentials(HTTP_AUTHORIZATION=f'Bearer {self.regular_token}')

        self.settings_patcher = patch.multiple(
            'django.conf.settings',
            RAZORPAY_KEY_ID='rzp_test_TESTKEY',
            RAZORPAY_KEY_SECRET='test_secret',
        )
        self.settings_patcher.start()
        self.addCleanup(self.settings_patcher.stop)


# ─── Refund Tests ─────────────────────────────────────────────────────────────

class RefundTests(RefundTestBase):

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_full_success(self, mock_refund):
        mock_refund.return_value = {'success': True, 'refund_id': 'rfnd_FULL1'}

        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1',
            'amount': '10000',
            'reason': 'Resident moved out early',
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        refund = PaymentRefund.objects.get(transaction=self.txn)
        self.assertEqual(refund.gateway_refund_id, 'rfnd_FULL1')
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Refunded')

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_partial_success(self, mock_refund):
        mock_refund.return_value = {'success': True, 'refund_id': 'rfnd_PART1'}

        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1',
            'amount': '3000',
            'reason': 'Partial refund for amenity issue',
        })
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data['success'])
        # Partial refund — rent record should still be Received
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Received')

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_exceeds_balance(self, mock_refund):
        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1',
            'amount': '15000',  # more than ₹10000
            'reason': 'Testing',
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('Exceeds', res.data['message'])

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_unknown_txnid(self, mock_refund):
        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_NONEXISTENT',
            'amount': '1000',
            'reason': 'Testing',
        })
        self.assertEqual(res.status_code, 404)

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_failed_transaction(self, mock_refund):
        failed_txn = PaymentTransaction.objects.create(
            txnid='SE_FAILED1',
            resident=self.resident,
            amount=Decimal('10000'),
            product_info='Rent',
            status='failed',
            gateway_payment_id='pay_FAILED',
        )
        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_FAILED1',
            'amount': '1000',
            'reason': 'Testing',
        })
        self.assertEqual(res.status_code, 404)

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_razorpay_api_failure(self, mock_refund):
        mock_refund.return_value = {'success': False, 'message': 'Razorpay API error'}

        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1',
            'amount': '1000',
            'reason': 'Testing',
        })
        self.assertEqual(res.status_code, 502)
        refund = PaymentRefund.objects.get(transaction=self.txn)
        self.assertEqual(refund.status, 'failed')
        self.rent_record.refresh_from_db()
        self.assertEqual(self.rent_record.rentStatus, 'Received')  # unchanged

    def test_refund_amount_in_paise(self):
        """Verify Razorpay is called with amount in paise."""
        with patch('razorpay.Client') as mock_rzp_class:
            mock_client = MagicMock()
            mock_client.payment.refund.return_value = {'id': 'rfnd_PAISE'}
            mock_rzp_class.return_value = mock_client

            from stayease_sales.views import _process_razorpay_refund
            refund = PaymentRefund(
                transaction=self.txn,
                refund_amount=Decimal('500'),
                reason='Test',
                status='initiated',
                initiated_by=self.sales_user,
            )
            _process_razorpay_refund(self.txn, refund)
            mock_client.payment.refund.assert_called_once_with(
                'pay_REFUND1',
                {'amount': 50000}  # 500 rupees = 50000 paise
            )

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_multiple_partial(self, mock_refund):
        mock_refund.return_value = {'success': True, 'refund_id': 'rfnd_MP1'}

        # First partial: ₹5000
        self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1', 'amount': '5000', 'reason': 'Part 1'
        })
        # Second partial: ₹5000
        mock_refund.return_value = {'success': True, 'refund_id': 'rfnd_MP2'}
        self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1', 'amount': '5000', 'reason': 'Part 2'
        })
        # Third attempt: ₹1 — should fail
        mock_refund.return_value = {'success': True, 'refund_id': 'rfnd_MP3'}
        res = self.sales_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1', 'amount': '1', 'reason': 'Part 3'
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn('Exceeds', res.data['message'])

    def test_refund_uses_gateway_payment_id(self):
        with patch('razorpay.Client') as mock_rzp_class:
            mock_client = MagicMock()
            mock_client.payment.refund.return_value = {'id': 'rfnd_GW'}
            mock_rzp_class.return_value = mock_client

            from stayease_sales.views import _process_razorpay_refund
            refund = PaymentRefund(
                transaction=self.txn,
                refund_amount=Decimal('1000'),
                reason='Test',
                status='initiated',
                initiated_by=self.sales_user,
            )
            _process_razorpay_refund(self.txn, refund)
            # Assert correct payment ID was used
            call_args = mock_client.payment.refund.call_args[0]
            self.assertEqual(call_args[0], 'pay_REFUND1')

    def test_refund_requires_sales_team_permission(self):
        res = self.regular_api.post('/sales/refunds/initiate/', {
            'txnid': 'SE_REFUND1',
            'amount': '1000',
            'reason': 'Testing',
        })
        self.assertEqual(res.status_code, 403)

    @patch('stayease_sales.views._process_razorpay_refund')
    def test_refund_history_returns_all(self, mock_refund):
        mock_refund.return_value = {'success': True, 'refund_id': 'rfnd_H1'}
        # Create 3 refunds
        for i in range(1, 4):
            PaymentRefund.objects.create(
                transaction=self.txn,
                refund_amount=Decimal('100'),
                reason=f'Refund {i}',
                status='processing',
                gateway_refund_id=f'rfnd_H{i}',
                initiated_by=self.sales_user,
            )
        res = self.sales_api.get('/sales/refunds/history/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data['refunds']), 3)
        # Verify gatewayRefundId key is used (not payuRefundId)
        for r in res.data['refunds']:
            self.assertIn('gatewayRefundId', r)
            self.assertNotIn('payuRefundId', r)
