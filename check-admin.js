require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const Admin = require('./models/Admin');
  const Product = require('./models/Product');
  
  const adminCount = await Admin.countDocuments();
  const productCount = await Product.countDocuments();
  
  console.log('Admin count:', adminCount);
  console.log('Product count:', productCount);
  
  if (adminCount > 0) {
    const admins = await Admin.find({}, 'email name');
    console.log('Admins:', admins);
  }
  
  if (productCount > 0) {
    const products = await Product.find({}, 'title price');
    console.log('Products:', products.slice(0, 5));
  }
  
  process.exit();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
