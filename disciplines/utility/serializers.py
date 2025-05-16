from rest_framework import serializers
from .models import DailyUtilityReport, UtilityInspection, UtilityPhoto

class UtilityPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UtilityPhoto
        fields = ['id', 'image', 'description', 'uploaded_at']

class UtilityInspectionSerializer(serializers.ModelSerializer):
    photos = UtilityPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = UtilityInspection
        fields = [
            'id', 'utility_type', 'location', 'description', 'status',
            'issues_found', 'issue_description', 'corrective_action',
            'completed', 'notes', 'photos'
        ]

class DailyUtilityReportSerializer(serializers.ModelSerializer):
    inspections = UtilityInspectionSerializer(many=True, read_only=True)
    inspector_name = serializers.SerializerMethodField()

    class Meta:
        model = DailyUtilityReport
        fields = [
            'id', 'date', 'inspector', 'inspector_name', 'contractor',
            'location', 'weather_conditions', 'temperature', 'humidity',
            'notes', 'finalized', 'created_at', 'updated_at', 'inspections'
        ]
        read_only_fields = ['inspector', 'created_at', 'updated_at']

    def get_inspector_name(self, obj):
        return obj.inspector.get_full_name() or obj.inspector.username 