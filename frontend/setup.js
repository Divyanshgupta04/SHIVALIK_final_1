#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Shivalik Service Hub...\n');

// Check if .env exists in backend
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found in backend directory');
  console.log('📝 Please create a .env file in the backend directory with the following content:\n');
  console.log(`PORT=5000
MONGODB_URI=mongodb://localhost:27017/shivalik_service_hub
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_SECRET=your_session_secret_key_here
NODE_ENV=development

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_SECRET=your_razorpay_secret_here`);
  console.log('\nThen run this script again.');
  process.exit(1);
}

async function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`🔄 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`❌ ${description} failed:`);
        console.log(error.message);
        reject(error);
        return;
      }
      console.log(`✅ ${description} completed`);
      if (stdout) console.log(stdout);
      resolve(stdout);
    });
  });
}

async function setup() {
  try {
    // Install frontend dependencies
    await runCommand('npm install', 'Installing frontend dependencies');
    
    // Install backend dependencies
    process.chdir('backend');
    await runCommand('npm install', 'Installing backend dependencies');
    
    // Seed the database
    await runCommand('npm run seed', 'Seeding database (creating admin user and products)');
    
    console.log('\n🎉 Setup completed successfully!\n');
    console.log('📋 Next steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: npm run dev (in root directory)');
    console.log('\n🔑 Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   URL: http://localhost:5173/admin/login\n');
    
  } catch (error) {
    console.log('\n❌ Setup failed. Please check the errors above and try again.');
    console.log('💡 Make sure MongoDB is running and try: npm run seed in the backend directory');
  }
}

setup();