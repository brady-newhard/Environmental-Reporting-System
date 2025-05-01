from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reports.models import Contact

class Command(BaseCommand):
    help = 'Creates contact entries for existing users'

    def handle(self, *args, **options):
        users = User.objects.all()
        for user in users:
            # Check if contact already exists
            contact, created = Contact.objects.get_or_create(
                user=user,
                defaults={'phone_number': ''}  # Default empty phone number
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created contact for user {user.username}'))
            else:
                self.stdout.write(self.style.WARNING(f'Contact already exists for user {user.username}')) 