from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportDraftViewSet

router = DefaultRouter()
router.register(r'', ReportDraftViewSet, basename='draft')

urlpatterns = [
    path('', include(router.urls)),
] 