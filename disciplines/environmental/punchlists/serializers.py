from rest_framework import serializers
from django.utils import timezone
from .models import PunchlistItem, PunchlistReport

class PunchlistReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PunchlistReport
        fields = ['id', 'title', 'author', 'date', 'created_at', 'updated_at', 'finalized']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at', 'finalized']

class PunchlistItemSerializer(serializers.ModelSerializer):
    inspector_signoff = serializers.CharField(source='inspector_signoff.username', read_only=True)
    completed_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    punchlist_report = serializers.PrimaryKeyRelatedField(queryset=PunchlistReport.objects.all(), write_only=True, required=False)

    class Meta:
        model = PunchlistItem
        fields = [
            'id', 'item_number', 'spread', 'inspector', 'start_station', 
            'end_station', 'feature', 'issue', 'recommendations',
            'completed', 'inspector_signoff', 'completed_date', 'punchlist_report'
        ]
        read_only_fields = ['inspector_signoff', 'completed_date']
        extra_kwargs = {'punchlist_report': {'write_only': True}}

    def update(self, instance, validated_data):
        if validated_data.get('completed') and not instance.completed:
            instance.completed_date = timezone.now()
            instance.inspector_signoff = self.context['request'].user
        return super().update(instance, validated_data) 