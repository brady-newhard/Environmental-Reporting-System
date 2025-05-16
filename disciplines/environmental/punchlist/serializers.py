# Remove incorrect imports
# If you need SWPPP serializers, import them from their correct location:
# from disciplines.environmental.swppp.serializers import SWPPPReportSerializer, SWPPPItemSerializer, SWPPPPhotoSerializer

from rest_framework import serializers
from .models import PunchlistReport, PunchlistItem

class PunchlistReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = PunchlistReport
        fields = '__all__'

class PunchlistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PunchlistItem
        fields = '__all__'

__all__ = [
    'PunchlistReportSerializer',
    'PunchlistItemSerializer',
] 