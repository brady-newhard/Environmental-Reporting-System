#!/bin/bash

# Exit on error
set -e

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Copying frontend build files..."
mkdir -p staticfiles
cp -r frontend/dist/* staticfiles/
cp frontend/public/static/* staticfiles/

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!" 