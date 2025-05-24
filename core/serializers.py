from rest_framework import serializers
from django.contrib.auth.models import User
from users.models import Contact
from .models import Report, ReportDraft
from django.utils import timezone
from django.db import transaction

# ProgressChart serializers will be implemented here as part of the reports app

class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email')
    username = serializers.CharField(source='user.username')

    class Meta:
        model = Contact
        fields = ['id', 'full_name', 'username', 'email', 'phone_number', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_full_name(self, obj):
        if not obj.user:
            return ''
        full_name = obj.user.get_full_name()
        return full_name if full_name else obj.user.username

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'confirm_password', 'phone_number']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        if not data.get('phone_number') or not data['phone_number'].strip():
            raise serializers.ValidationError({"phone_number": "Phone number is required."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone_number = validated_data.pop('phone_number', '')
        try:
            with transaction.atomic():
                user = User.objects.create_user(**validated_data)
                Contact.objects.create(user=user, phone_number=phone_number)
                return user
        except Exception as e:
            raise serializers.ValidationError({'detail': str(e)})

class ReportSerializer(serializers.ModelSerializer):
    inspector = serializers.ReadOnlyField(source='inspector.username')
    author = serializers.ReadOnlyField(source='inspector.username')
    report_type = serializers.CharField(required=False, allow_blank=True)
    facility = serializers.CharField(required=False, allow_blank=True)
    route = serializers.CharField(required=False, allow_blank=True)
    spread = serializers.CharField(required=False, allow_blank=True)
    compliance_level = serializers.CharField(required=False, allow_blank=True)
    activity_category = serializers.CharField(required=False, allow_blank=True)
    activity_group = serializers.CharField(required=False, allow_blank=True)
    activity_type = serializers.CharField(required=False, allow_blank=True)
    milepost_start = serializers.CharField(required=False, allow_blank=True)
    milepost_end = serializers.CharField(required=False, allow_blank=True)
    station_start = serializers.CharField(required=False, allow_blank=True)
    station_end = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'inspector', 'author', 'date', 'location', 'weather_conditions', 
            'daily_activities', 'report_type', 'facility', 'route', 'spread', 
            'compliance_level', 'activity_category', 'activity_group', 'activity_type',
            'milepost_start', 'milepost_end', 'station_start', 'station_end',
            'created_at', 'updated_at',
            'finalized',
        ]
        read_only_fields = ['created_at', 'updated_at', 'finalized']

class ReportDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportDraft
        fields = ['id', 'user', 'report_type', 'data', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at'] 