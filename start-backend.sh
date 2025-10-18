#!/bin/bash
set -e

echo "🚀 Starting backend properly..."

cd /var/www/shivalik/backend

# Step 1: Ensure .env exists
echo "📝 Setting up environment..."
if [ -f .env.production ]; then
    cp .env.production .env
    echo "✅ Copied .env.production to .env"
else
    echo "❌ .env.production not found!"
    exit 1
fi

# Fix line endings
dos2unix .env 2>/dev/null || sed -i 's/\r$//' .env

# Step 2: Check if backend is already running
echo ""
echo "🔍 Checking current PM2 processes..."
pm2 list

# Step 3: Stop old backend if exists
echo ""
echo "🛑 Stopping any old backend processes..."
pm2 delete backend 2>/dev/null || echo "No old backend process to delete"

# Step 4: Install dependencies if needed
echo ""
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Step 5: Start backend with PM2
echo ""
echo "🚀 Starting backend with PM2..."
pm2 start server.js --name backend --update-env

# Step 6: Save PM2 config
pm2 save

# Step 7: Wait and check status
echo ""
echo "⏳ Waiting 3 seconds for backend to start..."
sleep 3

echo ""
echo "📊 Backend status:"
pm2 list

echo ""
echo "📋 Recent logs:"
pm2 logs backend --lines 20 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKEND STARTED!"
echo ""
echo "🧪 Test your OTP signup now at: http://sshjk.in"
echo ""
echo "📋 To monitor logs: pm2 logs backend"
echo "📊 To check status: pm2 status"
