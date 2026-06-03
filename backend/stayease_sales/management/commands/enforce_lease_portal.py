from django.core.management.base import BaseCommand
from stayease_sales.models import resident_Data


class Command(BaseCommand):
    help = 'Disable portal for existing residents without a lease agreement uploaded.'

    def handle(self, *args, **options):
        residents = resident_Data.objects.filter(
            residentUser__isnull=False,
            residentUser__is_active=True,
        ).select_related('residentUser')

        disabled = 0
        skipped = 0
        for r in residents:
            if not r.leaseAgreement:
                r.residentUser.is_active = False
                r.residentUser.save(update_fields=['is_active'])
                disabled += 1
                self.stdout.write(f"  Disabled: {r.residentsName} ({r.phoneNumber})")
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. Disabled {disabled} portal(s). Skipped {skipped} (lease already uploaded)."
        ))
