#!/bin/bash
set -e

echo "🔒 Enabling HTTPS mode on backend..."

cd /var/www/shivalik/backend

# Step 1: Update server.js cookie settings for HTTPS
echo ""
echo "📝 Updating server.js for HTTPS..."
sed -i 's/secure: false, \/\/ Set to false since using HTTP (set to true when using HTTPS)/secure: true, \/\/ HTTPS enabled/g' server.js
sed -i "s/sameSite: 'lax' \/\/ Use 'lax' for HTTP, 'strict' for HTTPS/sameSite: 'strict' \/\/ HTTPS strict mode/g" server.js

# Step 2: Verify changes
echo ""
echo "✅ New cookie settings:"
grep -A 5 "cookie: {" server.js

# Step 3: Restart backend
echo ""
echo "🔄 Restarting backend..."
pm2 restart backend --update-env

# Step 4: Check nginx is running
echo ""
echo "🔍 Checking nginx status..."
systemctl status nginx --no-pager | head -10

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3

echo ""
echo "📋 Backend logs:"
pm2 logs backend --lines 20 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ HTTPS MODE ENABLED ON BACKEND!"
echo ""
echo "🧪 Test now:"
echo "1. Open https://sshjk.in (with https://)"
echo "2. Hard refresh (Ctrl+Shift+R)"
echo "3. Try login with OTP"
echo ""
echo "⚠️  If still not working, check:"
echo "   - Is nginx running? systemctl status nginx"
echo "   - Are SSL certs installed? ls -la /etc/letsencrypt/live/sshjk.in/"
