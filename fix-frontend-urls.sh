#!/bin/bash

# Script to replace all localhost URLs with config import in frontend files
# Run this on your VPS after cloning

echo "Fixing frontend API URLs..."

cd /var/www/shivalik/frontend/src

# Find all .jsx and .js files and replace localhost URLs
find . -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i "s|'http://localhost:5000|import config from '../config/api'; config.apiUrl|g" {} \;
find . -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|"http://localhost:5000|import config from "../config/api"; config.apiUrl|g' {} \;
find . -type f \( -name "*.jsx" -o -name "*.js" \) -exec sed -i 's|http://localhost:5000|${config.apiUrl}|g' {} \;

echo "✓ Fixed all localhost URLs"
echo "Now rebuild frontend with: npm run build"
