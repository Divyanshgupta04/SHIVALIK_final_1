#!/bin/bash
set -e

echo "🚨 EMERGENCY RESTART - Fixing backend..."

cd /var/www/shivalik/backend

# Step 1: Check what's running
echo ""
echo "📊 Current PM2 status:"
pm2 list || true

# Step 2: Kill anything on port 5000
echo ""
echo "🔍 Checking port 5000..."
PORT_PID=$(lsof -ti:5000 || true)
if [ -n "$PORT_PID" ]; then
    echo "🛑 Killing process $PORT_PID on port 5000..."
    kill -9 $PORT_PID
fi

# Step 3: Delete all PM2 processes
echo ""
echo "🧹 Cleaning PM2..."
pm2 delete all 2>/dev/null || true

# Step 4: Check if server.js has correct HTTPS settings
echo ""
echo "🔍 Checking server.js cookie settings..."
grep -A 5 "cookie: {" server.js || echo "Could not find cookie config"

# Step 5: Ensure .env is correct
echo ""
echo "📝 Setting up environment..."
if [ -f .env.production ]; then
    cp .env.production .env
    dos2unix .env 2>/dev/null || sed -i 's/\r$//' .env
    echo "✅ .env copied from .env.production"
else
    echo "❌ .env.production not found!"
fi

# Step 6: Start backend fresh
echo ""
echo "🚀 Starting backend..."
pm2 start server.js --name backend --update-env
pm2 save

# Step 7: Wait and check
echo ""
echo "⏳ Waiting 4 seconds for startup..."
sleep 4

echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📋 Last 30 lines of logs:"
pm2 logs backend --lines 30 --nostream || true

echo ""
echo "🧪 Testing backend locally:"
curl -s http://localhost:5000/ || echo "Backend not responding on localhost:5000"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ EMERGENCY RESTART COMPLETE!"
echo ""
echo "If backend still not working, check logs:"
echo "   pm2 logs backend --lines 50"
echo ""
echo "If you see 'secure: false' in the logs above, run:"
echo "   bash /var/www/shivalik/fix-https-backend.sh"
