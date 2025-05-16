from rest_framework import serializers
from .models import DailyCoatingReport, CoatingInspection, CoatingPhoto, CoatingOversightItem

class CoatingPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoatingPhoto
        fields = ['id', 'image', 'description', 'uploaded_at']

class CoatingOversightItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoatingOversightItem
        fields = ['id', 'item_number', 'description', 'status', 'comments', 'created_at', 'updated_at']

class CoatingInspectionSerializer(serializers.ModelSerializer):
    photos = CoatingPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = CoatingInspection
        fields = [
            'id', 'surface_type', 'coating_type', 'surface_area', 'surface_preparation',
            'coating_thickness', 'temperature', 'humidity', 'visual_inspection',
            'adhesion_test', 'adhesion_test_results', 'defects_found', 'defect_description',
            'corrective_action', 'passed', 'notes', 'application_method',
            'application_time_begin', 'application_time_end', 'wft_mils', 'mix_number',
            'comp_a_batch', 'comp_b_batch', 'mix_time', 'act_induct_time', 'pot_life',
            'quantity_used', 'witnessed', 'backfill_used', 'rock_shield_used',
            'photos'
        ]

class DailyCoatingReportSerializer(serializers.ModelSerializer):
    inspections = CoatingInspectionSerializer(many=True, read_only=True)
    oversight_items = CoatingOversightItemSerializer(many=True, read_only=True)
    inspector_name = serializers.SerializerMethodField()

    class Meta:
        model = DailyCoatingReport
        fields = [
            'id', 'date', 'inspector', 'inspector_name', 'contractor', 'report_number',
            'oq_personnel', 'facility_id', 'purchase_order', 'location', 'qa_inspector',
            'weather_conditions', 'temperature', 'humidity', 'notes', 'finalized',
            'created_at', 'updated_at', 'inspections', 'oversight_items'
        ]
        read_only_fields = ['inspector', 'created_at', 'updated_at']

    def get_inspector_name(self, obj):
        return obj.inspector.get_full_name() or obj.inspector.username 