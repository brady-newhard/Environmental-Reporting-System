#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inspectionreports.settings')
django.setup()

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

def check_and_create_user():
    print("Checking database for users...")
    
    # Check existing users
    users = User.objects.all()
    print(f"Found {users.count()} users:")
    
    for user in users:
        print(f"- {user.username} ({user.email}) - {'Active' if user.is_active else 'Inactive'}")
    
    # Create a test user if none exist
    if users.count() == 0:
        print("\nNo users found. Creating test user...")
        
        # Create superuser
        admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            is_staff=True,
            is_superuser=True
        )
        print(f"Created admin user: {admin_user.username}")
        
        # Create regular user
        test_user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='test123',
            first_name='Test',
            last_name='User'
        )
        print(f"Created test user: {test_user.username}")
        
        print("\nTest credentials:")
        print("Admin: username=admin, password=admin123")
        print("User: username=testuser, password=test123")
    else:
        print("\nUsers already exist in database.")

if __name__ == '__main__':
    check_and_create_user() 