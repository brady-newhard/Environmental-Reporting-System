from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportApprovalViewSet

router = DefaultRouter()
router.register(r'reports', ReportApprovalViewSet, basename='report-approval')

urlpatterns = [
    path('', include(router.urls)),
]
