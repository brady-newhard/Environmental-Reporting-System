#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inspectionreports.settings')
django.setup()

from django.contrib.auth.models import User

def create_bob_yeo():
    try:
        # Check if user already exists
        if User.objects.filter(username='bob-yeo').exists():
            print("User 'bob-yeo' already exists")
            return
        
        # Create the user
        user = User.objects.create_user(
            username='bob-yeo',
            email='yeorobbie@yahoo.com',
            password='password123',
            first_name='Bob',
            last_name='Yeo'
        )
        print(f"Created user: {user.username}")
        print(f"Email: {user.email}")
        print(f"Password: password123")
        print(f"Full name: {user.first_name} {user.last_name}")
        
    except Exception as e:
        print(f"Error creating user: {e}")

if __name__ == '__main__':
    create_bob_yeo() 