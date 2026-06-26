from django.db import migrations


NEW_ROOM_TYPES = ['1BHK', '1.5 BHK', '2BHK', '2.5 BHK', '3BHK']


def add_bhk_room_types(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')
    existing_values = set(
        DropdownConfig.objects.filter(group='room_types').values_list('value', flat=True)
    )
    existing_max = (
        DropdownConfig.objects.filter(group='room_types')
        .order_by('-sort_order')
        .values_list('sort_order', flat=True)
        .first()
    )
    next_order = (existing_max + 1) if existing_max is not None else 0
    rows = [
        DropdownConfig(group='room_types', value=v, sort_order=next_order + i)
        for i, v in enumerate(NEW_ROOM_TYPES)
        if v not in existing_values
    ]
    if rows:
        DropdownConfig.objects.bulk_create(rows)


def reverse_add(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')
    DropdownConfig.objects.filter(group='room_types', value__in=NEW_ROOM_TYPES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_accounts', '0035_create_rbac_groups'),
    ]

    operations = [
        migrations.RunPython(add_bhk_room_types, reverse_add),
    ]
