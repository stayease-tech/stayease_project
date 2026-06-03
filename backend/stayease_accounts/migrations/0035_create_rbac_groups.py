from django.db import migrations


RBAC_GROUPS = ['Admin', 'Sales', 'Operations', 'Supply', 'Resident', 'Partner']


def create_groups_and_assign_admin(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    User = apps.get_model('auth', 'User')

    for name in RBAC_GROUPS:
        Group.objects.get_or_create(name=name)

    # Assign all existing staff users to the Admin group so nothing breaks
    admin_group = Group.objects.get(name='Admin')
    for user in User.objects.filter(is_staff=True):
        user.groups.add(admin_group)


def remove_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Group.objects.filter(name__in=RBAC_GROUPS).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_accounts', '0034_seed_enum_dropdown_config'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RunPython(create_groups_and_assign_admin, remove_groups),
    ]
