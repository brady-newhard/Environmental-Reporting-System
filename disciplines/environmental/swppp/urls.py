from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SWPPPReportViewSet, SWPPPItemViewSet

router = DefaultRouter()
router.register(r'reports', SWPPPReportViewSet)
router.register(r'items', SWPPPItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 