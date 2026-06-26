from django.db import migrations


DEDUPE_GROUPS = ['room_types']


def remove_duplicates(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')
    for group in DEDUPE_GROUPS:
        seen = set()
        for row in DropdownConfig.objects.filter(group=group).order_by('id'):
            if row.value in seen:
                row.delete()
            else:
                seen.add(row.value)


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_accounts', '0036_add_bhk_room_types'),
    ]

    operations = [
        migrations.RunPython(remove_duplicates, migrations.RunPython.noop),
    ]
