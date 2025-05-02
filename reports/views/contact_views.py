from rest_framework import generics, permissions
from ..models import Contact
from ..serializers import ContactSerializer

class ContactListView(generics.ListAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user) 