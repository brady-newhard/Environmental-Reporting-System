from django.contrib import admin
from .models import Photo

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'uploaded_by', 'location', 'content_type', 'object_id', 'uploaded_at')
    list_filter = ('content_type', 'uploaded_at')
    search_fields = ('location', 'description', 'uploaded_by__username')
    readonly_fields = ('uploaded_at',)
    fieldsets = (
        ('Photo Information', {
            'fields': ('image', 'description', 'location')
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'uploaded_at', 'content_type', 'object_id')
        }),
    )
