from django.contrib import admin
from .models import DailyWeldReport, WeldInspection, WeldPhoto

class WeldPhotoInline(admin.TabularInline):
    model = WeldPhoto
    extra = 1
    fields = ('image', 'description')

class WeldInspectionInline(admin.TabularInline):
    model = WeldInspection
    extra = 1
    fields = ('weld_number', 'weld_type', 'position', 'joint_type', 'material_type',
              'thickness', 'length', 'preheat_temp', 'interpass_temp', 'post_weld_temp',
              'visual_inspection', 'ndt_performed', 'ndt_method', 'ndt_results',
              'defects_found', 'defect_description', 'corrective_action', 'passed')

@admin.register(DailyWeldReport)
class DailyWeldReportAdmin(admin.ModelAdmin):
    list_display = ('date', 'project', 'contractor', 'location', 'welding_inspector_name', 'finalized')
    list_filter = ('finalized', 'date', 'contractor')
    search_fields = ('project', 'contractor', 'location', 'welding_inspector_name')
    date_hierarchy = 'date'
    inlines = [WeldInspectionInline]
    fieldsets = (
        ('Report Information', {
            'fields': ('date', 'project', 'contractor', 'construction_wbs', 'retirement_wbs',
                      'activity', 'hours_worked', 'welders_onsite', 'location', 'finalized')
        }),
        ('Environmental Conditions', {
            'fields': ('weather_conditions', 'temperature', 'humidity')
        }),
        ('Welds Tracking', {
            'fields': (
                ('welds_fab_to_date', 'welds_fab_today', 'welds_fab_total'),
                ('welds_onsite_to_date', 'welds_onsite_today', 'welds_onsite_total'),
                ('welds_tiein_to_date', 'welds_tiein_today', 'welds_tiein_total'),
                ('welds_test_to_date', 'welds_test_today', 'welds_test_total'),
            )
        }),
        ('X-Ray Tracking', {
            'fields': (
                ('xray_fab_to_date', 'xray_fab_today', 'xray_fab_total'),
                ('xray_onsite_to_date', 'xray_onsite_today', 'xray_onsite_total'),
                ('xray_tiein_to_date', 'xray_tiein_today', 'xray_tiein_total'),
                ('xray_test_to_date', 'xray_test_today', 'xray_test_total'),
            )
        }),
        ('Welds Rejected/Repaired', {
            'fields': (
                ('welds_rejected_fab_repaired', 'welds_rejected_fab_rejected', 'welds_rejected_fab_total'),
                ('welds_rejected_onsite_repaired', 'welds_rejected_onsite_rejected', 'welds_rejected_onsite_total'),
                ('welds_rejected_tiein_repaired', 'welds_rejected_tiein_rejected', 'welds_rejected_tiein_total'),
                ('welds_rejected_test_repaired', 'welds_rejected_test_rejected', 'welds_rejected_test_total'),
            )
        }),
        ('X-Ray Rejected/Repaired', {
            'fields': (
                ('xray_repair_fab_repaired', 'xray_repair_fab_rejected', 'xray_repair_fab_total'),
                ('xray_repair_onsite_repaired', 'xray_repair_onsite_rejected', 'xray_repair_onsite_total'),
                ('xray_repair_tiein_repaired', 'xray_repair_tiein_rejected', 'xray_repair_tiein_total'),
                ('xray_repair_test_repaired', 'xray_repair_test_rejected', 'xray_repair_test_total'),
            )
        }),
        ('Installations', {
            'fields': (
                ('pipe_installed_size', 'pipe_installed_footage', 'pipe_installed_from', 'pipe_installed_to'),
                ('road_xing_size', 'road_xing_footage', 'road_xing_bore'),
                ('stream_xings_size', 'stream_xings_footage', 'stream_xings_from', 'stream_xings_to'),
                ('taps_installed_size', 'taps_installed_no'),
                ('block_gates_size', 'block_gates_no'),
                ('cut_out1_size', 'cut_out1_defect'),
                ('cut_out2_size', 'cut_out2_defect'),
            )
        }),
        ('Signatures', {
            'fields': (
                ('welding_inspector_name', 'welding_inspector_signature'),
                ('contractor_signature', 'supervisor_signature'),
            )
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # If this is a new object
            obj.inspector = request.user
        super().save_model(request, obj, form, change)

@admin.register(WeldInspection)
class WeldInspectionAdmin(admin.ModelAdmin):
    list_display = ('weld_number', 'weld_type', 'position', 'joint_type', 'material_type', 'passed')
    list_filter = ('weld_type', 'position', 'passed', 'visual_inspection', 'ndt_performed')
    search_fields = ('weld_number', 'joint_type', 'material_type', 'defect_description', 'corrective_action')
    raw_id_fields = ('report',)
    inlines = [WeldPhotoInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('report', 'weld_number', 'weld_type', 'position', 'joint_type', 'material_type')
        }),
        ('Dimensions', {
            'fields': ('thickness', 'length')
        }),
        ('Temperature Readings', {
            'fields': ('preheat_temp', 'interpass_temp', 'post_weld_temp')
        }),
        ('Inspection Results', {
            'fields': ('visual_inspection', 'ndt_performed', 'ndt_method', 'ndt_results')
        }),
        ('Defects and Actions', {
            'fields': ('defects_found', 'defect_description', 'corrective_action')
        }),
        ('Final Status', {
            'fields': ('passed', 'notes')
        }),
    )

@admin.register(WeldPhoto)
class WeldPhotoAdmin(admin.ModelAdmin):
    list_display = ('inspection', 'description', 'uploaded_at')
    search_fields = ('description', 'inspection__weld_number')
    raw_id_fields = ('inspection',)
    fieldsets = (
        ('Photo Information', {
            'fields': ('inspection', 'image', 'description')
        }),
    )
