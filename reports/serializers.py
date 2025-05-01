from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Report, Contact

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
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(**validated_data)
        Contact.objects.create(user=user, phone_number=phone_number)
        return user

class ReportSerializer(serializers.ModelSerializer):
    inspector = serializers.ReadOnlyField(source='inspector.username')
    
    class Meta:
        model = Report
        fields = ['id', 'inspector', 'date', 'location', 'description', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at'] 