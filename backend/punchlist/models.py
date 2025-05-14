from django.db import models
from django.contrib.auth.models import User

class PunchlistReport(models.Model):
    title = models.CharField(max_length=200)
    date = models.DateField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_finalized = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.date}"

class PunchlistItem(models.Model):
    report = models.ForeignKey(PunchlistReport, on_delete=models.CASCADE, related_name='items')
    start_station = models.CharField(max_length=100)
    end_station = models.CharField(max_length=100)
    feature = models.CharField(max_length=200)
    issue = models.TextField()
    recommendations = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.feature} - {self.start_station} to {self.end_station}"

class PunchlistPhoto(models.Model):
    item = models.ForeignKey(PunchlistItem, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='punchlist_photos/')
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo for {self.item.feature} - {self.uploaded_at}" 