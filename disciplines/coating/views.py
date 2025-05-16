from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import DailyCoatingReport, CoatingInspection, CoatingPhoto, CoatingOversightItem
from .serializers import (
    DailyCoatingReportSerializer,
    CoatingInspectionSerializer,
    CoatingPhotoSerializer,
    CoatingOversightItemSerializer
)

# Create your views here.

class DailyCoatingReportViewSet(viewsets.ModelViewSet):
    queryset = DailyCoatingReport.objects.all()
    serializer_class = DailyCoatingReportSerializer
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

class CoatingInspectionViewSet(viewsets.ModelViewSet):
    queryset = CoatingInspection.objects.all()
    serializer_class = CoatingInspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CoatingInspection.objects.all()
        report_id = self.request.query_params.get('report_id', None)
        if report_id is not None:
            queryset = queryset.filter(report_id=report_id)
        return queryset

class CoatingPhotoViewSet(viewsets.ModelViewSet):
    queryset = CoatingPhoto.objects.all()
    serializer_class = CoatingPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CoatingPhoto.objects.all()
        inspection_id = self.request.query_params.get('inspection_id', None)
        if inspection_id is not None:
            queryset = queryset.filter(inspection_id=inspection_id)
        return queryset

class CoatingOversightItemViewSet(viewsets.ModelViewSet):
    queryset = CoatingOversightItem.objects.all()
    serializer_class = CoatingOversightItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CoatingOversightItem.objects.all()
        report_id = self.request.query_params.get('report_id', None)
        if report_id is not None:
            queryset = queryset.filter(report_id=report_id)
        return queryset
