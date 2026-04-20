from django.contrib.auth.models import User


def generate_tenant_password(residents_name, phone_number):
    """
    Generate a dummy password from tenant details.
    Formula: last word of name (first 4 chars, as-is if shorter) + '@' + last 4 digits of phone.
    e.g. "Ravi Kumar", "9876547890" → "Kuma@7890"
    """
    name_parts = (residents_name or '').strip().split()
    last_word = name_parts[-1] if name_parts else 'User'
    name_part = last_word[:4]
    # Capitalise first letter
    name_part = name_part[0].upper() + name_part[1:] if len(name_part) > 0 else 'User'
    phone_part = (phone_number or '0000')[-4:]
    return f"{name_part}@{phone_part}"


def create_tenant_user(tenant_instance):
    """
    Create a Django auth.User for the tenant so they can log in.
    Username = phone number, password = generated dummy password.
    Returns (user, plain_password).
    """
    phone = tenant_instance.phoneNumber
    if not phone:
        return None, None

    # If a user with this phone already exists, link and reset password
    plain_password = generate_tenant_password(
        tenant_instance.residentsName, phone
    )

    user, created = User.objects.get_or_create(
        username=phone,
        defaults={
            'email': tenant_instance.email or '',
            'first_name': tenant_instance.residentsName or '',
            'is_active': True,
        },
    )
    user.set_password(plain_password)
    if not created:
        user.email = tenant_instance.email or ''
        user.first_name = tenant_instance.residentsName or ''
    user.save()

    tenant_instance.tenantUser = user
    tenant_instance.save(update_fields=['tenantUser'])

    return user, plain_password
