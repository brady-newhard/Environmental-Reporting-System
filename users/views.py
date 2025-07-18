from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Contact, UserProfile
from .serializers import ContactSerializer, UserProfileSerializer, UserDetailSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=user, role='inspector')
        
        # If user is admin, show all profiles
        if profile.role == 'admin':
            return UserProfile.objects.all()
        # Otherwise, show only their own profile
        else:
            return UserProfile.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = UserProfile.objects.create(user=request.user, role='inspector')
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leads(self, request):
        """Get all leads"""
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            return Response({'error': 'User profile not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if profile.role not in ['admin', 'lead']:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        leads = UserProfile.objects.filter(role='lead').select_related('user')
        lead_data = []
        
        for lead_profile in leads:
            lead_data.append({
                'id': lead_profile.user.id,
                'name': lead_profile.user.get_full_name(),
                'username': lead_profile.user.username,
                'email': lead_profile.user.email,
                'discipline': lead_profile.discipline,
                'discipline_display': lead_profile.get_discipline_display(),
            })
        
        return Response(lead_data)
