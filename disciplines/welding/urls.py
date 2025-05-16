from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.DailyWeldReportViewSet)
router.register(r'inspections', views.WeldInspectionViewSet)
router.register(r'photos', views.WeldPhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 