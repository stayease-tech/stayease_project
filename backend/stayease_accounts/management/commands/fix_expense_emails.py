from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from stayease_accounts.models import Expense_Category_Detail, Fixed_Expense_Detail

# Maps dashboardUser values to the corresponding Django permission-group prefix
DASHBOARD_GROUP_MAP = {
    'operations': 'Operations',
    'supply': 'Supply',
    'sales': 'Sales',
    'accounts': 'Accounts',
}

BAD_VALUES = [None, '', 'undefined']


def _email_for_group(group_name):
    """Return the single active user email for a group name, or None if ambiguous/missing."""
    users = User.objects.filter(
        groups__name=group_name,
        is_active=True,
    ).exclude(email='').distinct()

    if users.count() == 1:
        return users.first().email
    return None


class Command(BaseCommand):
    help = (
        'Backfills expenseRaisedEmail on Expense_Category_Detail rows where it '
        'is null, blank, or "undefined". Derives the correct email from the '
        'Django user group that matches each expense\'s dashboardUser field. '
        'Fixed_Expense_Detail rows with bad emails are cleared to "".'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print what would be updated without saving anything.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # ── Expense_Category_Detail ───────────────────────────────────────────
        bad_categories = Expense_Category_Detail.objects.filter(
            expenseRaisedEmail__in=BAD_VALUES
        ).select_related('expense_instance')

        total = bad_categories.count()
        if total == 0:
            self.stdout.write('Expense_Category_Detail: no records need fixing.')
        else:
            self.stdout.write(f'Expense_Category_Detail: {total} record(s) to fix.')
            fixed = 0
            cleared = 0

            for cat in bad_categories:
                dashboard_user = (
                    cat.expense_instance.dashboardUser
                    if cat.expense_instance
                    else None
                )
                group_prefix = DASHBOARD_GROUP_MAP.get(dashboard_user)
                email = _email_for_group(group_prefix) if group_prefix else None

                new_email = email if email else ''
                action = f'→ "{new_email}"' if new_email else '→ "" (cleared — could not determine user)'

                self.stdout.write(
                    f'  {"[DRY RUN] " if dry_run else ""}Category ID {cat.id} '
                    f'(dashboardUser={dashboard_user!r}) {action}'
                )

                if not dry_run:
                    cat.expenseRaisedEmail = new_email
                    cat.save(update_fields=['expenseRaisedEmail'])

                if new_email:
                    fixed += 1
                else:
                    cleared += 1

            if not dry_run:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Expense_Category_Detail: {fixed} record(s) backfilled, '
                        f'{cleared} record(s) cleared.'
                    )
                )

        # ── Fixed_Expense_Detail ──────────────────────────────────────────────
        bad_fixed = Fixed_Expense_Detail.objects.filter(expenseRaisedEmail__in=BAD_VALUES)
        fixed_count = bad_fixed.count()

        if fixed_count == 0:
            self.stdout.write('Fixed_Expense_Detail: no records need fixing.')
        else:
            self.stdout.write(
                f'{"[DRY RUN] Would clear" if dry_run else "Clearing"} '
                f'{fixed_count} Fixed_Expense_Detail record(s).'
            )
            if not dry_run:
                bad_fixed.update(expenseRaisedEmail='')
                self.stdout.write(
                    self.style.SUCCESS(f'Fixed_Expense_Detail: {fixed_count} record(s) cleared.')
                )
