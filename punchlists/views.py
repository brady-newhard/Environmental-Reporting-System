from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import PunchlistItem
from .serializers import PunchlistItemSerializer
from reports.models import Report

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

    @action(detail=False, methods=['post'], url_path='batch')
    def batch_create(self, request, report_id=None):
        items_data = request.data.get('items', [])
        report = Report.objects.get(id=report_id)
        created_items = []
        errors = []
        for item_data in items_data:
            serializer = PunchlistItemSerializer(data=item_data)
            if serializer.is_valid():
                serializer.save(report=report)
                created_items.append(serializer.data)
            else:
                errors.append(serializer.errors)
        if errors:
            return Response({'created': created_items, 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'created': created_items}, status=status.HTTP_201_CREATED) 