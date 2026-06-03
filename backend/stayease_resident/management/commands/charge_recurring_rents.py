# Copyright (c) 2026 Aravind Adari. All rights reserved.

"""
Reconciliation command for Razorpay subscription-based recurring rent charges.

Razorpay auto-charges subscriptions and fires webhook events (subscription.charged).
This command is a safety net / reconciliation pass that:
1. Expires mandates where end_date < today
2. Syncs subscription status from Razorpay for active mandates
3. Creates missing rent records for months where Razorpay charged but our webhook missed it

Schedule via system cron to run daily (after webhook delivery window):
    0 8 * * * cd /path/to/backend && ./venv/bin/python manage.py charge_recurring_rents
"""

import logging
from datetime import date

import razorpay

from django.core.management.base import BaseCommand
from django.conf import settings

from stayease_sales.models import RecurringMandate, resident_Rent_Data

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Reconcile Razorpay subscription charges — expire stale mandates and create missing rent records'

    def handle(self, *args, **options):
        today = date.today()
        month_label = today.strftime('%B %Y')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

        # 1. Expire mandates past their end_date
        expired_count = 0
        overdue_mandates = RecurringMandate.objects.filter(
            status='active',
            end_date__lt=today,
        )
        for mandate in overdue_mandates:
            mandate.status = 'expired'
            mandate.save()
            expired_count += 1
            self.stdout.write(
                self.style.WARNING(
                    f'[EXPIRED] Mandate {mandate.txnid} — lease ended {mandate.end_date}'
                )
            )

        # 2. Reconcile active mandates due this month
        reconciled_count = 0
        skipped_count = 0
        active_mandates = RecurringMandate.objects.filter(
            status='active',
            next_charge_date__lte=today,
        ).select_related('resident')

        for mandate in active_mandates:
            if not mandate.gateway_subscription_id:
                self.stdout.write(
                    self.style.WARNING(
                        f'[SKIP] Mandate {mandate.txnid} has no gateway_subscription_id'
                    )
                )
                skipped_count += 1
                continue

            # Check if rent record already exists for this month (webhook may have created it)
            already_exists = resident_Rent_Data.objects.filter(
                resident_data_instance=mandate.resident,
                month=month_label,
                transferType='Auto-Pay (Razorpay)',
            ).exists()

            if already_exists:
                skipped_count += 1
                continue

            # Fetch subscription status from Razorpay
            try:
                subscription = client.subscription.fetch(mandate.gateway_subscription_id)
            except Exception as e:
                logger.error(
                    f'[RECONCILE] Failed to fetch subscription {mandate.gateway_subscription_id}: {e}'
                )
                self.stdout.write(
                    self.style.ERROR(
                        f'  [ERROR] Could not fetch subscription for mandate {mandate.txnid}: {e}'
                    )
                )
                continue

            sub_status = subscription.get('status', '')

            # Sync cancelled subscriptions
            if sub_status == 'cancelled' and mandate.status == 'active':
                mandate.status = 'revoked'
                mandate.save()
                self.stdout.write(
                    self.style.WARNING(
                        f'[REVOKED] Mandate {mandate.txnid} — subscription cancelled on Razorpay'
                    )
                )
                continue

            # Check if Razorpay shows a successful charge this month
            paid_count = subscription.get('paid_count', 0)
            if paid_count and paid_count > 0:
                # Create missing rent record
                resident_Rent_Data.objects.create(
                    resident_data_instance=mandate.resident,
                    rentStatus='Received',
                    month=month_label,
                    rent=str(mandate.billing_amount),
                    transferType='Auto-Pay (Razorpay)',
                    utrNumber=mandate.gateway_subscription_id,
                    transferredDate=today.strftime('%Y-%m-%d'),
                )

                mandate.last_charged_date = today
                if today.month < 12:
                    next_date = today.replace(month=today.month + 1, day=1)
                else:
                    next_date = today.replace(year=today.year + 1, month=1, day=1)
                mandate.next_charge_date = next_date if next_date <= mandate.end_date else None
                mandate.save()

                reconciled_count += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'[RECONCILED] Mandate {mandate.txnid} — rent record created for {month_label}'
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone. Expired: {expired_count}, Reconciled: {reconciled_count}, Skipped: {skipped_count}'
            )
        )
