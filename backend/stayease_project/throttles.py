from rest_framework.throttling import SimpleRateThrottle


class LoginRateThrottle(SimpleRateThrottle):
    """
    Throttle login attempts to prevent brute-force attacks.
    Rate is configured in settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['login'].
    Keyed by client IP address.
    """
    scope = 'login'

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {'scope': self.scope, 'ident': ident}
