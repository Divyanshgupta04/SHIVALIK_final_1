#!/bin/bash

# Complete Domain Fix
# This script does EVERYTHING needed to make sshjk.in work

echo "================================================"
echo "Complete Fix for sshjk.in Domain"
echo "================================================"

cd /var/www/shivalik

echo "Step 1: Updating Nginx to serve from domain..."
sudo cp nginx.conf /etc/nginx/sites-available/shivalik
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx updated"
echo ""

echo "Step 2: Setting up backend environment..."
cd backend
cp .env.production .env

# Preserve existing secrets if they exist
JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d'=' -f2-)
SESSION_SECRET=$(grep "^SESSION_SECRET=" .env | cut -d'=' -f2-)

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" == "CHANGE_THIS_TO_A_RANDOM_STRING_USE_CRYPTO" ]; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
fi

if [ -z "$SESSION_SECRET" ] || [ "$SESSION_SECRET" == "CHANGE_THIS_TO_A_RANDOM_STRING_USE_CRYPTO" ]; then
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s|SESSION_SECRET=.*|SESSION_SECRET=$SESSION_SECRET|" .env
fi

# Ensure domain is correct
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=http://sshjk.in|" .env

echo "✓ Backend environment configured"
echo ""

echo "Step 3: Restarting backend..."
cd /var/www/shivalik
pm2 restart shivalik-backend
sleep 3
echo "✓ Backend restarted"
echo ""

echo "Step 4: Setting frontend API URL..."
cd frontend

# Create .env.production
cat > .env.production << 'EOF'
VITE_API_URL=http://sshjk.in
EOF

echo "Frontend .env.production:"
cat .env.production
echo ""

echo "Step 5: Cleaning and rebuilding frontend..."
# Clean previous build
rm -rf dist
rm -rf node_modules/.vite

# Rebuild
npm run build

if [ $? -ne 0 ]; then
    echo "✗ Build failed!"
    exit 1
fi

echo "✓ Frontend rebuilt"
echo ""

echo "Step 6: Testing backend..."
sleep 2

BACKEND_TEST=$(curl -s http://localhost:5000/)
if [ ! -z "$BACKEND_TEST" ]; then
    echo "✓ Backend responding"
else
    echo "✗ Backend not responding"
fi

CATEGORIES_TEST=$(curl -s http://localhost:5000/api/categories)
if [ ! -z "$CATEGORIES_TEST" ]; then
    echo "✓ Categories API working"
else
    echo "✗ Categories API failed"
fi

echo ""
echo "================================================"
echo "Complete Fix Done!"
echo "================================================"
echo ""
echo "NOW:"
echo "1. Clear your browser cache completely (Ctrl+Shift+Delete)"
echo "2. Or use Incognito mode"
echo "3. Visit: http://sshjk.in"
echo ""
echo "Categories and products should now load!"
echo ""
