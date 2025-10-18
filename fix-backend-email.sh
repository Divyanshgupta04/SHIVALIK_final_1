#!/bin/bash
set -e

echo "🔍 Diagnosing backend OTP/email error..."

cd /var/www/shivalik/backend

# Step 1: Check current PM2 logs for the actual error
echo ""
echo "📋 Last 50 lines of backend logs:"
pm2 logs backend --lines 50 --nostream || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Check if .env exists and what's in it (masked)
echo "📄 Checking .env file..."
if [ -f .env ]; then
    echo "✅ .env exists"
    echo "Environment variables present:"
    grep -E "^[A-Z_]+" .env | cut -d= -f1 | grep -E "(EMAIL|SMTP|GMAIL)" || echo "⚠️  No email variables found!"
else
    echo "❌ .env file missing!"
fi

echo ""
echo "📄 Checking .env.production..."
if [ -f .env.production ]; then
    echo "✅ .env.production exists"
    echo "Environment variables present:"
    grep -E "^[A-Z_]+" .env.production | cut -d= -f1 | grep -E "(EMAIL|SMTP|GMAIL)" || echo "⚠️  No email variables found!"
else
    echo "❌ .env.production file missing!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 FIXING CONFIG..."
echo ""

# Step 3: Copy .env.production to .env (this should have correct credentials)
echo "📝 Copying .env.production to .env..."
cp .env.production .env

# Step 4: Verify critical email variables are present
echo ""
echo "✅ Verifying email config..."
if grep -q "EMAIL_USER=" .env && grep -q "EMAIL_PASS=" .env; then
    echo "✅ Email credentials found in .env"
else
    echo "❌ Missing EMAIL_USER or EMAIL_PASS in .env!"
    echo "Please ensure .env.production has these variables set."
fi

# Step 5: Check for line ending issues (DOS to Unix)
echo ""
echo "🔄 Converting line endings to Unix format..."
dos2unix .env 2>/dev/null || sed -i 's/\r$//' .env

# Step 6: Restart backend with fresh environment
echo ""
echo "🔄 Restarting backend with updated config..."
pm2 restart backend --update-env

echo ""
echo "⏳ Waiting 3 seconds for backend to start..."
sleep 3

# Step 7: Check if backend is running
echo ""
pm2 list | grep backend

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ BACKEND CONFIG FIXED & RESTARTED"
echo ""
echo "📋 Now check the LATEST logs for any errors:"
echo "   pm2 logs backend --lines 20"
echo ""
echo "🧪 Test OTP signup again from your website"
echo ""
echo "⚠️  If still failing, the issue is likely:"
echo "   1. Gmail credentials are wrong in .env.production"
echo "   2. Gmail 'App Password' not generated/expired"
echo "   3. Gmail account has 2FA disabled (required for app passwords)"
echo ""
echo "To check exact error, run: pm2 logs backend"
