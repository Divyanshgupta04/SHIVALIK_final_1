#!/bin/bash
set -e

echo "🔐 Installing SSL certificates for sshjk.in..."

# Step 1: Stop nginx
echo ""
echo "🛑 Stopping nginx..."
systemctl stop nginx

# Step 2: Install certbot if needed
echo ""
echo "📦 Ensuring certbot is installed..."
apt-get update
apt-get install -y certbot

# Step 3: Get SSL certificate
echo ""
echo "🔒 Obtaining SSL certificate..."
certbot certonly --standalone \
  -d sshjk.in \
  -d www.sshjk.in \
  --non-interactive \
  --agree-tos \
  --email sshubjk@gmail.com \
  --preferred-challenges http

# Step 4: Verify certificates
echo ""
echo "✅ Checking certificates..."
ls -la /etc/letsencrypt/live/sshjk.in/

# Step 5: Start nginx
echo ""
echo "🚀 Starting nginx..."
systemctl start nginx

# Step 6: Enable auto-renewal
echo ""
echo "⏰ Enabling auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SSL CERTIFICATES INSTALLED!"
echo ""
echo "📜 Certificate files:"
ls -1 /etc/letsencrypt/live/sshjk.in/
echo ""
echo "🌐 Your site is now accessible at:"
echo "   https://sshjk.in"
echo "   https://www.sshjk.in"
echo ""
echo "📱 Test now on desktop and mobile!"
