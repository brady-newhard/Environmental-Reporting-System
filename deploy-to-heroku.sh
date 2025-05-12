#!/bin/bash

set -e

echo "Building React frontend..."
cd frontend
npm run build
cd ..

echo "Copying React build output to Django templates and staticfiles..."
cp frontend/build/index.html templates/index.html
cp -r frontend/build/static/. staticfiles/

echo "Staging build output for commit..."
git add templates/index.html staticfiles/

echo "Committing build output..."
git commit -m "Update React build output for Heroku deploy" || echo "No changes to commit."

echo "Pushing to Heroku..."
git push heroku main

echo "Running collectstatic on Heroku..."
heroku run "python manage.py collectstatic --noinput"

echo "Restarting Heroku dyno..."
heroku ps:restart

echo "Deployment complete! 🚀" 