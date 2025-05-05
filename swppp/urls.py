from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedSimpleRouter
from .views import SWPPPReportViewSet, SWPPPItemViewSet, SWPPPPhotoViewSet

router = DefaultRouter()
router.register(r'reports', SWPPPReportViewSet, basename='swppp-report')

reports_router = NestedSimpleRouter(router, r'reports', lookup='report')
reports_router.register(r'items', SWPPPItemViewSet, basename='swppp-report-items')
reports_router.register(r'photos', SWPPPPhotoViewSet, basename='swppp-report-photos')

urlpatterns = router.urls + reports_router.urls 