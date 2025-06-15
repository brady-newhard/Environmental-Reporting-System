from rest_framework import serializers
from .models import ReportDraft

class ReportDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportDraft
        fields = ['id', 'user', 'report_type', 'data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at'] 