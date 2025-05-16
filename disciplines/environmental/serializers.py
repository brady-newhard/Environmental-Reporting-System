from rest_framework import serializers
from .models import ProgressChart

class ProgressChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressChart
        fields = '__all__' 