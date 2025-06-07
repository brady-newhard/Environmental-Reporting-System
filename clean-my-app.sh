#!/bin/bash

echo "🧹 Cleaning up your project..."

# Delete common large folders
rm -rf node_modules dist build .next .venv

# Delete Python/Django caches
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type d -name ".pytest_cache" -exec rm -rf {} +

# Delete system junk
find . -type f -name ".DS_Store" -delete
find . -type f -name "*.log" -delete

echo "✅ Cleanup complete."

# Show largest remaining files
echo "🔍 Top 20 largest files remaining:"
find . -type f -exec du -h {} + | sort -hr | head -n 20
