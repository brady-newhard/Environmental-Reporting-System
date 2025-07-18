from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    inspector = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    location = models.CharField(max_length=255)
    weather_conditions = models.CharField(max_length=255)
    daily_activities = models.TextField()
    
    # Additional fields for search functionality
    report_type = models.CharField(max_length=100, blank=True, null=True)
    facility = models.CharField(max_length=255, blank=True, null=True)
    route = models.CharField(max_length=255, blank=True, null=True)
    spread = models.CharField(max_length=255, blank=True, null=True)
    compliance_level = models.CharField(max_length=100, blank=True, null=True)
    activity_category = models.CharField(max_length=100, blank=True, null=True)
    activity_group = models.CharField(max_length=100, blank=True, null=True)
    activity_type = models.CharField(max_length=100, blank=True, null=True)
    milepost_start = models.CharField(max_length=50, blank=True, null=True)
    milepost_end = models.CharField(max_length=50, blank=True, null=True)
    station_start = models.CharField(max_length=50, blank=True, null=True)
    station_end = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    finalized = models.BooleanField(default=False)

    def __str__(self):
        return f"Report by {self.inspector.username} on {self.date}"

    class Meta:
        abstract = True  # Make this a base class that can't be instantiated directly

class ReportApproval(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('in_review', 'In Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    DISCIPLINE_CHOICES = [
        ('environmental', 'Environmental'),
        ('coating', 'Coating'),
        ('welding', 'Welding'),
        ('utility', 'Utility'),
    ]
    
    # Report identification
    report_type = models.CharField(max_length=50)  # e.g., 'daily_utility_2', 'environmental_daily'
    report_id = models.CharField(max_length=100)  # The actual report ID from the discipline
    discipline = models.CharField(max_length=20, choices=DISCIPLINE_CHOICES)
    
    # Report data (JSON field to store the complete report)
    report_data = models.JSONField()
    
    # Approval workflow
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_reports')
    assigned_lead = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_reports', null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviewed_reports', null=True, blank=True)
    
    # Approval details
    rejection_reason = models.TextField(blank=True, null=True)
    review_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    submitted_at = models.DateTimeField(auto_now_add=True)
    assigned_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['report_type', 'report_id']
        ordering = ['-submitted_at']
        verbose_name = 'Report Approval'
        verbose_name_plural = 'Report Approvals'
    
    def __str__(self):
        return f"{self.get_discipline_display()} Report - {self.report_type} - {self.status}"
    
    @property
    def is_pending(self):
        return self.status in ['submitted', 'in_review']
    
    @property
    def is_approved(self):
        return self.status == 'approved'
    
    @property
    def is_rejected(self):
        return self.status == 'rejected'

# ProgressChart models will be implemented here as part of the reports app
