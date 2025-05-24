from rest_framework import viewsets, permissions
from .models import ConcreteReport, ReportDraft
from .serializers import ReportSerializer, ReportDraftSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = ConcreteReport.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)

class ReportDraftViewSet(viewsets.ModelViewSet):
    serializer_class = ReportDraftSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ReportDraft.objects.filter(user=self.request.user)
        report_type = self.request.query_params.get('report_type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
