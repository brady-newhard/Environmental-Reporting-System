from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import SWPPPReport, SWPPPItem, SWPPPPhoto
from .serializers import SWPPPReportSerializer, SWPPPItemSerializer, SWPPPPhotoSerializer

class SWPPPReportViewSet(viewsets.ModelViewSet):
    queryset = SWPPPReport.objects.all()
    serializer_class = SWPPPReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SWPPPItemViewSet(viewsets.ModelViewSet):
    serializer_class = SWPPPItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        report_pk = self.kwargs.get('report_pk')
        return SWPPPItem.objects.filter(report_id=report_pk)

    def perform_create(self, serializer):
        report_pk = self.kwargs.get('report_pk')
        serializer.save(report_id=report_pk)

class SWPPPPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = SWPPPPhotoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        report_pk = self.kwargs.get('report_pk')
        return SWPPPPhoto.objects.filter(report_id=report_pk)

    def perform_create(self, serializer):
        report_pk = self.kwargs.get('report_pk')
        serializer.save(report_id=report_pk) 