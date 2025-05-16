from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DailyUtilityReport, UtilityInspection, UtilityPhoto
from .serializers import (
    DailyUtilityReportSerializer,
    UtilityInspectionSerializer,
    UtilityPhotoSerializer
)

# Create your views here.

class DailyUtilityReportViewSet(viewsets.ModelViewSet):
    queryset = DailyUtilityReport.objects.all()
    serializer_class = DailyUtilityReportSerializer
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

class UtilityInspectionViewSet(viewsets.ModelViewSet):
    queryset = UtilityInspection.objects.all()
    serializer_class = UtilityInspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = UtilityInspection.objects.all()
        report_id = self.request.query_params.get('report_id', None)
        if report_id is not None:
            queryset = queryset.filter(report_id=report_id)
        return queryset

class UtilityPhotoViewSet(viewsets.ModelViewSet):
    queryset = UtilityPhoto.objects.all()
    serializer_class = UtilityPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = UtilityPhoto.objects.all()
        inspection_id = self.request.query_params.get('inspection_id', None)
        if inspection_id is not None:
            queryset = queryset.filter(inspection_id=inspection_id)
        return queryset
