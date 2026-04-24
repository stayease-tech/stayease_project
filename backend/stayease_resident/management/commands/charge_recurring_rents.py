"""
Management command to process recurring rent charges via PayU Standing Instructions.

Schedule via system cron to run daily:
    0 6 * * * cd /path/to/backend && ./venv/bin/python manage.py charge_recurring_rents

This command:
1. Finds active mandates due for pre-debit notification (48 hours before charge)
2. Finds active mandates due for charge execution (today)
3. Creates rent records and updates mandate dates after successful charges

Requires PayU SI to be enabled on the merchant account.
"""
import logging
from datetime import date, timedelta

from django.core.management.base import BaseCommand

from stayease_sales.models import RecurringMandate, resident_Rent_Data

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Process recurring rent charges — send pre-debit notifications and execute SI charges'

    def handle(self, *args, **options):
        today = date.today()
        pre_debit_date = today + timedelta(days=2)

        # 1. Send pre-debit notifications for mandates due in 2 days
        pre_debit_mandates = RecurringMandate.objects.filter(
            status='active',
            next_charge_date=pre_debit_date,
        ).select_related('resident')

        for mandate in pre_debit_mandates:
            self.stdout.write(f"[PRE-DEBIT] Mandate {mandate.txnid} — ₹{mandate.billing_amount} due on {mandate.next_charge_date}")
            from stayease_resident.views import _send_pre_debit_notification
            result = _send_pre_debit_notification(mandate)
            if result['success']:
                self.stdout.write(self.style.SUCCESS(f"  Pre-debit notification sent: {result['message']}"))
            else:
                self.stdout.write(self.style.ERROR(f"  Pre-debit notification failed: {result['message']}"))

        # 2. Execute charges for mandates due today
        due_mandates = RecurringMandate.objects.filter(
            status='active',
            next_charge_date=today,
        ).select_related('resident')

        for mandate in due_mandates:
            if mandate.end_date < today:
                mandate.status = 'expired'
                mandate.save()
                self.stdout.write(self.style.WARNING(f"[EXPIRED] Mandate {mandate.txnid} — lease ended {mandate.end_date}"))
                continue

            self.stdout.write(f"[CHARGE] Mandate {mandate.txnid} — ₹{mandate.billing_amount}")
            from stayease_resident.views import _execute_si_charge
            result = _execute_si_charge(mandate)

            if result['success']:
                # Create a rent record for this charge
                month_label = today.strftime('%B %Y')
                resident_Rent_Data.objects.create(
                    resident_data_instance=mandate.resident,
                    rentStatus='Received',
                    month=month_label,
                    rent=str(mandate.billing_amount),
                    transferType='Auto-Pay (SI)',
                    utrNumber=mandate.txnid,
                    transferredDate=today.strftime('%Y-%m-%d'),
                )

                mandate.last_charged_date = today
                # Advance next_charge_date by one month
                if today.month < 12:
                    next_date = today.replace(month=today.month + 1, day=1)
                else:
                    next_date = today.replace(year=today.year + 1, month=1, day=1)
                if next_date > mandate.end_date:
                    mandate.status = 'expired'
                    mandate.next_charge_date = None
                else:
                    mandate.next_charge_date = next_date
                mandate.save()
                self.stdout.write(self.style.SUCCESS(f"  Charge successful, next: {mandate.next_charge_date}"))
            else:
                self.stdout.write(self.style.ERROR(f"  Charge failed: {result['message']}"))
                logger.error(f"SI charge failed for mandate {mandate.txnid}: {result['message']}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Pre-debit: {pre_debit_mandates.count()}, Charges: {due_mandates.count()}"
        ))
