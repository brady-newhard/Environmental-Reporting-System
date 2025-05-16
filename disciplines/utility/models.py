from django.db import models
from django.contrib.auth.models import User

class DailyUtilityReport(models.Model):
    date = models.DateField()
    inspector = models.ForeignKey(User, on_delete=models.CASCADE)
    contractor = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255)
    weather_conditions = models.CharField(max_length=255)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    notes = models.TextField(blank=True)
    finalized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Daily Utility Report'
        verbose_name_plural = 'Daily Utility Reports'
        app_label = 'disciplines.utility'

    def __str__(self):
        return f"Utility Report - {self.date} - {self.location}"

class UtilityInspection(models.Model):
    UTILITY_TYPE_CHOICES = [
        ('water', 'Water'),
        ('gas', 'Gas'),
        ('electric', 'Electric'),
        ('telecom', 'Telecom'),
        ('other', 'Other'),
    ]

    report = models.ForeignKey(DailyUtilityReport, on_delete=models.CASCADE, related_name='inspections')
    utility_type = models.CharField(max_length=50, choices=UTILITY_TYPE_CHOICES)
    location = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50)
    issues_found = models.BooleanField(default=False)
    issue_description = models.TextField(blank=True)
    corrective_action = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Utility Inspection'
        verbose_name_plural = 'Utility Inspections'
        app_label = 'disciplines.utility'

    def __str__(self):
        return f"Utility Inspection - {self.utility_type} - {self.location}"

class UtilityPhoto(models.Model):
    inspection = models.ForeignKey(UtilityInspection, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='utility_photos/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Utility Photo'
        verbose_name_plural = 'Utility Photos'
        app_label = 'disciplines.utility'

    def __str__(self):
        return f"Photo - {self.inspection} - {self.uploaded_at}"
