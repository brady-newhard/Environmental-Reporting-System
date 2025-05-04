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

class PunchlistItem(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='punchlist_items')
    item_number = models.IntegerField()
    spread = models.CharField(max_length=100)
    inspector = models.CharField(max_length=100)
    start_station = models.CharField(max_length=100)
    end_station = models.CharField(max_length=100)
    feature = models.CharField(max_length=200)
    issue = models.TextField()
    recommendations = models.TextField()
    completed = models.BooleanField(default=False)
    inspector_signoff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='punchlist_signoffs')
    completed_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['item_number']

    def __str__(self):
        return f"Item #{self.item_number} - {self.feature}"
