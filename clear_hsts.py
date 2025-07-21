#!/usr/bin/env python3
"""
Script to help clear HSTS settings and test server configuration
"""

import requests
import sys
import os

def test_server(url):
    """Test if the server is accessible and check for redirects"""
    try:
        print(f"Testing {url}...")
        response = requests.get(url, allow_redirects=False, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Location Header: {response.headers.get('Location', 'None')}")
        print(f"Strict-Transport-Security: {response.headers.get('Strict-Transport-Security', 'None')}")
        return response.status_code == 200
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        return False

def main():
    print("=== Localhost HTTPS Issue Fixer ===\n")
    
    # Test URLs
    test_urls = [
        "http://localhost:8000",
        "http://localhost:8000/admin/",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8000/admin/"
    ]
    
    print("Testing server accessibility...")
    for url in test_urls:
        success = test_server(url)
        if success:
            print(f"✅ {url} - WORKING\n")
        else:
            print(f"❌ {url} - FAILED\n")
    
    print("\n=== Manual Steps Required ===")
    print("1. Clear your browser cache and cookies")
    print("2. Clear HSTS settings:")
    print("   - Chrome/Edge: Go to chrome://net-internals/#hsts")
    print("   - Delete domain security policies for: localhost, 127.0.0.1")
    print("3. Restart your browser")
    print("4. Try accessing http://localhost:8000/admin/")
    
    print("\n=== If Still Having Issues ===")
    print("- Use incognito/private mode")
    print("- Try a different browser")
    print("- Check if Django server is running on port 8000")
    print("- Make sure you're using http:// not https://")

if __name__ == "__main__":
    main() 