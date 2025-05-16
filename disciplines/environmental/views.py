from rest_framework import viewsets, permissions
from .models import ProgressChart
from .serializers import ProgressChartSerializer

class ProgressChartViewSet(viewsets.ModelViewSet):
    queryset = ProgressChart.objects.all()
    serializer_class = ProgressChartSerializer
    permission_classes = [permissions.IsAuthenticated] 