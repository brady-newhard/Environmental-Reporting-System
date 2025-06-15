from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class ReportDraft(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=100)  # e.g., 'environmental_daily', 'coating', etc.
    data = models.JSONField()  # Store the draft as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.report_type} - {self.id}"
