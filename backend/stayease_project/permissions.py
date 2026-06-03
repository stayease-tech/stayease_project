from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    """Allows access only to staff users (is_staff=True)."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class IsAdminGroup(BasePermission):
    """Staff users in the 'Admin' group or superusers."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Admin').exists()


class IsSalesTeam(BasePermission):
    """Staff users in the 'Sales' group or superusers."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Sales').exists()


class IsOperationsTeam(BasePermission):
    """Staff users in the 'Operations' group or superusers."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Operations').exists()


class IsSupplyTeam(BasePermission):
    """Staff users in the 'Supply' group or superusers."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        return request.user.groups.filter(name='Supply').exists()


class IsResident(BasePermission):
    """JWT-authenticated users linked to a resident_Data record."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return hasattr(request.user, 'resident_profile')


class IsPartner(BasePermission):
    """JWT-authenticated users in the 'Partner' group."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.groups.filter(name='Partner').exists()
