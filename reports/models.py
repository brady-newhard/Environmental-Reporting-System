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

class Contact(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contact')
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.phone_number}"

    class Meta:
        ordering = ['-created_at']

class ProgressChart(models.Model):
    activity = models.CharField(max_length=100)  # e.g., 'Felling', 'Clearing', etc.
    # List of 1001 values (0, 1, 2, etc.) for each 0.1 increment from 0 to 100
    progress_data = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.activity

# ProgressChart models will be implemented here as part of the reports app
