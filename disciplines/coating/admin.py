from django.contrib import admin
from .models import DailyCoatingReport, CoatingInspection, CoatingPhoto, CoatingOversightItem

class CoatingPhotoInline(admin.TabularInline):
    model = CoatingPhoto
    extra = 1
    fields = ('image', 'description')

class CoatingInspectionInline(admin.TabularInline):
    model = CoatingInspection
    extra = 1
    fields = ('surface_type', 'coating_type', 'surface_area', 'surface_preparation',
              'coating_thickness', 'temperature', 'humidity', 'visual_inspection',
              'adhesion_test', 'passed')

class CoatingOversightItemInline(admin.TabularInline):
    model = CoatingOversightItem
    extra = 1
    fields = ('item_number', 'description', 'status', 'comments')

@admin.register(DailyCoatingReport)
class DailyCoatingReportAdmin(admin.ModelAdmin):
    list_display = ('date', 'contractor', 'report_number', 'location', 'qa_inspector', 'finalized')
    list_filter = ('finalized', 'date', 'contractor')
    search_fields = ('location', 'notes', 'contractor', 'report_number', 'qa_inspector')
    date_hierarchy = 'date'
    inlines = [CoatingInspectionInline, CoatingOversightItemInline]
    fieldsets = (
        ('Report Information', {
            'fields': ('date', 'contractor', 'report_number', 'oq_personnel', 'facility_id', 'purchase_order', 'location', 'qa_inspector', 'finalized')
        }),
        ('Environmental Conditions', {
            'fields': ('weather_conditions', 'temperature', 'humidity')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # If this is a new object
            obj.inspector = request.user
        super().save_model(request, obj, form, change)

@admin.register(CoatingInspection)
class CoatingInspectionAdmin(admin.ModelAdmin):
    list_display = ('surface_type', 'coating_type', 'surface_area', 'coating_thickness', 'passed')
    list_filter = ('surface_type', 'coating_type', 'passed', 'visual_inspection', 'adhesion_test')
    search_fields = ('surface_preparation', 'defect_description', 'corrective_action', 'notes')
    raw_id_fields = ('report',)
    inlines = [CoatingPhotoInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('report', 'surface_type', 'coating_type', 'surface_area')
        }),
        ('Surface Preparation', {
            'fields': ('surface_preparation', 'coating_thickness')
        }),
        ('Environmental Conditions', {
            'fields': ('temperature', 'humidity')
        }),
        ('Application Details', {
            'fields': ('application_method', 'application_time_begin', 'application_time_end', 'wft_mils')
        }),
        ('Mixing Information', {
            'fields': ('mix_number', 'comp_a_batch', 'comp_b_batch', 'mix_time', 'act_induct_time', 'pot_life', 'quantity_used', 'witnessed')
        }),
        ('Inspection Results', {
            'fields': ('visual_inspection', 'adhesion_test', 'adhesion_test_results')
        }),
        ('Defects and Actions', {
            'fields': ('defects_found', 'defect_description', 'corrective_action')
        }),
        ('Additional Details', {
            'fields': ('backfill_used', 'rock_shield_used')
        }),
        ('Final Status', {
            'fields': ('passed', 'notes')
        }),
    )

@admin.register(CoatingPhoto)
class CoatingPhotoAdmin(admin.ModelAdmin):
    list_display = ('inspection', 'description', 'uploaded_at')
    search_fields = ('description', 'inspection__surface_type', 'inspection__coating_type')
    raw_id_fields = ('inspection',)
    fieldsets = (
        ('Photo Information', {
            'fields': ('inspection', 'image', 'description')
        }),
    )

@admin.register(CoatingOversightItem)
class CoatingOversightItemAdmin(admin.ModelAdmin):
    list_display = ('item_number', 'description', 'status', 'report')
    list_filter = ('status', 'report__date')
    search_fields = ('description', 'comments', 'report__contractor')
    raw_id_fields = ('report',)
    fieldsets = (
        ('Item Information', {
            'fields': ('report', 'item_number', 'description', 'status', 'comments')
        }),
    )
