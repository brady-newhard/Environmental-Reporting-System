#!/bin/bash

set -e

echo "Building React frontend..."
cd frontend
export VITE_API_URL=""
export NODE_ENV="production"
NODE_OPTIONS="--max-old-space-size=4096" npm run build
cd ..

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Staging build output for commit..."
git add -f staticfiles/

echo "Committing build output..."
git commit -m "Update build output for Heroku deploy" || echo "No changes to commit."

echo "Pushing to Heroku..."
git push heroku main

echo "Running collectstatic on Heroku..."
heroku run "python manage.py collectstatic --noinput"

echo "Restarting Heroku dyno..."
heroku ps:restart

echo "Deployment complete! 🚀" 