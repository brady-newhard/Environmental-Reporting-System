from django.db import models
from django.contrib.auth.models import User

class Contact(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contact')
    phone_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.phone_number}"

    class Meta:
        ordering = ['-created_at']

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('inspector', 'Inspector'),
        ('lead', 'Lead'),
        ('admin', 'Admin'),
    ]
    
    DISCIPLINE_CHOICES = [
        ('environmental', 'Environmental'),
        ('coating', 'Coating'),
        ('welding', 'Welding'),
        ('utility', 'Utility'),
        ('all', 'All Disciplines'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='inspector')
    discipline = models.CharField(max_length=20, choices=DISCIPLINE_CHOICES, default='environmental')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_role_display()} ({self.get_discipline_display()})"

    class Meta:
        ordering = ['-created_at']
