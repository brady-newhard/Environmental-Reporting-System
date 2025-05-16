from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.DailyUtilityReportViewSet)
router.register(r'inspections', views.UtilityInspectionViewSet)
router.register(r'photos', views.UtilityPhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 