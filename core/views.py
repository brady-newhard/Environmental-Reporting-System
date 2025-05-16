from rest_framework import viewsets, permissions
from .models import ConcreteReport
from .serializers import ReportSerializer

class ReportViewSet(viewsets.ModelViewSet):
    queryset = ConcreteReport.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)
