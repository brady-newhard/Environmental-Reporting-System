# Heroku Deployment Guide

## Prerequisites

1. Heroku CLI installed
2. Git repository set up
3. Heroku app created

## Environment Variables

Set these environment variables in your Heroku app:

```bash
heroku config:set SECRET_KEY="your-secret-key-here"
heroku config:set DEBUG="False"
heroku config:set VITE_API_URL=""
```

## Database Setup

1. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:mini
```

2. Run migrations:
```bash
heroku run python manage.py migrate
```

## Build Process

The build process is handled by `heroku.yml`:

1. Installs Python and Node.js dependencies
2. Builds the React frontend
3. Collects Django static files

## Deployment

### Option 1: Using the deployment script
```bash
./deploy-heroku.sh
```

### Option 2: Manual deployment
```bash
# Build frontend
cd frontend
export VITE_API_URL=""
export NODE_ENV="production"
NODE_OPTIONS="--max-old-space-size=4096" npm run build
cd ..

# Collect static files
python manage.py collectstatic --noinput

# Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## Static Files

Static files are served by WhiteNoise in production. The build process:
1. Builds React app to `frontend/dist/`
2. Copies build files to `staticfiles/`
3. Runs `collectstatic` to gather all Django static files

## Security

Production security settings are automatically applied when `DEBUG=False`:
- SSL redirect enabled
- Secure cookies enabled
- CSP headers configured
- CORS restricted to production domain

## Troubleshooting

### Build fails with memory error
- The build script uses `NODE_OPTIONS="--max-old-space-size=4096"` to increase memory
- If still failing, try increasing the value

### Static files not loading
- Check that `collectstatic` ran successfully
- Verify `STATIC_ROOT` is set correctly
- Check WhiteNoise configuration

### API calls failing
- Ensure `VITE_API_URL` is set to empty string in production
- Check CORS settings for production domain
- Verify CSRF settings

### Database connection issues
- Check `DATABASE_URL` is set correctly
- Ensure PostgreSQL addon is provisioned
- Run migrations if needed 