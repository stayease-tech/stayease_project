from django.db import migrations


def seed_enum_dropdown_config(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')

    rows = []

    def add(group, values):
        for i, v in enumerate(values):
            rows.append(DropdownConfig(group=group, value=v, sort_order=i))

    # ── Property types & statuses ──
    add('property_types', ['PG/Hostel', 'Apartment'])
    add('property_statuses', ['Active', 'Not Active'])

    # ── Comfort classes ──
    add('comfort_classes', ['With AC', 'Without AC'])

    # ── Genders ──
    add('genders', ['Male', 'Female'])

    # ── KYC types ──
    add('kyc_types', ['Aadhar', 'PAN'])

    # ── Verification statuses ──
    add('verification_statuses', ['Verified', 'Not Verified'])

    # ── Expense statuses ──
    add('expense_statuses', ['Pending', 'Approved', 'Rejected', 'Completed'])

    # ── Liability statuses ──
    add('liability_statuses', ['Pending', 'Process', 'Settled', 'Adjusted', 'To Be Recovered'])

    # ── Head of expense ──
    add('head_of_expense', ['Owners', 'Stayease', 'Property', 'Resident'])

    # ── Expense types by head ──
    add('expense_types__stayease_property', [
        'Operations', 'Sales', 'Marketing', 'Transformation',
        'Expansion', 'HR & Admin',
    ])
    add('expense_types__owners', [
        'Owner Deductions', 'Owner Payout',
        'Check-Out Deductions', 'Monthly Maintenance',
    ])
    add('expense_types__resident', [
        'Resident Deductions', 'Resident Payable', 'Resident Receivable',
    ])

    # ── Payment types ──
    add('payment_types', ['Reimbursement', 'Vendor', 'Others'])

    # ── Vendor types ──
    add('vendor_types', ['Registered', 'Not Registered'])

    # ── Billing types ──
    add('billing_types', ['Bank Transfer', 'UPI', 'Others'])

    # ── Transfer types ──
    add('transfer_types', ['IMPS', 'NEFT', 'UPI', 'Cash'])

    # ── Employee roles ──
    add('employee_roles', ['Supply', 'Sales', 'Accounts', 'Operations'])

    # ── KYC approval statuses ──
    add('kyc_approval_statuses', ['Pending', 'Approved', 'Rejected'])

    # ── Owner account statuses ──
    add('owner_account_statuses', ['Active', 'Inactive'])

    # ── Owner payment types ──
    add('owner_payment_types', ['Auto', 'Manual'])

    # ── Student/Employee ID types ──
    add('student_employee_id_types', ['Student ID', 'Employee ID'])

    # ── Sales statuses (beds table) ──
    add('sales_statuses', ['Completed', 'Pending'])

    # ── Complaint statuses ──
    add('complaint_statuses', ['Open', 'Follow Up', 'Closed'])

    # ── Preferred time slots ──
    add('preferred_times', ['Morning', 'Afternoon', 'Evening', 'Anytime'])

    # ── Feedback resolution options ──
    add('feedback_resolutions', ['Yes', 'Partially', 'No'])

    # ── Yes/No resolution ──
    add('yes_no_options', ['Yes', 'No'])

    # ── Deposit received statuses ──
    add('deposit_statuses', ['Received', 'Not Received'])

    # ── Room types ──
    add('room_types', ['Bareshell', 'Private Space', 'Work Space', 'Common Area'])

    # ── Balcony options ──
    add('balcony_options', ['With Balcony', 'Without Balcony'])

    # ── Bathroom options ──
    add('bathroom_options', ['Attached', 'Shared'])

    # ── Sharing types ──
    add('sharing_types', ['Private', 'Double Sharing', 'Single Private', 'Triple Sharing'])

    # ── Electricity options ──
    add('electricity_options', ['Inclusive', 'Exclusive', 'Capping'])

    # ── Yes/No/NA options (parking, food) ──
    add('yes_no_na_options', ['Yes', 'No', 'NA'])

    # ── Rent free options ──
    add('rent_free_options', ['0', '15000', '25000'])

    # ── Property meal types (checkbox list) ──
    add('property_meal_types', ['Veg', 'Non-Veg'])

    # ── Property amenities (checkbox list) ──
    add('property_amenities', [
        'Prime Locations', 'Fully Furnished', 'Parking Space',
        'Regular Housekeeping', 'Free Wi-Fi', 'Modular Kitchen',
        'CCTV Surveillance', 'Washing Machine', 'Workspace Setup',
        'Common Area', 'Digital Lock Access', 'Water Purifier',
        'OTT Subscriptions', 'Community Intercom',
    ])

    # ── Expense categories for rawdata (additional to seed 0033) ──
    add('expense_categories__resident_deductions', ['Electricity', 'Water', 'Other Charges'])
    add('expense_categories__resident_payable', ['Security Deposit', 'Rent Refund', 'Other Payable'])
    add('expense_categories__resident_receivable', ['Rent', 'Electricity', 'Water', 'Other Receivable'])

    DropdownConfig.objects.bulk_create(rows)


def reverse_seed(apps, schema_editor):
    DropdownConfig = apps.get_model('stayease_accounts', 'DropdownConfig')
    groups = [
        'property_types', 'property_statuses', 'comfort_classes', 'genders',
        'kyc_types', 'verification_statuses', 'expense_statuses',
        'liability_statuses', 'head_of_expense',
        'expense_types__stayease_property', 'expense_types__owners',
        'expense_types__resident', 'payment_types', 'vendor_types',
        'billing_types', 'transfer_types', 'employee_roles',
        'kyc_approval_statuses', 'owner_account_statuses',
        'owner_payment_types', 'student_employee_id_types', 'sales_statuses',
        'complaint_statuses', 'preferred_times', 'feedback_resolutions',
        'yes_no_options', 'deposit_statuses', 'room_types', 'balcony_options',
        'bathroom_options', 'sharing_types', 'electricity_options',
        'yes_no_na_options', 'rent_free_options',
        'property_meal_types', 'property_amenities',
        'expense_categories__resident_deductions',
        'expense_categories__resident_payable',
        'expense_categories__resident_receivable',
    ]
    DropdownConfig.objects.filter(group__in=groups).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('stayease_accounts', '0033_seed_dropdown_config'),
    ]

    operations = [
        migrations.RunPython(seed_enum_dropdown_config, reverse_seed),
    ]
