from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PunchlistReportViewSet, PunchlistItemViewSet

router = DefaultRouter()
router.register(r'punchlist-reports', PunchlistReportViewSet)
router.register(r'punchlist-items', PunchlistItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 