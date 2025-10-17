#!/bin/bash

# Comprehensive script to replace ALL localhost:5000 URLs in frontend
# This uses sed to do a global find-and-replace

echo "==========================================="
echo "Fixing ALL localhost URLs in frontend..."
echo "==========================================="

cd /var/www/shivalik/frontend/src

# Find all JS/JSX files and replace localhost:5000 with the VPS IP
find . -type f \( -name "*.js" -o -name "*.jsx" \) -print0 | while IFS= read -r -d '' file; do
    # Replace all variations of localhost:5000
    sed -i 's|http://localhost:5000|http://72.61.131.104|g' "$file"
    sed -i "s|'http://localhost:5000'|'http://72.61.131.104'|g" "$file"
    sed -i 's|"http://localhost:5000"|"http://72.61.131.104"|g' "$file"
    sed -i 's|localhost:5000|72.61.131.104|g' "$file"
done

echo ""
echo "✓ Replaced all localhost:5000 with 72.61.131.104"
echo ""
echo "Now rebuilding frontend..."
cd /var/www/shivalik/frontend
npm run build

echo ""
echo "✓ Frontend rebuilt successfully!"
echo ""
echo "Reloading nginx..."
sudo systemctl reload nginx

echo ""
echo "✓ Done! Your website should now work at http://72.61.131.104"
echo ""
