#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR"
DJANGO_DIR="$SCRIPT_DIR/../backend"

echo "=== Building unified frontend ==="
cd "$FRONTEND_DIR"
npm run build

echo "=== Deploying build to Django ==="
rm -rf "$DJANGO_DIR/build"
cp -r "$FRONTEND_DIR/build" "$DJANGO_DIR/build"

echo "=== Collecting static files ==="
cd "$DJANGO_DIR"
python manage.py collectstatic --noinput

echo "=== Deployment complete ==="
echo "Run 'python manage.py runserver' in the Django project to start the server."
