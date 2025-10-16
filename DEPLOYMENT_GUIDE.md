# Shivalik Service Hub - VPS Deployment Guide

## Prerequisites
- VPS with Ubuntu 20.04+ (or similar Linux distribution)
- Domain name or VPS IP address
- Root or sudo access to VPS

## What You Need to Provide
Before deploying, you need:
1. **Your VPS IP address or domain** (e.g., `123.45.67.89` or `yourdomain.com`)
2. **MongoDB Atlas Connection String** (Already have: `mongodb+srv://sonugupta25795_db_user:...`)

---

## Step 1: Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
# Or if you have a user account:
ssh username@YOUR_VPS_IP
```

---

## Step 2: Install Required Software

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally (process manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

---

## Step 3: Clone Your Repository

```bash
# Create directory for the application
sudo mkdir -p /var/www/shivalik
cd /var/www/shivalik

# Clone your repository
sudo git clone https://github.com/Divyanshgupta04/SHIVALIK_final_1.git .

# Set permissions
sudo chown -R $USER:$USER /var/www/shivalik
```

---

## Step 4: Configure Backend

```bash
cd /var/www/shivalik/backend

# Copy production environment file
cp .env.production .env

# Generate secure JWT and Session secrets
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('SESSION_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Edit .env file with generated secrets and your domain
nano .env
```

**Update these values in `.env`:**
```env
FRONTEND_URL=http://YOUR_DOMAIN_OR_IP
JWT_SECRET=<paste_generated_jwt_secret>
SESSION_SECRET=<paste_generated_session_secret>
```

Save and exit (Ctrl+X, then Y, then Enter)

```bash
# Install backend dependencies
npm install --production
```

---

## Step 5: Configure and Build Frontend

```bash
cd /var/www/shivalik/frontend

# Create production environment file
echo "VITE_API_URL=http://YOUR_DOMAIN_OR_IP" > .env.production

# Or if you're using a domain:
# echo "VITE_API_URL=http://yourdomain.com" > .env.production

# Install dependencies
npm install

# Build for production
npm run build
```

---

## Step 6: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/shivalik/nginx.conf /etc/nginx/sites-available/shivalik

# Edit the configuration to add your domain/IP
sudo nano /etc/nginx/sites-available/shivalik
```

**Replace `YOUR_DOMAIN_OR_IP` with your actual domain or IP address**

```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/shivalik /etc/nginx/sites-enabled/

# Remove default nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# If test is successful, reload nginx
sudo systemctl reload nginx

# Enable nginx to start on boot
sudo systemctl enable nginx
```

---

## Step 7: Start Backend with PM2

```bash
cd /var/www/shivalik

# Create logs directory
mkdir -p logs

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs (usually starts with 'sudo')

# Check application status
pm2 status
pm2 logs shivalik-backend
```

---

## Step 8: Configure Firewall

```bash
# Allow SSH (important - don't lock yourself out!)
sudo ufw allow ssh

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS (for future SSL setup)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

## Step 9: Test Your Deployment

Visit your website:
- Frontend: `http://YOUR_DOMAIN_OR_IP`
- Backend API: `http://YOUR_DOMAIN_OR_IP/api`

---

## Step 10 (Optional): Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Follow the prompts
# Certbot will automatically configure nginx for HTTPS

# Update backend .env to use HTTPS
nano /var/www/shivalik/backend/.env
# Change FRONTEND_URL to: https://yourdomain.com

# Update frontend .env.production
nano /var/www/shivalik/frontend/.env.production
# Change VITE_API_URL to: https://yourdomain.com

# Rebuild frontend
cd /var/www/shivalik/frontend
npm run build

# Restart backend
pm2 restart shivalik-backend
```

---

## Useful PM2 Commands

```bash
# View logs
pm2 logs shivalik-backend

# Restart application
pm2 restart shivalik-backend

# Stop application
pm2 stop shivalik-backend

# Monitor resources
pm2 monit

# Delete application from PM2
pm2 delete shivalik-backend
```

---

## Updating Your Application

```bash
cd /var/www/shivalik

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart shivalik-backend

# Update and rebuild frontend
cd ../frontend
npm install
npm run build

# Reload nginx
sudo systemctl reload nginx
```

---

## Troubleshooting

### Check if backend is running:
```bash
pm2 status
pm2 logs shivalik-backend
curl http://localhost:5000/api
```

### Check nginx status:
```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Check if ports are listening:
```bash
sudo netstat -tlnp | grep :5000
sudo netstat -tlnp | grep :80
```

### MongoDB Connection Issues:
- Ensure MongoDB Atlas IP whitelist includes your VPS IP (or use 0.0.0.0/0 for all IPs)
- Check .env file has correct MongoDB URI

### Frontend not showing:
```bash
# Check if dist folder exists
ls -la /var/www/shivalik/frontend/dist

# Rebuild if needed
cd /var/www/shivalik/frontend
npm run build
```

---

## Security Recommendations

1. **Change default SSH port** (optional but recommended)
2. **Use SSH keys** instead of password authentication
3. **Keep secrets secure** - never commit .env files
4. **Regular updates**: `sudo apt update && sudo apt upgrade`
5. **Setup automated backups** for your MongoDB database
6. **Monitor logs** regularly: `pm2 logs`
7. **Use HTTPS** (Let's Encrypt is free)

---

## Summary

After deployment, your app structure will be:
- **Frontend**: Served by Nginx from `/var/www/shivalik/frontend/dist`
- **Backend**: Running on port 5000 via PM2
- **Nginx**: Reverse proxy on port 80/443
- **MongoDB**: Hosted on MongoDB Atlas

Your website will be accessible at: `http://YOUR_DOMAIN_OR_IP`

---

## Need Help?

Common issues and solutions:

1. **502 Bad Gateway**: Backend isn't running. Check `pm2 logs`
2. **404 on refresh**: Nginx config issue. Check `try_files` directive
3. **CORS errors**: Update FRONTEND_URL in backend .env
4. **API not responding**: Check firewall and nginx proxy settings
