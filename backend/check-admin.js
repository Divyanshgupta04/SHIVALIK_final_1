require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function checkAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const admins = await Admin.find().select('username email');
    console.log('Existing admins:', admins);
    
    if (admins.length === 0) {
      console.log('No admins found. Creating default admin...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('Admin123', 10);
      
      const newAdmin = new Admin({
        username: 'admin',
        email: 'admin@shivalik.com',
        password: hashedPassword
      });
      
      await newAdmin.save();
      console.log('Created default admin: username=admin, password=Admin123');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAdmins();