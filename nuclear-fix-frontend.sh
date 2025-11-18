#!/bin/bash
set -e

echo "🔥 NUCLEAR FIX - Fixing ALL localhost URLs and rebuilding frontend..."

DOMAIN="sshjk.in"
API_URL="http://$DOMAIN"

# Step 1: Fix .env.production
echo "📝 Updating .env.production..."
cat > /var/www/shivalik/frontend/.env.production << EOF
# Frontend Production Environment Variables
VITE_API_URL=$API_URL
EOF

# Step 2: Fix ALL hardcoded localhost URLs in source files
echo "🔧 Fixing hardcoded localhost URLs in source files..."

# Fix Hero.jsx
sed -i "s|http://localhost:5000/api/categories|${API_URL}/api/categories|g" /var/www/shivalik/frontend/src/Components/Hero.jsx

# Fix AdminCategories.jsx
sed -i "s|http://localhost:5000/api/categories|${API_URL}/api/categories|g" /var/www/shivalik/frontend/src/Components/Admin/AdminCategories.jsx

# Fix AdminProducts.jsx
sed -i "s|http://localhost:5000|${API_URL}|g" /var/www/shivalik/frontend/src/Components/Admin/AdminProducts.jsx

# Fix AdminOrders.jsx
sed -i "s|http://localhost:5000|${API_URL}|g" /var/www/shivalik/frontend/src/Components/Admin/AdminOrders.jsx

# Fix AdminDashboard.jsx
sed -i "s|http://localhost:5000|${API_URL}|g" /var/www/shivalik/frontend/src/Components/Admin/AdminDashboard.jsx

# Fix AdminUsers.jsx
sed -i "s|http://localhost:5000|${API_URL}|g" /var/www/shivalik/frontend/src/Components/Admin/AdminUsers.jsx

echo "✅ All hardcoded URLs replaced"

# Step 3: Nuclear clean and rebuild
echo "🧹 Deleting old build completely..."
cd /var/www/shivalik/frontend
rm -rf dist node_modules/.vite

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building with production environment..."
npm run build

echo "✅ Build complete! Checking dist..."
ls -lh dist/

echo ""
echo "🎉 NUCLEAR FIX COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Or open in incognito/private window"
echo "3. Check browser console - no more localhost errors!"
