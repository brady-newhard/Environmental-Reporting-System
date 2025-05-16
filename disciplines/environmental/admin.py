from django.contrib import admin
from disciplines.environmental.punchlist.models import PunchlistReport, PunchlistItem
from disciplines.environmental.swppp.models import SWPPPReport, SWPPPItem, SWPPPPhoto

class PunchlistItemInline(admin.TabularInline):
    model = PunchlistItem
    extra = 1
    fields = ('item_number', 'spread', 'inspector', 'feature', 'issue', 'recommendations', 'completed', 'inspector_signoff', 'completed_date')

@admin.register(PunchlistReport)
class PunchlistReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'date', 'finalized', 'created_at')
    list_filter = ('finalized', 'date', 'author')
    search_fields = ('title', 'author__username')
    date_hierarchy = 'date'
    inlines = [PunchlistItemInline]
    fieldsets = (
        ('Report Information', {
            'fields': ('title', 'date', 'finalized')
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # If this is a new object
            obj.author = request.user
        super().save_model(request, obj, form, change)

@admin.register(PunchlistItem)
class PunchlistItemAdmin(admin.ModelAdmin):
    list_display = ('item_number', 'spread', 'inspector', 'feature', 'completed')
    list_filter = ('completed', 'spread', 'inspector')
    search_fields = ('feature', 'issue', 'recommendations')
    raw_id_fields = ('punchlist_report', 'inspector_signoff')
    fieldsets = (
        ('Item Details', {
            'fields': ('punchlist_report', 'item_number', 'spread', 'inspector')
        }),
        ('Location', {
            'fields': ('start_station', 'end_station', 'feature')
        }),
        ('Content', {
            'fields': ('issue', 'recommendations')
        }),
        ('Status', {
            'fields': ('completed', 'inspector_signoff', 'completed_date')
        }),
    )

class SWPPPItemInline(admin.TabularInline):
    model = SWPPPItem
    extra = 1
    fields = ('location', 'll_number', 'feature_details', 'inspector_id', 'soil_presently_disturbed', 
              'inspection_date', 'inspection_time', 'ecd_functional', 'ecd_needs_maintenance', 
              'date_corrected', 'comments')

class SWPPPPhotoInline(admin.TabularInline):
    model = SWPPPPhoto
    extra = 1
    fields = ('image', 'location', 'description')

@admin.register(SWPPPReport)
class SWPPPReportAdmin(admin.ModelAdmin):
    list_display = ('inspection_type', 'inspection_date', 'inspector_name', 'finalized')
    list_filter = ('inspection_type', 'finalized', 'inspection_date')
    search_fields = ('inspector_name', 'notes', 'weather_conditions')
    date_hierarchy = 'inspection_date'
    inlines = [SWPPPItemInline, SWPPPPhotoInline]
    fieldsets = (
        ('Inspection Information', {
            'fields': ('inspection_type', 'inspection_date', 'inspector_name', 'finalized')
        }),
        ('Precipitation Details', {
            'fields': ('precipitation_date', 'precipitation_rain_gage', 'precipitation_rain', 'precipitation_snow')
        }),
        ('Soil Conditions', {
            'fields': ('soil_dry', 'soil_wet', 'soil_saturated', 'soil_frozen')
        }),
        ('Additional Information', {
            'fields': ('notes', 'weather_conditions', 'additional_comments', 'created_by')
        }),
    )

@admin.register(SWPPPItem)
class SWPPPItemAdmin(admin.ModelAdmin):
    list_display = ('location', 'll_number', 'inspection_date', 'ecd_functional')
    list_filter = ('ecd_functional', 'ecd_needs_maintenance', 'soil_presently_disturbed')
    search_fields = ('location', 'feature_details', 'comments')
    raw_id_fields = ('report',)
    fieldsets = (
        ('Location Information', {
            'fields': ('report', 'location', 'll_number', 'feature_details', 'inspector_id')
        }),
        ('Inspection Details', {
            'fields': ('soil_presently_disturbed', 'inspection_date', 'inspection_time')
        }),
        ('ECD Status', {
            'fields': ('ecd_functional', 'ecd_needs_maintenance', 'date_corrected')
        }),
        ('Comments', {
            'fields': ('comments',)
        }),
    )

@admin.register(SWPPPPhoto)
class SWPPPPhotoAdmin(admin.ModelAdmin):
    list_display = ('location', 'uploaded_at')
    search_fields = ('location', 'description')
    raw_id_fields = ('report',)
    fieldsets = (
        ('Photo Information', {
            'fields': ('report', 'image', 'location', 'description')
        }),
    ) 