#!/usr/bin/env python
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inspectionreports.settings')
django.setup()

from django.contrib.auth.models import User

def list_users():
    print("Users in database:")
    users = User.objects.all()
    for user in users:
        print(f"- {user.username} ({user.email}) - Active: {user.is_active}")

def reset_password(username, new_password):
    try:
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        print(f"Password reset successfully for user: {username}")
        print(f"New password: {new_password}")
    except User.DoesNotExist:
        print(f"User '{username}' not found")
    except Exception as e:
        print(f"Error resetting password: {e}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'list':
            list_users()
        elif sys.argv[1] == 'reset' and len(sys.argv) >= 4:
            username = sys.argv[2]
            new_password = sys.argv[3]
            reset_password(username, new_password)
        else:
            print("Usage:")
            print("  python reset_password.py list")
            print("  python reset_password.py reset <username> <new_password>")
    else:
        list_users() 