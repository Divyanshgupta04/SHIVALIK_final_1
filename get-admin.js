require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const admin = await Admin.findOne({}, 'username email');
  console.log('Admin username:', admin.username);
  console.log('Admin email:', admin.email || 'N/A');
  process.exit();
});
