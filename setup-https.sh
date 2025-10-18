#!/bin/bash
set -e

echo "🔒 Setting up HTTPS for sshjk.in..."

DOMAIN="sshjk.in"
EMAIL="sshubjk@gmail.com"

# Step 1: Install certbot
echo ""
echo "📦 Installing Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Step 2: Stop nginx temporarily
echo ""
echo "🛑 Stopping nginx temporarily..."
systemctl stop nginx

# Step 3: Get SSL certificate
echo ""
echo "🔐 Obtaining SSL certificate for $DOMAIN and www.$DOMAIN..."
certbot certonly --standalone \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --preferred-challenges http

# Step 4: Update nginx config for HTTPS
echo ""
echo "📝 Updating nginx configuration for HTTPS..."
cat > /etc/nginx/sites-available/default << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name sshjk.in www.sshjk.in;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name sshjk.in www.sshjk.in;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/sshjk.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sshjk.in/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

    # Frontend
    location / {
        root /var/www/shivalik/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Step 5: Test nginx config
echo ""
echo "🧪 Testing nginx configuration..."
nginx -t

# Step 6: Start nginx
echo ""
echo "🚀 Starting nginx..."
systemctl start nginx

# Step 7: Setup auto-renewal
echo ""
echo "⏰ Setting up SSL certificate auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ HTTPS SETUP COMPLETE!"
echo ""
echo "🌐 Your site is now accessible at:"
echo "   https://sshjk.in"
echo "   https://www.sshjk.in"
echo ""
echo "📱 Mobile browsers will now work correctly!"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Update frontend .env.production to use HTTPS"
echo "2. Update backend server.js cookie secure flag to true"
echo "3. Rebuild frontend"
echo "4. Restart backend"
echo ""
echo "Run this command to complete the setup:"
echo "   bash /var/www/shivalik/finalize-https.sh"
