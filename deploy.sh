#!/bin/bash

# Shivalik Service Hub - Quick Deployment Script
# Run this on your VPS after cloning the repository

echo "==================================="
echo "Shivalik Service Hub Deployment"
echo "VPS IP: 72.61.131.104"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root (use sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Installing system dependencies...${NC}"
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx git

echo -e "${GREEN}✓ System dependencies installed${NC}"

echo -e "${YELLOW}Step 2: Installing PM2...${NC}"
npm install -g pm2
echo -e "${GREEN}✓ PM2 installed${NC}"

echo -e "${YELLOW}Step 3: Setting up backend...${NC}"
cd backend
cp .env.production .env

# Generate secrets
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Replace secrets in .env file
sed -i "s/JWT_SECRET=CHANGE_THIS_TO_A_RANDOM_STRING_USE_CRYPTO/JWT_SECRET=$JWT_SECRET/" .env
sed -i "s/SESSION_SECRET=CHANGE_THIS_TO_A_RANDOM_STRING_USE_CRYPTO/SESSION_SECRET=$SESSION_SECRET/" .env

npm install --production
echo -e "${GREEN}✓ Backend configured${NC}"

echo -e "${YELLOW}Step 4: Building frontend...${NC}"
cd ../frontend
npm install
npm run build
echo -e "${GREEN}✓ Frontend built${NC}"

echo -e "${YELLOW}Step 5: Configuring Nginx...${NC}"
cd ..
cp nginx.conf /etc/nginx/sites-available/shivalik
ln -sf /etc/nginx/sites-available/shivalik /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx configured${NC}"
else
    echo -e "${RED}✗ Nginx configuration error${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 6: Creating logs directory...${NC}"
mkdir -p logs

echo -e "${YELLOW}Step 7: Starting backend with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ Backend started${NC}"

echo -e "${YELLOW}Step 8: Configuring firewall...${NC}"
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo -e "${GREEN}✓ Firewall configured${NC}"

echo ""
echo -e "${GREEN}==================================="
echo "Deployment Complete! 🎉"
echo "===================================${NC}"
echo ""
echo "Your website is now live at:"
echo -e "${GREEN}http://72.61.131.104${NC}"
echo ""
echo "Useful commands:"
echo "  pm2 status           - Check backend status"
echo "  pm2 logs             - View logs"
echo "  pm2 restart all      - Restart backend"
echo "  systemctl status nginx - Check nginx status"
echo ""
echo "Next steps:"
echo "1. Visit http://72.61.131.104 to see your website"
echo "2. Check MongoDB Atlas whitelist includes: 72.61.131.104"
echo "3. Consider setting up SSL with: certbot --nginx"
echo ""
