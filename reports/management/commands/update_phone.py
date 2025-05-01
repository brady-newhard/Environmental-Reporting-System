from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from reports.models import Contact

class Command(BaseCommand):
    help = 'Updates phone number for an existing user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user to update')
        parser.add_argument('phone_number', type=str, help='New phone number')

    def handle(self, *args, **options):
        username = options['username']
        phone_number = options['phone_number']

        try:
            user = User.objects.get(username=username)
            contact, created = Contact.objects.get_or_create(user=user)
            contact.phone_number = phone_number
            contact.save()
            self.stdout.write(self.style.SUCCESS(f'Updated phone number for user {username} to {phone_number}'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'User {username} does not exist')) 