from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'reports', views.DailyCoatingReportViewSet)
router.register(r'inspections', views.CoatingInspectionViewSet)
router.register(r'photos', views.CoatingPhotoViewSet)
router.register(r'oversight-items', views.CoatingOversightItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 