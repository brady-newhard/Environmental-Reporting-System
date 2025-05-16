# Remove the incorrect import from .swppp.views
# If you need SWPPP viewsets, import them from their correct location:
# from disciplines.environmental.swppp.views import SWPPPReportViewSet, SWPPPItemViewSet, SWPPPPhotoViewSet

from rest_framework import viewsets, permissions
from .models import PunchlistReport, PunchlistItem
from .serializers import PunchlistReportSerializer, PunchlistItemSerializer

class PunchlistReportViewSet(viewsets.ModelViewSet):
    queryset = PunchlistReport.objects.all()
    serializer_class = PunchlistReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PunchlistItemViewSet(viewsets.ModelViewSet):
    queryset = PunchlistItem.objects.all()
    serializer_class = PunchlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

__all__ = [
    'PunchlistReportViewSet',
    'PunchlistItemViewSet',
] 