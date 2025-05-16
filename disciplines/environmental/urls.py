from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProgressChartViewSet

router = DefaultRouter()
router.register(r'progress-charts', ProgressChartViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('punchlist/', include('disciplines.environmental.punchlist.urls')),
    path('swppp/', include('disciplines.environmental.swppp.urls')),
] 