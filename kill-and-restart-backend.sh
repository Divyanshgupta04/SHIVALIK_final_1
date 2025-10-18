#!/bin/bash
set -e

echo "🔍 Finding process on port 5000..."

# Find and kill process on port 5000
PORT_PID=$(lsof -ti:5000 || true)

if [ -n "$PORT_PID" ]; then
    echo "🛑 Killing process $PORT_PID on port 5000..."
    kill -9 $PORT_PID
    echo "✅ Process killed"
else
    echo "✅ No process found on port 5000"
fi

# Also delete any PM2 backend processes
echo ""
echo "🛑 Cleaning up PM2 processes..."
pm2 delete all 2>/dev/null || echo "No PM2 processes to delete"

# Wait a moment
echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

# Now start backend fresh
echo ""
echo "🚀 Starting backend fresh..."
cd /var/www/shivalik/backend

# Copy env
cp .env.production .env
dos2unix .env 2>/dev/null || sed -i 's/\r$//' .env

# Start with PM2
pm2 start server.js --name backend --update-env
pm2 save

echo ""
echo "⏳ Waiting 3 seconds for startup..."
sleep 3

echo ""
echo "📊 PM2 Status:"
pm2 list

echo ""
echo "📋 Backend logs:"
pm2 logs backend --lines 15 --nostream

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ BACKEND RESTARTED!"
echo ""
echo "🧪 Test OTP signup at: http://sshjk.in"
echo ""
echo "If OTP still fails with 500 error, run this to see the exact error:"
echo "   pm2 logs backend --lines 50"
