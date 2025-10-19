# Production Setup Guide

## Environment Configuration

### Backend (.env)
The backend requires the following environment variables:

```env
PORT=5000
MONGODB_URI=mongodb+srv://[user]:[password]@cluster0.mongodb.net/shivalik_service_hub
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
NODE_ENV=production

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_SECRET=your_razorpay_secret

FRONTEND_URL=https://www.yourdomain.com
```

### Frontend (.env.production)
```env
VITE_API_URL=https://yourdomain.com
```

## Key Configuration Changes

### 1. Database Connection
- **Production**: MongoDB Atlas
- **URI**: `mongodb+srv://sonugupta25795_db_user:***@cluster0.70n7ru0.mongodb.net/shivalik_service_hub`
- Location: `/var/www/shivalik/backend/.env`

### 2. Session Cookies
- **Domain**: `.sshjk.in` (allows cookies across subdomains)
- **SameSite**: `none` (required for cross-subdomain with HTTPS)
- **Secure**: `true` (HTTPS only)
- File: `backend/server.js` (lines 59-62)

### 3. API Endpoints
All frontend API calls must include `/api` prefix:
- ✅ `/api/products`
- ✅ `/api/cart/add`
- ✅ `/api/user-auth/address`
- ✅ `/api/payment/create-order`

### 4. CORS Configuration
Allowed origins in `backend/server.js`:
- `http://localhost:5173` (dev)
- `http://localhost:5174` (dev)
- `http://sshjk.in`
- `https://sshjk.in`
- `http://www.sshjk.in`
- `https://www.sshjk.in`

### 5. Razorpay Integration
- **Test Key ID**: `rzp_test_RUx6BbBcRKKRRG`
- **Test Secret**: `dTwU1HZdu231VB9IYzeunTR4`
- **Account Email**: `sshubjk@gmail.com`

## Server Deployment

### Directory Structure
```
/var/www/shivalik/
├── backend/
│   ├── .env (production settings)
│   ├── server.js
│   ├── models/
│   └── routes/
├── frontend/
│   ├── .env.production
│   ├── dist/ (built files)
│   └── src/
└── nginx.conf
```

### PM2 Process
- Name: `backend`
- Status: Check with `pm2 status`
- Logs: `pm2 logs backend`
- Restart: `pm2 restart backend`

### Nginx Configuration
- Serves frontend from `/var/www/shivalik/frontend/dist`
- Proxies `/api/*` to `http://localhost:5000`
- HTTPS enabled with SSL certificates

## Deployment Steps

1. **Pull latest code**:
   ```bash
   cd /var/www/shivalik
   git pull origin main
   ```

2. **Update backend**:
   ```bash
   cd backend
   npm install
   pm2 restart backend
   ```

3. **Update frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. **Verify**:
   - Check `pm2 logs backend` for errors
   - Visit https://www.sshjk.in
   - Test product loading and cart functionality

## Troubleshooting

### Products not loading
- Check MongoDB connection: `grep MONGODB_URI backend/.env`
- Verify it points to Atlas, not localhost

### Cart not working
- Check session cookies in browser DevTools
- Verify cookie domain is set to `.sshjk.in`
- Check CORS origins include your domain

### Payment errors
- Verify Razorpay credentials in `.env`
- Check Razorpay account is activated
- Test mode should be enabled for test keys

## Security Notes

- Never commit `.env` files to git
- Use `.env.example` as template
- Keep API keys and secrets secure
- MongoDB password is encrypted in Atlas connection string