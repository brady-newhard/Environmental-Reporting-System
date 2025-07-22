from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a new user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username')
        parser.add_argument('email', type=str, help='Email')
        parser.add_argument('password', type=str, help='Password')
        parser.add_argument('--first-name', type=str, default='', help='First name')
        parser.add_argument('--last-name', type=str, default='', help='Last name')
        parser.add_argument('--staff', action='store_true', help='Make user staff')
        parser.add_argument('--superuser', action='store_true', help='Make user superuser')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        first_name = options['first_name']
        last_name = options['last_name']
        is_staff = options['staff']
        is_superuser = options['superuser']

        # Check if user already exists
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists')
            )
            return

        # Create the user
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_staff=is_staff,
                is_superuser=is_superuser
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully created user "{username}"\n'
                    f'Email: {email}\n'
                    f'Full name: {first_name} {last_name}\n'
                    f'Staff: {is_staff}\n'
                    f'Superuser: {is_superuser}'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating user: {e}')
            ) 