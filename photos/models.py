from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Photo(models.Model):
    image = models.ImageField(upload_to='photos/%Y/%m/%d/')
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_photos')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_type = models.CharField(max_length=100, blank=True)  # For storing the type of content (e.g., 'swppp', 'utility', etc.)
    object_id = models.PositiveIntegerField(null=True, blank=True)  # For storing the ID of the related object

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Photo'
        verbose_name_plural = 'Photos'

    def __str__(self):
        return f"Photo - {self.uploaded_at} - {self.location or 'No location'}"
