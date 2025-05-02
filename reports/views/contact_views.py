from rest_framework import viewsets, permissions
from ..models import Contact
from ..serializers import ContactSerializer

class ContactListView(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user) 