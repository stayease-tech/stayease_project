# Rename tenant tables and columns to resident
#
# These RunSQL ops only apply when migrating an existing DB that still
# has the old "tenant_*" names.  On a fresh DB the tables are already
# created with the "resident_*" names by Django, so the ALTERs would
# fail.  We therefore guard each statement behind a check for the old
# table's existence.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def _rename_forward(apps, schema_editor):
    """Rename tenant → resident (columns then tables) if the old names exist."""
    conn = schema_editor.connection
    with conn.cursor() as cur:
        # Check if the old table exists
        cur.execute(
            "SELECT 1 FROM information_schema.tables "
            "WHERE table_name = 'stayease_sales_tenant_data';"
        )
        if not cur.fetchone():
            return  # Fresh DB — tables already have the correct names

        cur.execute('ALTER TABLE stayease_sales_tenant_data RENAME COLUMN "tenantStatus" TO "residentStatus";')
        cur.execute('ALTER TABLE stayease_sales_tenant_data RENAME COLUMN "tenantUser_id" TO "residentUser_id";')
        cur.execute('ALTER TABLE stayease_sales_tenant_rent_data RENAME COLUMN "tenant_data_instance_id" TO "resident_data_instance_id";')
        cur.execute('ALTER TABLE stayease_sales_tenant_data RENAME TO stayease_sales_resident_data;')
        cur.execute('ALTER TABLE stayease_sales_tenant_rent_data RENAME TO stayease_sales_resident_rent_data;')


def _rename_reverse(apps, schema_editor):
    """Rename resident → tenant (reverse)."""
    conn = schema_editor.connection
    with conn.cursor() as cur:
        cur.execute(
            "SELECT 1 FROM information_schema.tables "
            "WHERE table_name = 'stayease_sales_resident_data';"
        )
        if not cur.fetchone():
            return

        cur.execute('ALTER TABLE stayease_sales_resident_data RENAME COLUMN "residentStatus" TO "tenantStatus";')
        cur.execute('ALTER TABLE stayease_sales_resident_data RENAME COLUMN "residentUser_id" TO "tenantUser_id";')
        cur.execute('ALTER TABLE stayease_sales_resident_rent_data RENAME COLUMN "resident_data_instance_id" TO "tenant_data_instance_id";')
        cur.execute('ALTER TABLE stayease_sales_resident_data RENAME TO stayease_sales_tenant_data;')
        cur.execute('ALTER TABLE stayease_sales_resident_rent_data RENAME TO stayease_sales_tenant_rent_data;')


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_sales', '0010_resident_data_kycapprovaldate_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(_rename_forward, _rename_reverse),
    ]
