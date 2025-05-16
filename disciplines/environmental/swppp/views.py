from rest_framework import viewsets, permissions
from .models import SWPPPReport, SWPPPItem, SWPPPPhoto
from .serializers import SWPPPReportSerializer, SWPPPItemSerializer, SWPPPPhotoSerializer

class SWPPPReportViewSet(viewsets.ModelViewSet):
    queryset = SWPPPReport.objects.all()
    serializer_class = SWPPPReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SWPPPItemViewSet(viewsets.ModelViewSet):
    queryset = SWPPPItem.objects.all()
    serializer_class = SWPPPItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

class SWPPPPhotoViewSet(viewsets.ModelViewSet):
    queryset = SWPPPPhoto.objects.all()
    serializer_class = SWPPPPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

__all__ = [
    'SWPPPReportViewSet',
    'SWPPPItemViewSet',
    'SWPPPPhotoViewSet',
] 