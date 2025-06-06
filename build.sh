#!/bin/bash

# Exit on error
set -e

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build complete!" 