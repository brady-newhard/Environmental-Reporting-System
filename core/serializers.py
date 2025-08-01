from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from users.models import Contact, UserProfile
from .models import ReportApproval

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

class ReportApprovalSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    assigned_lead_name = serializers.CharField(source='assigned_lead.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    discipline_display = serializers.CharField(source='get_discipline_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ReportApproval
        fields = [
            'id', 'report_type', 'report_id', 'discipline', 'discipline_display',
            'report_data', 'status', 'status_display', 'submitted_by', 'submitted_by_name',
            'assigned_lead', 'assigned_lead_name', 'reviewed_by', 'reviewed_by_name',
            'rejection_reason', 'review_notes', 'submitted_at', 'assigned_at', 
            'reviewed_at', 'updated_at'
        ]
        read_only_fields = ['submitted_by', 'submitted_at', 'assigned_at', 'reviewed_at', 'updated_at']

class ReportApprovalListSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.CharField(source='submitted_by.get_full_name', read_only=True)
    assigned_lead_name = serializers.CharField(source='assigned_lead.get_full_name', read_only=True)
    discipline_display = serializers.CharField(source='get_discipline_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ReportApproval
        fields = [
            'id', 'report_type', 'report_id', 'discipline', 'discipline_display',
            'report_data', 'status', 'status_display', 'submitted_by_name', 'assigned_lead_name',
            'submitted_at', 'updated_at'
        ] 