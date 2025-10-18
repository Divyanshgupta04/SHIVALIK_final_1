#!/bin/bash
set -e

echo "🔧 Finalizing HTTPS setup..."

DOMAIN="sshjk.in"

# Step 1: Update frontend .env.production to use HTTPS
echo ""
echo "📝 Updating frontend environment to HTTPS..."
cat > /var/www/shivalik/frontend/.env.production << EOF
# Frontend Production Environment Variables
VITE_API_URL=https://$DOMAIN
EOF

# Step 2: Update backend cookie settings for HTTPS
echo ""
echo "🍪 Updating backend cookie settings for HTTPS..."
cd /var/www/shivalik/backend
sed -i 's/secure: false/secure: true/g' server.js
sed -i "s/sameSite: 'lax'/sameSite: 'strict'/g" server.js

# Step 3: Rebuild frontend with HTTPS URL
echo ""
echo "🏗️  Rebuilding frontend..."
cd /var/www/shivalik/frontend
rm -rf dist node_modules/.vite
npm install
npm run build

# Step 4: Restart backend
echo ""
echo "🔄 Restarting backend with HTTPS settings..."
cd /var/www/shivalik/backend
cp .env.production .env
pm2 restart backend --update-env

# Step 5: Restart nginx
echo ""
echo "🔄 Restarting nginx..."
systemctl restart nginx

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ HTTPS SETUP FINALIZED!"
echo ""
echo "🌐 Your website is now fully HTTPS:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo ""
echo "📱 Mobile browsers will now work perfectly!"
echo ""
echo "🧪 TEST NOW:"
echo "1. Open https://sshjk.in on your phone"
echo "2. Try login with OTP"
echo "3. Try adding products to cart"
echo ""
echo "🔒 All cookies are now secure and will work on mobile"
