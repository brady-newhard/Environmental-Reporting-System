from rest_framework import viewsets, permissions
from ..models import Report
from ..serializers import ReportSerializer

class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reports.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter reports based on the authenticated user.
        """
        return Report.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user) 