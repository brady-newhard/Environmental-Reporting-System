from django.contrib import admin
from .models import DailyUtilityReport, UtilityInspection, UtilityPhoto

@admin.register(DailyUtilityReport)
class DailyUtilityReportAdmin(admin.ModelAdmin):
    list_display = ('date', 'inspector', 'location', 'contractor', 'finalized', 'created_at')
    list_filter = ('date', 'finalized', 'inspector')
    search_fields = ('location', 'contractor', 'notes')
    date_hierarchy = 'date'

@admin.register(UtilityInspection)
class UtilityInspectionAdmin(admin.ModelAdmin):
    list_display = ('utility_type', 'location', 'status', 'issues_found', 'completed', 'created_at')
    list_filter = ('utility_type', 'status', 'issues_found', 'completed')
    search_fields = ('location', 'description', 'issue_description')
    date_hierarchy = 'created_at'

@admin.register(UtilityPhoto)
class UtilityPhotoAdmin(admin.ModelAdmin):
    list_display = ('inspection', 'description', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('description',)
    date_hierarchy = 'uploaded_at'
