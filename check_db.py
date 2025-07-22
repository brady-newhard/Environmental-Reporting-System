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
    
    # Create a test user for login testing
    test_username = 'testuser'
    if not User.objects.filter(username=test_username).exists():
        print(f"\nCreating test user: {test_username}")
        
        test_user = User.objects.create_user(
            username=test_username,
            email='test@example.com',
            password='test123',
            first_name='Test',
            last_name='User'
        )
        print(f"Created test user: {test_user.username}")
        print(f"Test credentials: username={test_username}, password=test123")
    else:
        print(f"\nTest user '{test_username}' already exists.")
        print(f"Test credentials: username={test_username}, password=test123")

if __name__ == '__main__':
    check_and_create_user() 