from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from users.models import UserProfile

class Command(BaseCommand):
    help = 'Assign a role to a user'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Username of the user')
        parser.add_argument('role', type=str, choices=['inspector', 'lead', 'admin'], help='Role to assign')
        parser.add_argument('--discipline', type=str, choices=['environmental', 'coating', 'welding', 'utility', 'all'], 
                          default='environmental', help='Discipline to assign (default: environmental)')

    def handle(self, *args, **options):
        username = options['username']
        role = options['role']
        discipline = options['discipline']

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f'User "{username}" does not exist')

        # Get or create UserProfile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update role and discipline
        profile.role = role
        profile.discipline = discipline
        profile.save()

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created profile for user "{username}" with role "{role}" and discipline "{discipline}"')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully updated user "{username}" to role "{role}" and discipline "{discipline}"')
            ) 