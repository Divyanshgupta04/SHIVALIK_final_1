#!/bin/bash

# Update Frontend for Domain
# Sets correct API URL and rebuilds

echo "================================================"
echo "Updating Frontend for sshjk.in"
echo "================================================"

cd /var/www/shivalik/frontend

echo "Step 1: Setting API URL..."
cat > .env.production << 'EOF'
VITE_API_URL=http://sshjk.in
EOF

cat .env.production
echo ""

echo "Step 2: Rebuilding frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Frontend rebuilt successfully!"
    echo ""
    echo "Your website at http://sshjk.in should now show products!"
else
    echo ""
    echo "✗ Build failed"
    exit 1
fi
