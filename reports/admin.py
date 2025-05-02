from django.contrib import admin
from .models import Report, Contact

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('inspector', 'date', 'location', 'report_type', 'created_at')
    list_filter = ('inspector', 'date', 'report_type', 'compliance_level')
    search_fields = ('location', 'daily_activities', 'weather_conditions')
    date_hierarchy = 'date'

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')
