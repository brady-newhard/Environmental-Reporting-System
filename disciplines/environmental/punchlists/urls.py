from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PunchlistReportViewSet, PunchlistItemViewSet

router = DefaultRouter()
router.register(r'', PunchlistReportViewSet, basename='punchlist-report')

# Nested routes for items under a report
from rest_framework_nested.routers import NestedDefaultRouter
punchlist_report_router = NestedDefaultRouter(router, r'', lookup='punchlist_report')
punchlist_report_router.register(r'items', PunchlistItemViewSet, basename='punchlist-report-items')

app_name = 'punchlists'

urlpatterns = [
    path('', include(router.urls)),
    path('', include(punchlist_report_router.urls)),
] 