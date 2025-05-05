from rest_framework import serializers
from .models import SWPPPReport, SWPPPItem, SWPPPPhoto

class SWPPPItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SWPPPItem
        fields = '__all__'

class SWPPPPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SWPPPPhoto
        fields = '__all__'

class SWPPPReportSerializer(serializers.ModelSerializer):
    items = SWPPPItemSerializer(many=True, read_only=True)
    photos = SWPPPPhotoSerializer(many=True, read_only=True)
    class Meta:
        model = SWPPPReport
        fields = '__all__' 