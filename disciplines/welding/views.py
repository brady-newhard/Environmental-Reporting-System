from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DailyWeldReport, WeldInspection, WeldPhoto
from .serializers import (
    DailyWeldReportSerializer,
    WeldInspectionSerializer,
    WeldPhotoSerializer
)

# Create your views here.

class DailyWeldReportViewSet(viewsets.ModelViewSet):
    queryset = DailyWeldReport.objects.all()
    serializer_class = DailyWeldReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)

    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        report = self.get_object()
        report.finalized = True
        report.save()
        return Response({'status': 'report finalized'})

    @action(detail=True, methods=['post'])
    def unfinalize(self, request, pk=None):
        report = self.get_object()
        report.finalized = False
        report.save()
        return Response({'status': 'report unfinalized'})

class WeldInspectionViewSet(viewsets.ModelViewSet):
    queryset = WeldInspection.objects.all()
    serializer_class = WeldInspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = WeldInspection.objects.all()
        report_id = self.request.query_params.get('report_id', None)
        if report_id is not None:
            queryset = queryset.filter(report_id=report_id)
        return queryset

class WeldPhotoViewSet(viewsets.ModelViewSet):
    queryset = WeldPhoto.objects.all()
    serializer_class = WeldPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = WeldPhoto.objects.all()
        inspection_id = self.request.query_params.get('inspection_id', None)
        if inspection_id is not None:
            queryset = queryset.filter(inspection_id=inspection_id)
        return queryset
