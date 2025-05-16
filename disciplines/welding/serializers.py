from rest_framework import serializers
from .models import DailyWeldReport, WeldInspection, WeldPhoto

class WeldPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeldPhoto
        fields = ['id', 'image', 'description', 'uploaded_at']

class WeldInspectionSerializer(serializers.ModelSerializer):
    photos = WeldPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = WeldInspection
        fields = [
            'id', 'weld_number', 'weld_type', 'position', 'joint_type', 
            'material_type', 'thickness', 'length', 'preheat_temp', 
            'interpass_temp', 'post_weld_temp', 'visual_inspection', 
            'ndt_performed', 'ndt_method', 'ndt_results', 'defects_found',
            'defect_description', 'corrective_action', 'passed', 'notes',
            'photos'
        ]

class DailyWeldReportSerializer(serializers.ModelSerializer):
    inspections = WeldInspectionSerializer(many=True, read_only=True)
    inspector_name = serializers.SerializerMethodField()

    class Meta:
        model = DailyWeldReport
        fields = [
            'id', 'date', 'inspector', 'inspector_name', 'project', 'contractor',
            'construction_wbs', 'retirement_wbs', 'activity', 'hours_worked',
            'welders_onsite', 'location', 'weather_conditions', 'temperature',
            'humidity', 'notes', 'created_at', 'updated_at', 'finalized',
            'welds_fab_to_date', 'welds_fab_today', 'welds_fab_total',
            'welds_onsite_to_date', 'welds_onsite_today', 'welds_onsite_total',
            'welds_tiein_to_date', 'welds_tiein_today', 'welds_tiein_total',
            'welds_test_to_date', 'welds_test_today', 'welds_test_total',
            'xray_fab_to_date', 'xray_fab_today', 'xray_fab_total',
            'xray_onsite_to_date', 'xray_onsite_today', 'xray_onsite_total',
            'xray_tiein_to_date', 'xray_tiein_today', 'xray_tiein_total',
            'xray_test_to_date', 'xray_test_today', 'xray_test_total',
            'welds_rejected_fab_repaired', 'welds_rejected_fab_rejected',
            'welds_rejected_fab_total', 'welds_rejected_onsite_repaired',
            'welds_rejected_onsite_rejected', 'welds_rejected_onsite_total',
            'welds_rejected_tiein_repaired', 'welds_rejected_tiein_rejected',
            'welds_rejected_tiein_total', 'welds_rejected_test_repaired',
            'welds_rejected_test_rejected', 'welds_rejected_test_total',
            'xray_repair_fab_repaired', 'xray_repair_fab_rejected',
            'xray_repair_fab_total', 'xray_repair_onsite_repaired',
            'xray_repair_onsite_rejected', 'xray_repair_onsite_total',
            'xray_repair_tiein_repaired', 'xray_repair_tiein_rejected',
            'xray_repair_tiein_total', 'xray_repair_test_repaired',
            'xray_repair_test_rejected', 'xray_repair_test_total',
            'pipe_installed_size', 'pipe_installed_footage', 'pipe_installed_from',
            'pipe_installed_to', 'road_xing_size', 'road_xing_footage',
            'road_xing_bore', 'stream_xings_size', 'stream_xings_footage',
            'stream_xings_from', 'stream_xings_to', 'taps_installed_size',
            'taps_installed_no', 'block_gates_size', 'block_gates_no',
            'cut_out1_size', 'cut_out1_defect', 'cut_out2_size', 'cut_out2_defect',
            'welding_inspector_name', 'welding_inspector_signature',
            'contractor_signature', 'supervisor_signature', 'inspections'
        ]
        read_only_fields = ['inspector', 'created_at', 'updated_at']

    def get_inspector_name(self, obj):
        return obj.inspector.get_full_name() or obj.inspector.username 