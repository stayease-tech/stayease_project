# Rename tenant tables and columns to resident

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_sales', '0010_resident_data_kycapprovaldate_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Rename columns
        migrations.RunSQL(
            sql='ALTER TABLE stayease_sales_tenant_data RENAME COLUMN "tenantStatus" TO "residentStatus";',
            reverse_sql='ALTER TABLE stayease_sales_resident_data RENAME COLUMN "residentStatus" TO "tenantStatus";',
        ),
        migrations.RunSQL(
            sql='ALTER TABLE stayease_sales_tenant_data RENAME COLUMN "tenantUser_id" TO "residentUser_id";',
            reverse_sql='ALTER TABLE stayease_sales_resident_data RENAME COLUMN "residentUser_id" TO "tenantUser_id";',
        ),
        migrations.RunSQL(
            sql='ALTER TABLE stayease_sales_tenant_rent_data RENAME COLUMN "tenant_data_instance_id" TO "resident_data_instance_id";',
            reverse_sql='ALTER TABLE stayease_sales_resident_rent_data RENAME COLUMN "resident_data_instance_id" TO "tenant_data_instance_id";',
        ),
        # Rename tables
        migrations.RunSQL(
            sql='ALTER TABLE stayease_sales_tenant_data RENAME TO stayease_sales_resident_data;',
            reverse_sql='ALTER TABLE stayease_sales_resident_data RENAME TO stayease_sales_tenant_data;',
        ),
        migrations.RunSQL(
            sql='ALTER TABLE stayease_sales_tenant_rent_data RENAME TO stayease_sales_resident_rent_data;',
            reverse_sql='ALTER TABLE stayease_sales_resident_rent_data RENAME TO stayease_sales_tenant_rent_data;',
        ),
    ]
