from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from .models import ReportApproval
from .serializers import ReportApprovalSerializer, ReportApprovalListSerializer
from users.models import UserProfile

class ReportApprovalViewSet(viewsets.ModelViewSet):
    serializer_class = ReportApprovalSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=user, role='inspector')
        
        # If user is a lead, show reports assigned to them OR unassigned reports in their discipline
        if profile.role == 'lead':
            if profile.discipline == 'all':
                # Lead with 'all' discipline can see all unassigned reports or reports assigned to them
                queryset = ReportApproval.objects.filter(
                    models.Q(assigned_lead=user) | models.Q(assigned_lead__isnull=True)
                )
            else:
                # Lead with specific discipline can see unassigned reports in their discipline or reports assigned to them
                queryset = ReportApproval.objects.filter(
                    models.Q(assigned_lead=user) | 
                    (models.Q(assigned_lead__isnull=True) & models.Q(discipline=profile.discipline))
                )
        # If user is admin, show all reports
        elif profile.role == 'admin':
            queryset = ReportApproval.objects.all()
        # If user is inspector, show only their submitted reports
        else:
            queryset = ReportApproval.objects.filter(submitted_by=user)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by discipline
        discipline_filter = self.request.query_params.get('discipline')
        if discipline_filter and profile.role == 'lead' and profile.discipline != 'all':
            queryset = queryset.filter(discipline=profile.discipline)
        
        return queryset.order_by('-submitted_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ReportApprovalListSerializer
        return ReportApprovalSerializer
    
    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def assign_lead(self, request, pk=None):
        """Assign a lead to review the report"""
        report = self.get_object()
        lead_id = request.data.get('lead_id')
        
        if not lead_id:
            return Response({'error': 'lead_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            lead = User.objects.get(id=lead_id)
            lead_profile = lead.profile
            if lead_profile.role != 'lead':
                return Response({'error': 'User is not a lead'}, status=status.HTTP_400_BAD_REQUEST)
            
            report.assigned_lead = lead
            report.status = 'in_review'
            report.assigned_at = timezone.now()
            report.save()
            
            return Response({'message': 'Lead assigned successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Lead not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a report"""
        report = self.get_object()
        user = request.user
        
        # Check if user is the assigned lead or admin
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if profile.role not in ['lead', 'admin']:
            return Response({'error': 'Only leads and admins can approve reports'}, status=status.HTTP_403_FORBIDDEN)
        
        if profile.role == 'lead' and report.assigned_lead != user:
            return Response({'error': 'You can only approve reports assigned to you'}, status=status.HTTP_403_FORBIDDEN)
        
        review_notes = request.data.get('review_notes', '')
        
        report.status = 'approved'
        report.reviewed_by = user
        report.reviewed_at = timezone.now()
        report.review_notes = review_notes
        report.save()
        
        return Response({'message': 'Report approved successfully'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a report with reason"""
        report = self.get_object()
        user = request.user
        
        # Check if user is the assigned lead or admin
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if profile.role not in ['lead', 'admin']:
            return Response({'error': 'Only leads and admins can reject reports'}, status=status.HTTP_403_FORBIDDEN)
        
        if profile.role == 'lead' and report.assigned_lead != user:
            return Response({'error': 'You can only reject reports assigned to you'}, status=status.HTTP_403_FORBIDDEN)
        
        rejection_reason = request.data.get('rejection_reason')
        if not rejection_reason:
            return Response({'error': 'rejection_reason is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        review_notes = request.data.get('review_notes', '')
        
        report.status = 'rejected'
        report.reviewed_by = user
        report.reviewed_at = timezone.now()
        report.rejection_reason = rejection_reason
        report.review_notes = review_notes
        report.save()
        
        return Response({'message': 'Report rejected successfully'})
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for leads"""
        user = request.user
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if profile.role not in ['lead', 'admin']:
            return Response({'error': 'Only leads and admins can access dashboard stats'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get reports for this lead
        if profile.role == 'lead':
            if profile.discipline == 'all':
                # Lead with 'all' discipline can see all unassigned reports or reports assigned to them
                reports = ReportApproval.objects.filter(
                    models.Q(assigned_lead=user) | models.Q(assigned_lead__isnull=True)
                )
            else:
                # Lead with specific discipline can see unassigned reports in their discipline or reports assigned to them
                reports = ReportApproval.objects.filter(
                    models.Q(assigned_lead=user) | 
                    (models.Q(assigned_lead__isnull=True) & models.Q(discipline=profile.discipline))
                )
        else:
            reports = ReportApproval.objects.all()
        
        stats = {
            'pending': reports.filter(status__in=['submitted', 'in_review']).count(),
            'approved': reports.filter(status='approved').count(),
            'rejected': reports.filter(status='rejected').count(),
            'total': reports.count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def available_leads(self, request):
        """Get list of available leads for assignment"""
        leads = UserProfile.objects.filter(role='lead').select_related('user')
        lead_data = []
        
        for lead_profile in leads:
            lead_data.append({
                'id': lead_profile.user.id,
                'name': lead_profile.user.get_full_name(),
                'username': lead_profile.user.username,
                'discipline': lead_profile.discipline,
                'discipline_display': lead_profile.get_discipline_display(),
            })
        
        return Response(lead_data)
