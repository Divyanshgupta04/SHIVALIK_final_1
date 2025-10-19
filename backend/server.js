const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const { verifyEmailTransport } = require('./utils/email');

const app = express();
const server = http.createServer(app);

// Configure allowed origins
const allowedOrigins = [
  "http://localhost:5174", // Development
  "http://localhost:5173", // Development
  "http://sshjk.in", // Production domain
  "https://sshjk.in", // Production domain HTTPS
  "http://www.sshjk.in", // Production domain with www
  "https://www.sshjk.in", // Production domain with www HTTPS
  process.env.FRONTEND_URL // Production (from env)
].filter(Boolean);

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/shivalik_service_hub',
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    domain: '.sshjk.in', // Allow cookie across all subdomains
    secure: true, // HTTPS enabled
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: 'none' // Required for cross-subdomain with secure cookies
  }
}));

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shivalik_service_hub', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    
    // Auto-seed categories if database is empty
    const autoSeedCategories = require('./scripts/autoSeedCategories');
    await autoSeedCategories();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// Verify email transporter on startup (logs status)
verifyEmailTransport();

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user-auth', require('./routes/userAuth'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/categories', require('./routes/categories'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Shivalik Service Hub Backend API' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
