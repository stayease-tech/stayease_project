from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group


REQUIRED_GROUPS = ['Supply', 'Sales', 'Operations', 'Accounts', 'Admin', 'Partner']


class Command(BaseCommand):
    help = 'Creates all required RBAC groups for StayEase portals'

    def handle(self, *args, **options):
        created = []
        existing = []

        for name in REQUIRED_GROUPS:
            group, was_created = Group.objects.get_or_create(name=name)
            if was_created:
                created.append(name)
            else:
                existing.append(name)

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created groups: {', '.join(created)}"))
        if existing:
            self.stdout.write(f"Already existed: {', '.join(existing)}")
