from rest_framework import generics
from ..models import ProgressChart
from ..serializers import ProgressChartSerializer

class ProgressChartListView(generics.ListAPIView):
    queryset = ProgressChart.objects.all()
    serializer_class = ProgressChartSerializer 