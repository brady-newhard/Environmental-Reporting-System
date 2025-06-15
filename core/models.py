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

class ConcreteReport(Report):
    """Concrete implementation of the Report model."""
    class Meta:
        db_table = 'core_report'  # Use the same table name as before

# ProgressChart models will be implemented here as part of the reports app
