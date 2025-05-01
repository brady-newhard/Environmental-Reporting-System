from django.db import models
from django.contrib.auth.models import User

class Report(models.Model):
    inspector = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    location = models.CharField(max_length=255)
    weather_conditions = models.CharField(max_length=255)
    daily_activities = models.TextField()
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
