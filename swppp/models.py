from django.db import models
from django.contrib.auth.models import User

class SWPPPReport(models.Model):
    INSPECTION_TYPE_CHOICES = [
        ('routine', 'Routine Weekly Inspection'),
        ('precip', 'Precipitation Event > 0.25"'),
    ]
    inspection_type = models.CharField(max_length=20, choices=INSPECTION_TYPE_CHOICES)
    inspection_date = models.DateField()
    precipitation_date = models.DateField(null=True, blank=True)
    inspector_name = models.CharField(max_length=255)
    precipitation_rain_gage = models.BooleanField(default=False)
    precipitation_rain = models.BooleanField(default=False)
    precipitation_snow = models.BooleanField(default=False)
    soil_dry = models.BooleanField(default=False)
    soil_wet = models.BooleanField(default=False)
    soil_saturated = models.BooleanField(default=False)
    soil_frozen = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    weather_conditions = models.CharField(max_length=255, blank=True)
    additional_comments = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    finalized = models.BooleanField(default=False)

class SWPPPItem(models.Model):
    report = models.ForeignKey(SWPPPReport, on_delete=models.CASCADE, related_name='items')
    location = models.CharField(max_length=255)
    ll_number = models.CharField(max_length=100, blank=True)
    feature_details = models.CharField(max_length=255, blank=True)
    inspector_id = models.CharField(max_length=100, blank=True)
    soil_presently_disturbed = models.BooleanField(default=False)
    inspection_date = models.DateField(null=True, blank=True)
    inspection_time = models.TimeField(null=True, blank=True)
    ecd_functional = models.BooleanField(default=False)
    ecd_needs_maintenance = models.BooleanField(default=False)
    date_corrected = models.DateField(null=True, blank=True)
    comments = models.TextField(blank=True)

class SWPPPPhoto(models.Model):
    report = models.ForeignKey(SWPPPReport, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='swppp_photos/')
    location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True) 