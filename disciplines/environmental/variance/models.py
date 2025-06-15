from django.db import models
from django.contrib.auth.models import User

class VarianceReport(models.Model):
    title = models.CharField(max_length=255)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='variance_reports')
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved = models.BooleanField(default=False)

    def __str__(self):
        return f"Variance Report: {self.title} ({self.date})"

    class Meta:
        app_label = 'environmental'
        verbose_name = 'Variance Report'
        verbose_name_plural = 'Variance Reports' 