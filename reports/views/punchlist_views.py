from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Report, PunchlistItem
from ..serializers import PunchlistItemSerializer

class PunchlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = PunchlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        report_id = self.kwargs.get('report_id')
        return PunchlistItem.objects.filter(report_id=report_id)

    def perform_create(self, serializer):
        report_id = self.kwargs.get('report_id')
        report = Report.objects.get(id=report_id)
        serializer.save(report=report) 