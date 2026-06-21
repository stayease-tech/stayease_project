# Copyright Aravind Adari
import re
from django.db import migrations


def convert_floors_to_zero_based(apps, schema_editor):
    """Convert existing Room_Data buildingLevel from 1-based to 0-based floor numbering.

    'Floor 1' becomes 'Floor 0', 'Floor 2' becomes 'Floor 1', etc.
    Basement levels are not affected.
    """
    Room_Data = apps.get_model('stayease_supply', 'Room_Data')
    for room in Room_Data.objects.filter(buildingLevel__startswith='Floor '):
        match = re.match(r'^Floor (\d+)$', room.buildingLevel)
        if match:
            old_floor = int(match.group(1))
            room.buildingLevel = f'Floor {old_floor - 1}'
            room.save(update_fields=['buildingLevel'])


def convert_floors_to_one_based(apps, schema_editor):
    """Reverse: convert Room_Data buildingLevel back to 1-based floor numbering."""
    Room_Data = apps.get_model('stayease_supply', 'Room_Data')
    for room in Room_Data.objects.filter(buildingLevel__startswith='Floor '):
        match = re.match(r'^Floor (\d+)$', room.buildingLevel)
        if match:
            old_floor = int(match.group(1))
            room.buildingLevel = f'Floor {old_floor + 1}'
            room.save(update_fields=['buildingLevel'])


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_supply', '0037_serial_number_unique'),
    ]

    operations = [
        migrations.RunPython(convert_floors_to_zero_based, convert_floors_to_one_based),
    ]
