from django.db import migrations


def seed_dropdown_config(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')

    rows = []

    def add(group, values):
        for i, v in enumerate(values):
            rows.append(DropdownConfig(group=group, value=v, sort_order=i))

    # ── Expense categories (keyed by expense type) ──
    add('expense_categories__operations', [
        'BGV Charges', 'Consumables', 'Field Staff', 'Printing and Stationary',
        'Property Maintenance', 'Property Payroll', 'Property Repairs',
        'Shipping and Freight', 'Soft Furnishing', 'Subscriptions',
        'Travel', 'Utilities', 'Other Operations Expense',
    ])
    add('expense_categories__sales', ['Agreement', 'Deposit Refund'])
    add('expense_categories__marketing', ['Meta', 'Google', 'Offline Marketing'])
    add('expense_categories__transformation', ['Purchase-Furniture', 'Soft Furnishing'])
    add('expense_categories__expansion', ['Agreement Purchase', 'Consultant Charges'])
    add('expense_categories__hr_admin', [
        'Travel expense', 'Food expense', 'Purchase - IT', 'purchase - HR',
        'Stationery', 'Apparels', 'Service - IT', 'Other Expense',
    ])
    add('expense_categories__checkout_deductions', [
        'Painting', 'Damage Cost', 'Electricity', 'Water', 'Other Charges',
    ])
    add('expense_categories__monthly_maintenance', [
        'Water Charges', 'Electricity Bill', 'Other Charges',
        'Repairs & Replacement', 'Others',
    ])
    add('expense_categories__owner_deductions', [
        'Electricity', 'Asd', 'RTO - furniture', 'RTO - appliances',
        'Repair- furniture', 'Repair - appliances',
        'Replacement- furniture', 'Replacement - appliances',
        'Painting', 'Repairs- others', 'Lift', 'Dg',
        'Water tankers', 'Replacement - others',
    ])
    add('expense_categories__owner_payout', ['Rent', 'Arrears'])

    # ── Vendor categories ──
    add('vendor_categories', [
        'Water Tanker', 'Electrician', 'Plumber', 'Fumigation', 'DTH',
        'Garbage', 'Water Purifier', 'Consumables', 'Shipping and Freight',
        'Soft Furnishing', 'Subscriptions', 'Utilities', 'Others',
    ])

    # ── Lead sources ──
    add('lead_sources', [
        'Transfer', 'New', 'Referal', 'Walkin', 'Instagram', 'Facebook',
        'Whatsapp', 'Inbound', 'Google', 'Website', 'LinkedIn', 'Pamphlet',
    ])

    # ── Lead statuses ──
    add('lead_statuses', [
        'Not Converted', 'Converted - Visit', 'Followup',
        'Contacted', 'Not Contacted', 'Converted - Closed',
    ])

    # ── Not-converted reasons ──
    add('not_converted_reasons', [
        'Price', 'Availability', 'Location', 'Food',
        'Directly disconnected', 'Number not reachable', 'Wrong number',
        'No call availability on this number',
        'Not looking for any colive space', 'Yet to confirm',
        'Called multiple times no response', 'Shortstay', 'Longstay',
        'Shift to another property', 'Not responded',
    ])

    # ── Meal types ──
    add('meal_types', [
        'Breakfast Only', 'Breakfast & Lunch',
        'Breakfast, Lunch & Dinner', 'Dinner Only', 'No Meal Plan',
    ])

    # ── Deadline options ──
    add('deadline_options', ['4 Hours', '8 Hours', '12 Hours', '24 Hours'])

    # ── Complaint categories ──
    add('complaint__electrical_electronics', [
        'Light / Fan / Switchboard issue',
        'Air Conditioner (AC) not working',
        'Refrigerator / Microwave / Induction / Other appliance',
        'TV / DTH connection issue',
        'Power socket / Wiring fault',
    ])
    add('complaint__plumbing_bathroom', [
        'Water leakage / Tap issue', 'Drainage blockage',
        'Water heater / Geyser not working', 'No water supply / Low pressure',
    ])
    add('complaint__furniture_fixtures', [
        'Bed / Cot / Mattress issue',
        'Wardrobe / Drawer / Door / Handle problem',
        'Chair / Sofa / Table damage',
        'Curtain rod / Window / Door alignment issue',
    ])
    add('complaint__kitchen_equipment', [
        'Gas stove / Burner not functioning', 'Water purifier issue',
        'Chimney / Exhaust fan issue', 'Kitchen cabinet / Storage damage',
    ])
    add('complaint__internet_connectivity', [
        'Wi-Fi not working / Slow speed', 'Router / Modem issue',
        'No internet connection',
    ])

    # ── Checklist items (shared by move-in and move-out) ──
    add('checklist__property_condition', [
        'Walls & Paint Condition', 'Ceiling Condition', 'Flooring / Tiles',
        'Doors & Locks', 'Main Door Keys', 'Room Keys',
        'Cupboard Keys', 'Access Cards / Key Tags',
    ])
    add('checklist__electrical_lighting', [
        'Ceiling Lights / Bulbs', 'Fans', 'Switches & Sockets',
        'Air Conditioner (AC)', 'Wi-Fi Router / Internet',
        'TV', 'DTH Connection', 'TV Remote',
    ])
    add('checklist__furniture_fixtures', [
        'Bed Frame', 'Mattress', 'Pillows', 'Bedsheets',
        'Duvet / Blanket', 'Towels',
    ])
    add('checklist__kitchen_plumbing', [
        'Water Purifier', 'Sink Tap / Plumbing Lines', 'Refrigerator',
        'Microwave / Induction / Stove', 'FurnitureFixtures Utensils',
    ])
    add('checklist__housekeeping_cleanliness', [
        'Overall Cleanliness', 'Bathroom Condition',
        'Mirror / Fixtures', 'Dustbins',
    ])

    DropdownConfig.objects.bulk_create(rows)


def reverse_seed(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')
    DropdownConfig.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_accounts', '0032_dropdown_config'),
    ]

    operations = [
        migrations.RunPython(seed_dropdown_config, reverse_seed),
    ]
