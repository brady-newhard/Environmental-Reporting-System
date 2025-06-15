from django.db import models
from django.contrib.auth.models import User

class DailyReport(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_reports')
    date = models.DateField()
    summary = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    finalized = models.BooleanField(default=False)

    def __str__(self):
        return f"Daily Report: {self.title} ({self.date})"

    class Meta:
        app_label = 'environmental'
        verbose_name = 'Daily Report'
        verbose_name_plural = 'Daily Reports' 