from django.db import models
from django.contrib.auth.models import User

class ProgressChart(models.Model):
    activity = models.CharField(max_length=100)  # e.g., 'Felling', 'Clearing', etc.
    # List of 1001 values (0, 1, 2, etc.) for each 0.1 increment from 0 to 100
    progress_data = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'environmental'
        db_table = 'environmental_progresschart'

    def __str__(self):
        return self.activity

# ... existing code ... 