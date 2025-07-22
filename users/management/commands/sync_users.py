from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import json
import os

class Command(BaseCommand):
    help = 'Sync users between environments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--export',
            action='store_true',
            help='Export users to JSON file',
        )
        parser.add_argument(
            '--import',
            action='store_true',
            help='Import users from JSON file',
        )
        parser.add_argument(
            '--file',
            type=str,
            default='users_export.json',
            help='JSON file for export/import',
        )

    def handle(self, *args, **options):
        if options['export']:
            self.export_users(options['file'])
        elif options['import']:
            self.import_users(options['file'])
        else:
            self.stdout.write(
                self.style.ERROR('Please specify --export or --import')
            )

    def export_users(self, filename):
        """Export users to JSON file"""
        users = User.objects.all()
        user_data = []
        
        for user in users:
            user_data.append({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
            })
        
        with open(filename, 'w') as f:
            json.dump(user_data, f, indent=2)
        
        self.stdout.write(
            self.style.SUCCESS(f'Exported {len(user_data)} users to {filename}')
        )

    def import_users(self, filename):
        """Import users from JSON file"""
        if not os.path.exists(filename):
            self.stdout.write(
                self.style.ERROR(f'File {filename} not found')
            )
            return
        
        with open(filename, 'r') as f:
            user_data = json.load(f)
        
        created_count = 0
        updated_count = 0
        
        for user_info in user_data:
            username = user_info['username']
            
            if User.objects.filter(username=username).exists():
                # Update existing user
                user = User.objects.get(username=username)
                user.email = user_info['email']
                user.first_name = user_info['first_name']
                user.last_name = user_info['last_name']
                user.is_staff = user_info['is_staff']
                user.is_superuser = user_info['is_superuser']
                user.is_active = user_info['is_active']
                user.save()
                updated_count += 1
                self.stdout.write(f'Updated user: {username}')
            else:
                # Create new user (without password - will need to be set separately)
                user = User.objects.create_user(
                    username=username,
                    email=user_info['email'],
                    first_name=user_info['first_name'],
                    last_name=user_info['last_name'],
                    is_staff=user_info['is_staff'],
                    is_superuser=user_info['is_superuser'],
                    is_active=user_info['is_active'],
                )
                created_count += 1
                self.stdout.write(f'Created user: {username} (password needs to be set)')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Import complete: {created_count} created, {updated_count} updated'
            )
        ) 