from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_sales', '0015_add_lease_agreement_fields'),
    ]

    operations = [
        # PaymentTransaction: rename payu_status -> gateway_status, add 2 new fields
        migrations.RenameField(
            model_name='paymenttransaction',
            old_name='payu_status',
            new_name='gateway_status',
        ),
        migrations.AddField(
            model_name='paymenttransaction',
            name='gateway_order_id',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='paymenttransaction',
            name='gateway_payment_id',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),

        # RecurringMandate: rename auth_payu_id -> gateway_subscription_id, add gateway_plan_id
        migrations.RenameField(
            model_name='recurringmandate',
            old_name='auth_payu_id',
            new_name='gateway_subscription_id',
        ),
        migrations.AddField(
            model_name='recurringmandate',
            name='gateway_plan_id',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),

        # PaymentRefund: rename payu_refund_id -> gateway_refund_id
        migrations.RenameField(
            model_name='paymentrefund',
            old_name='payu_refund_id',
            new_name='gateway_refund_id',
        ),
    ]
