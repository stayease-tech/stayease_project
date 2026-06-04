# Copyright (c) 2026 Aravind Adari. All rights reserved.

from django.contrib.auth.models import User


def generate_resident_password(residents_name, phone_number):
    """
    Return the default password for a newly created resident account.
    """
    return 'Pass@1234'


def create_resident_user(resident_instance):
    """
    Create a Django auth.User for the resident so they can log in.
    Username = phone number, password = generated dummy password.
    Returns (user, plain_password).
    """
    phone = resident_instance.phoneNumber
    if not phone:
        return None, None

    # If a user with this phone already exists, link and reset password
    plain_password = generate_resident_password(
        resident_instance.residentsName, phone
    )

    user, created = User.objects.get_or_create(
        username=phone,
        defaults={
            'email': resident_instance.email or '',
            'first_name': resident_instance.residentsName or '',
            'is_active': True,
        },
    )
    user.set_password(plain_password)
    if not created:
        user.email = resident_instance.email or ''
        user.first_name = resident_instance.residentsName or ''
    user.save()

    resident_instance.residentUser = user
    resident_instance.save(update_fields=['residentUser'])

    return user, plain_password
