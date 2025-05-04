from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Contact
from ..serializers import ContactSerializer

class ContactListView(viewsets.ReadOnlyModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return all contacts, but only for authenticated users
        return Contact.objects.all().select_related('user') 