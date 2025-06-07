"""
URL configuration for environmentalreport project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from users.views_auth import CustomAuthToken
from django.views.generic import TemplateView
from django.views.static import serve
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
import os

schema_view = get_schema_view(
    openapi.Info(
        title="Environmental Reporting API",
        default_version='v1',
        description="API for Environmental Reporting System",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@example.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/users/', include('users.urls')),
    path('api/environmental/', include('disciplines.environmental.urls')),
    path('api/coating/', include('disciplines.coating.urls')),
    path('api/welding/', include('disciplines.welding.urls')),
    path('api/utility/', include('disciplines.utility.urls')),
    path('api/login/', CustomAuthToken.as_view(), name='api_token_auth'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve static files in production
if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^staticfiles/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
        re_path(r'^staticfiles/assets/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.STATIC_ROOT, 'assets')}),
        re_path(r'^staticfiles/favicon.ico$', serve, {'path': 'favicon.ico', 'document_root': settings.STATIC_ROOT}),
        re_path(r'^staticfiles/manifest.json$', serve, {'path': 'manifest.json', 'document_root': settings.STATIC_ROOT}),
        re_path(r'^staticfiles/logo192.png$', serve, {'path': 'logo192.png', 'document_root': settings.STATIC_ROOT}),
        re_path(r'^staticfiles/logo512.png$', serve, {'path': 'logo512.png', 'document_root': settings.STATIC_ROOT}),
        re_path(r'^staticfiles/robots.txt$', serve, {'path': 'robots.txt', 'document_root': settings.STATIC_ROOT}),
    ]
    
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    ]
    
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]
else:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]

# Debug route to check static files
if settings.DEBUG:
    from django.http import JsonResponse
    from django.views.decorators.csrf import csrf_exempt
    import os

    @csrf_exempt
    def check_static_files(request):
        static_root = settings.STATIC_ROOT
        assets_dir = os.path.join(static_root, 'assets')
        
        files = {
            'static_root': static_root,
            'assets_dir': assets_dir,
            'static_root_exists': os.path.exists(static_root),
            'assets_dir_exists': os.path.exists(assets_dir),
            'static_root_contents': os.listdir(static_root) if os.path.exists(static_root) else [],
            'assets_dir_contents': os.listdir(assets_dir) if os.path.exists(assets_dir) else [],
        }
        
        return JsonResponse(files)

    urlpatterns += [
        path('debug/static-files/', check_static_files),
    ]
