# Shivalik Service Hub - Full Stack Application

A complete full-stack application with React frontend and Node.js backend, featuring real-time product management through an admin dashboard.

## Features

- **Frontend (React + Vite)**
  - Modern responsive UI with Tailwind CSS
  - Real-time product updates using WebSocket
  - Shopping cart functionality
  - Smooth animations with Framer Motion
  
- **Backend (Node.js + Express)**
  - REST API for product management
  - JWT authentication for admin access
  - Real-time updates with Socket.IO
  - MongoDB database with Mongoose ODM

- **Admin Dashboard**
  - Secure login system
  - Complete product CRUD operations
  - Real-time updates to frontend
  - Professional dashboard interface

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the automated setup script
npm run setup
```

This will:
- Install all dependencies (frontend + backend)
- Create the admin user and seed the database
- Give you the next steps

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

#### 2. Setup Database

Make sure MongoDB is running on your system, then seed the database:

```bash
cd backend
npm run seed
```

**⚠️ IMPORTANT: You MUST run this command to create the admin user!**

This will create:
- All existing products in the database
- Default admin user with credentials:
  - Username: `admin`
  - Password: `admin123`

**Note for collaborators:** If you cloned this repository and can't login as admin, make sure you run `npm run seed` in the backend directory first.

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on: http://localhost:5173

## Admin Access

### Admin Login
- URL: http://localhost:5173/admin/login
- Username: `admin`
- Password: `admin123`

### Admin Dashboard
- URL: http://localhost:5173/admin/dashboard
- Features:
  - View all products
  - Add new products
  - Edit existing products
  - Delete products
  - Real-time updates to frontend

## API Endpoints

### Public Routes
- `GET /api/products` - Get all products

### Admin Routes (Require Authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin
- `GET /api/auth/verify` - Verify token
- `GET /api/admin/products` - Get all products (admin view)
- `POST /api/admin/products` - Create new product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/dashboard` - Get dashboard stats

## Real-Time Features

The application uses WebSocket (Socket.IO) for real-time communication:

- When admin adds a product → Frontend instantly shows new product
- When admin updates a product → Frontend updates the product immediately
- When admin deletes a product → Frontend removes the product instantly
- Users see toast notifications for all changes

## Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- Axios
- Socket.IO Client
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- Socket.IO
- CORS

## Project Structure

```
Website_New/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── scripts/         # Database seed script
│   ├── server.js        # Main server file
│   └── .env            # Environment variables
├── src/
│   ├── Components/
│   │   ├── Admin/      # Admin components
│   │   └── ...         # Other components
│   ├── context/        # React context
│   └── ...
└── README.md
```

## Environment Variables

Backend `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shivalik_service_hub
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
```

## Development Notes

1. **MongoDB**: Make sure MongoDB is installed and running locally
2. **Port Configuration**: Backend runs on 5000, Frontend on 5173
3. **CORS**: Configured to allow frontend-backend communication
4. **Authentication**: Uses JWT tokens stored in localStorage
5. **Real-time**: Socket.IO handles real-time product updates

## Usage Instructions

### For Users
1. Visit http://localhost:5173
2. Browse products
3. Add items to cart
4. Products update automatically when admin makes changes

### For Admins
1. Go to http://localhost:5173/admin/login
2. Login with `admin` / `admin123`
3. Access dashboard to manage products
4. Add/Edit/Delete products with real-time frontend updates

## Troubleshooting

### Admin Login Issues
**Problem:** Getting "Invalid credentials" when trying to login as admin

**Solution:**
1. Make sure you ran the seed command:
   ```bash
   cd backend
   npm run seed
   ```
2. Use the correct credentials:
   - Username: `admin`
   - Password: `admin123`
3. Make sure MongoDB is running and connected
4. Check the backend console for any errors

### Other Common Issues
1. **MongoDB Connection Error**: Ensure MongoDB is running
2. **Port Conflicts**: Check if ports 5000 or 5173 are in use
3. **CORS Issues**: Verify backend CORS configuration
4. **Socket Connection**: Check browser console for WebSocket errors
5. **Environment Variables**: Make sure `.env` file exists in backend directory

## Future Enhancements

- User authentication and profiles
- Order management system
- Payment integration
- Product categories and search
- Image upload functionality
- Email notifications
- Analytics dashboard
