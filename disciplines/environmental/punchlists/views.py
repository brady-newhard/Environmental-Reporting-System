from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import PunchlistItem, PunchlistReport
from .serializers import PunchlistItemSerializer, PunchlistReportSerializer

class PunchlistReportViewSet(viewsets.ModelViewSet):
    queryset = PunchlistReport.objects.all()
    serializer_class = PunchlistReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PunchlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = PunchlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        punchlist_report_pk = self.kwargs.get('punchlist_report_pk')
        return PunchlistItem.objects.filter(punchlist_report_id=punchlist_report_pk)

    def perform_create(self, serializer):
        punchlist_report_pk = self.kwargs.get('punchlist_report_pk')
        punchlist_report = PunchlistReport.objects.get(id=punchlist_report_pk)
        serializer.save(punchlist_report=punchlist_report)

    @action(detail=False, methods=['post'], url_path='batch')
    def batch_create(self, request, punchlist_report_pk=None):
        items_data = request.data.get('items', [])
        punchlist_report = PunchlistReport.objects.get(id=punchlist_report_pk)
        created_items = []
        errors = []
        for item_data in items_data:
            serializer = PunchlistItemSerializer(data=item_data)
            if serializer.is_valid():
                serializer.save(punchlist_report=punchlist_report)
                created_items.append(serializer.data)
            else:
                errors.append(serializer.errors)
        if errors:
            return Response({'created': created_items, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'created': created_items}, status=status.HTTP_201_CREATED) 