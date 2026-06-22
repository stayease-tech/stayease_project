from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_sales', '0017_add_firstname_lastname_to_resident_data'),
    ]

    operations = [
        migrations.AddField(
            model_name='resident_data',
            name='checkoutReason',
            field=models.TextField(blank=True, null=True),
        ),
    ]
