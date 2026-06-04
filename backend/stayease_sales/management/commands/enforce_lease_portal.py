from django.core.management.base import BaseCommand
from stayease_sales.models import resident_Data


class Command(BaseCommand):
    help = 'Report residents without a lease agreement (portal access is now always enabled for active residents).'

    def handle(self, *args, **options):
        residents = resident_Data.objects.filter(
            residentUser__isnull=False,
            residentUser__is_active=True,
            leaseAgreement='',
        ).select_related('residentUser')

        count = 0
        for r in residents:
            self.stdout.write(f"  No lease: {r.residentsName} ({r.phoneNumber})")
            count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {count} resident(s) without a lease agreement (portal access not affected)."
        ))
