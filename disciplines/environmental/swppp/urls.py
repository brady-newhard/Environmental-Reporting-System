from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SWPPPReportViewSet, SWPPPItemViewSet, SWPPPPhotoViewSet

router = DefaultRouter()
router.register(r'swppp-reports', SWPPPReportViewSet)
router.register(r'swppp-items', SWPPPItemViewSet)
router.register(r'swppp-photos', SWPPPPhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 