from rest_framework import serializers
from django.utils import timezone
from .models import PunchlistItem

class PunchlistItemSerializer(serializers.ModelSerializer):
    inspector_signoff = serializers.CharField(source='inspector_signoff.username', read_only=True)
    completed_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = PunchlistItem
        fields = [
            'id', 'item_number', 'spread', 'inspector', 'start_station', 
            'end_station', 'feature', 'issue', 'recommendations',
            'completed', 'inspector_signoff', 'completed_date'
        ]
        read_only_fields = ['inspector_signoff', 'completed_date']

    def update(self, instance, validated_data):
        if validated_data.get('completed') and not instance.completed:
            instance.completed_date = timezone.now()
            instance.inspector_signoff = self.context['request'].user
        return super().update(instance, validated_data) 