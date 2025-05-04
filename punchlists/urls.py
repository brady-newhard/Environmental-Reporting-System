from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PunchlistItemViewSet

router = DefaultRouter()
router.register(r'reports/(?P<report_id>[^/.]+)/punchlist-items', PunchlistItemViewSet, basename='punchlist-item')

urlpatterns = [
    path('', include(router.urls)),
] 