from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ReportDraftViewSet

router = DefaultRouter()
router.register(r'reports', ReportViewSet)
router.register(r'drafts', ReportDraftViewSet, basename='draft')

urlpatterns = [
    path('', include(router.urls)),
]
