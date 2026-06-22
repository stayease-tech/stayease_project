from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from stayease_accounts.models import Expense_Category_Detail, Fixed_Expense_Detail


class Command(BaseCommand):
    help = (
        'Backfills expenseRaisedEmail on Expense_Category_Detail and '
        'Fixed_Expense_Detail rows where it is null, blank, or "undefined". '
        'Looks up the correct email from the Accounts group, or accepts --email.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email address to use for the backfill. '
                 'If omitted, the command will auto-detect from the Accounts group.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be updated without saving anything.',
        )

    def handle(self, *args, **options):
        email = options.get('email')
        dry_run = options['dry_run']

        if not email:
            accounts_users = User.objects.filter(
                groups__name='Accounts', is_active=True
            ).exclude(email='')

            if not accounts_users.exists():
                raise CommandError(
                    'No active Accounts group users with an email found. '
                    'Pass --email <address> explicitly.'
                )
            if accounts_users.count() > 1:
                emails = ', '.join(accounts_users.values_list('email', flat=True))
                raise CommandError(
                    f'Multiple Accounts users found ({emails}). '
                    'Pass --email <address> to specify which one to use.'
                )

            email = accounts_users.first().email

        BAD_VALUES = [None, '', 'undefined']

        for model, label in [
            (Expense_Category_Detail, 'Expense_Category_Detail'),
            (Fixed_Expense_Detail, 'Fixed_Expense_Detail'),
        ]:
            bad = model.objects.filter(expenseRaisedEmail__in=BAD_VALUES)
            count = bad.count()
            if count == 0:
                self.stdout.write(f'{label}: no records need fixing.')
                continue

            self.stdout.write(
                f'{"[DRY RUN] Would update" if dry_run else "Updating"} '
                f'{count} {label} record(s) with email: {email}'
            )
            if not dry_run:
                bad.update(expenseRaisedEmail=email)
                self.stdout.write(self.style.SUCCESS(f'{label}: {count} record(s) updated.'))
