from django.core.management.base import BaseCommand
from stayease_supply.models import Bed_Data
import calendar
from django.utils import timezone

class Command(BaseCommand):
    help = 'Resets rent status to "Not Received" at month end'
    
    def handle(self, *args, **options):
        today = timezone.now().date()
        last_day = calendar.monthrange(today.year, today.month)[1]
        
        if today.day == last_day:
            Bed_Data.objects.all().update(rentStatus='Not Received')
            self.stdout.write(f"✅ Reset rent status for {today.strftime('%Y-%m')}")
        else:
            self.stdout.write("⏳ Not month end - no action taken")