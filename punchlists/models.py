from django.db import models
from django.contrib.auth.models import User

class PunchlistItem(models.Model):
    report = models.ForeignKey('reports.Report', on_delete=models.CASCADE, related_name='punchlist_items_new')
    item_number = models.IntegerField(null=True, blank=True)
    spread = models.CharField(max_length=100, blank=True, null=True)
    inspector = models.CharField(max_length=100, blank=True, null=True)
    start_station = models.CharField(max_length=100, blank=True, null=True)
    end_station = models.CharField(max_length=100, blank=True, null=True)
    feature = models.CharField(max_length=200, blank=True, null=True)
    issue = models.TextField(blank=True, null=True)
    recommendations = models.TextField(blank=True, null=True)
    completed = models.BooleanField(default=False)
    inspector_signoff = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='punchlist_signoffs_new')
    completed_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['item_number']

    def __str__(self):
        return f"Item #{self.item_number} - {self.feature}" 