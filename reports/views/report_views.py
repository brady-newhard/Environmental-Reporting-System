from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from ..models import Report
from ..serializers import ReportSerializer
from django.db.models import Q
from datetime import datetime
from rest_framework.decorators import action
from rest_framework.response import Response

class ReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing reports.
    """
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['date', 'location', 'weather_conditions']
    search_fields = ['location', 'weather_conditions', 'daily_activities']

    def get_queryset(self):
        """
        Filter reports based on the authenticated user and search parameters.
        """
        queryset = Report.objects.filter(inspector=self.request.user)
        
        # Get all search parameters
        keyword = self.request.query_params.get('keyword', '')
        start_date = self.request.query_params.get('startDate', '')
        end_date = self.request.query_params.get('endDate', '')
        report_type = self.request.query_params.get('reportType', '')
        columns_to_include = self.request.query_params.get('columnsToInclude', '')
        milepost_start = self.request.query_params.get('milepostStart', '')
        milepost_end = self.request.query_params.get('milepostEnd', '')
        station_start = self.request.query_params.get('stationStart', '')
        station_end = self.request.query_params.get('stationEnd', '')
        facility = self.request.query_params.get('facility', '')
        route = self.request.query_params.get('route', '')
        spread = self.request.query_params.get('spread', '')
        report_review_status = self.request.query_params.get('reportReviewStatus', '')
        author = self.request.query_params.get('author', '')
        compliance_level = self.request.query_params.get('complianceLevel', '')
        category = self.request.query_params.get('category', '')
        activity_group = self.request.query_params.get('activityGroup', '')
        activity_type = self.request.query_params.get('activityType', '')
        
        # Apply keyword search
        if keyword:
            queryset = queryset.filter(
                Q(location__icontains=keyword) |
                Q(weather_conditions__icontains=keyword) |
                Q(daily_activities__icontains=keyword)
            )
        
        # Apply date range filter
        if start_date and end_date:
            try:
                start = datetime.strptime(start_date, '%Y-%m-%d').date()
                end = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__range=[start, end])
            except ValueError:
                pass
        
        # Apply other filters if they have values
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        if facility:
            queryset = queryset.filter(facility__icontains=facility)
        if route:
            queryset = queryset.filter(route__icontains=route)
        if spread:
            queryset = queryset.filter(spread__icontains=spread)
        if author:
            queryset = queryset.filter(inspector__username__icontains=author)
        if compliance_level:
            queryset = queryset.filter(compliance_level=compliance_level)
        if category:
            queryset = queryset.filter(activity_category=category)
        if activity_group:
            queryset = queryset.filter(activity_group=activity_group)
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Custom search endpoint that handles all search parameters.
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data) 