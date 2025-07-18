from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Contact, UserProfile
from django.db import transaction

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'role', 'discipline', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    phone_number = serializers.CharField(write_only=True, required=False)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'confirm_password', 'phone_number', 'profile']

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
                # Create default profile
                UserProfile.objects.create(user=user)
                return user
        except Exception as e:
            raise serializers.ValidationError({'detail': str(e)})

class UserDetailSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    contact = ContactSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'contact']
