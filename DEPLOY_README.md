# 🚀 Quick Deployment Instructions

## Your VPS Details
- **IP Address**: `72.61.131.104`
- **SSH Command**: `ssh root@72.61.131.104`

---

## ⚡ Quick Deploy (Automated - Recommended)

1. **SSH into your VPS:**
```bash
ssh root@72.61.131.104
```

2. **Clone the repository:**
```bash
cd /var/www
mkdir -p shivalik
cd shivalik
git clone https://github.com/Divyanshgupta04/SHIVALIK_final_1.git .
```

3. **Run the automated deployment script:**
```bash
chmod +x deploy.sh
sudo ./deploy.sh
```

That's it! The script will:
- ✅ Install all dependencies (Node.js, Nginx, PM2)
- ✅ Configure backend with auto-generated secrets
- ✅ Build frontend for production
- ✅ Setup Nginx as reverse proxy
- ✅ Start backend with PM2
- ✅ Configure firewall

**Your website will be live at: http://72.61.131.104**

---

## 📝 Manual Deploy (Step by Step)

If you prefer manual setup, follow the complete guide: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## ⚠️ Important: MongoDB Atlas Setup

**Before accessing your website**, whitelist your VPS IP in MongoDB Atlas:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to: **Network Access** → **IP Access List**
3. Click **Add IP Address**
4. Enter: `72.61.131.104`
5. Or for testing, use: `0.0.0.0/0` (allows all IPs - not recommended for production)
6. Click **Confirm**

---

## 🔍 After Deployment - Verify Everything Works

```bash
# Check backend is running
pm2 status
pm2 logs shivalik-backend

# Check Nginx is running
sudo systemctl status nginx

# Test backend API
curl http://localhost:5000/api

# Test from outside
curl http://72.61.131.104/api
```

Visit your website: **http://72.61.131.104**

---

## 🛠️ Useful Commands

```bash
# View logs
pm2 logs

# Restart backend
pm2 restart shivalik-backend

# Stop backend
pm2 stop shivalik-backend

# Reload Nginx
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 Update Deployment (After Code Changes)

```bash
cd /var/www/shivalik

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install --production
pm2 restart shivalik-backend

# Update frontend
cd ../frontend
npm install
npm run build

# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Setup SSL (HTTPS) - Recommended

```bash
# Install Certbot (if you have a domain)
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace yourdomain.com with your actual domain)
sudo certbot --nginx -d yourdomain.com

# Update backend .env
nano /var/www/shivalik/backend/.env
# Change: FRONTEND_URL=https://yourdomain.com

# Update frontend .env.production
nano /var/www/shivalik/frontend/.env.production
# Change: VITE_API_URL=https://yourdomain.com

# Rebuild frontend
cd /var/www/shivalik/frontend
npm run build

# Restart backend
pm2 restart shivalik-backend
```

---

## 🆘 Troubleshooting

### Website not loading?
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### 502 Bad Gateway?
```bash
# Backend is not running
pm2 status
pm2 logs shivalik-backend

# Restart backend
pm2 restart shivalik-backend
```

### Can't connect to MongoDB?
- Check MongoDB Atlas IP whitelist includes: `72.61.131.104`
- Verify .env file has correct MONGODB_URI

### API calls failing?
```bash
# Check CORS settings
pm2 logs shivalik-backend

# Verify frontend is making requests to correct URL
cat /var/www/shivalik/frontend/dist/index.html | grep -i "72.61.131.104"
```

---

## 📞 Support

If you encounter any issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify MongoDB connection: Check .env file
4. Ensure firewall allows port 80: `sudo ufw status`

---

## 🎯 Summary

- **Website URL**: http://72.61.131.104
- **Backend API**: http://72.61.131.104/api
- **Frontend**: Served by Nginx from `/var/www/shivalik/frontend/dist`
- **Backend**: Running on port 5000 via PM2
- **Database**: MongoDB Atlas (cloud)

**Next Steps After Deployment:**
1. ✅ Visit http://72.61.131.104
2. ✅ Test user registration and login
3. ✅ Test product browsing
4. ✅ Test admin panel
5. 🔒 Setup SSL certificate (if you have a domain)
