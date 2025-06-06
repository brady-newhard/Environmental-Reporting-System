#!/bin/bash

# Exit on error
set -e

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Setting up static files..."
# Create staticfiles directory if it doesn't exist
mkdir -p staticfiles

# Copy frontend build files to staticfiles
echo "Copying frontend build files..."
cp -r frontend/dist/* staticfiles/

# Copy manifest and other static files
echo "Copying manifest and static files..."
cp frontend/public/manifest.json staticfiles/
cp frontend/public/static/* staticfiles/

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!" 