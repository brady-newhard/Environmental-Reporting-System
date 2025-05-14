from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import PunchlistReport, PunchlistItem, PunchlistPhoto
from .serializers import PunchlistReportSerializer, PunchlistItemSerializer, PunchlistPhotoSerializer

class PunchlistReportViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PunchlistReportSerializer

    def get_queryset(self):
        return PunchlistReport.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        report = self.get_object()
        report.is_finalized = True
        report.save()
        return Response({'status': 'report finalized'})

class PunchlistItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PunchlistItemSerializer

    def get_queryset(self):
        return PunchlistItem.objects.filter(report__created_by=self.request.user)

    def perform_create(self, serializer):
        report = get_object_or_404(PunchlistReport, pk=self.kwargs['report_pk'])
        serializer.save(report=report)

    @action(detail=True, methods=['post'])
    def upload_photo(self, request, pk=None):
        item = self.get_object()
        serializer = PunchlistPhotoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(item=item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PunchlistPhotoViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PunchlistPhotoSerializer

    def get_queryset(self):
        return PunchlistPhoto.objects.filter(item__report__created_by=self.request.user)

    def perform_create(self, serializer):
        item = get_object_or_404(PunchlistItem, pk=self.kwargs['item_pk'])
        serializer.save(item=item) 