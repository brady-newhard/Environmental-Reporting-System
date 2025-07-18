from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from users.models import UserProfile

class Command(BaseCommand):
    help = 'List all users and their roles'

    def add_arguments(self, parser):
        parser.add_argument('--role', type=str, choices=['inspector', 'lead', 'admin'], 
                          help='Filter by role')
        parser.add_argument('--discipline', type=str, choices=['environmental', 'coating', 'welding', 'utility', 'all'], 
                          help='Filter by discipline')

    def handle(self, *args, **options):
        users = User.objects.all().order_by('username')
        
        if options['role']:
            users = users.filter(profile__role=options['role'])
        
        if options['discipline']:
            users = users.filter(profile__discipline=options['discipline'])

        self.stdout.write(self.style.SUCCESS(f'Found {users.count()} user(s):'))
        self.stdout.write('')

        for user in users:
            try:
                profile = user.profile
                role = profile.get_role_display()
                discipline = profile.get_discipline_display()
            except UserProfile.DoesNotExist:
                role = 'No role assigned'
                discipline = 'No discipline assigned'

            self.stdout.write(
                f'Username: {user.username:<15} | '
                f'Name: {user.get_full_name():<20} | '
                f'Role: {role:<10} | '
                f'Discipline: {discipline:<15} | '
                f'Active: {user.is_active}'
            ) 