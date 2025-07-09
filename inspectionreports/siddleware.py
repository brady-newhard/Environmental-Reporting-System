class HTTPSRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only redirect in production, not in development
        from django.conf import settings
        if not settings.DEBUG and request.is_secure() and request.get_host().startswith('localhost'):
            from django.http import HttpResponseRedirect
            from django.urls import reverse
            # Redirect to HTTP version
            url = request.build_absolute_uri()
            url = url.replace('https://', 'http://')
            return HttpResponseRedirect(url)
        
        response = self.get_response(request)
        return response 