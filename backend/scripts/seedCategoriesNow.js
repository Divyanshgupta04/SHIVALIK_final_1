const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

const defaultCategories = [
  { name: 'Partner Program', slug: 'partner', imageUrl: '/src/assets/Partner.jpg' },
  { name: 'Pan Card', slug: 'pan', imageUrl: '/src/assets/Pan.jpg' },
  { name: 'Insurance', slug: 'insurance', imageUrl: '/src/assets/Insurance.jpg' },
  { name: 'Service', slug: 'service', imageUrl: '/src/assets/service.jpg' },
  { name: 'Tax', slug: 'tax', imageUrl: '/src/assets/tax.jpg' },
  { name: 'Land Record', slug: 'land-record', imageUrl: '/src/assets/land.jpg' },
  { name: 'Certificate', slug: 'certificate', imageUrl: '/src/assets/Car.jpg' },
  { name: 'Library', slug: 'library', imageUrl: '/src/assets/li.jpg' }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shivalik_service_hub');
    console.log('MongoDB connected successfully');

    console.log('Seeding categories...');
    
    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ slug: cat.slug });
      if (exists) {
        console.log(`✓ Category "${cat.name}" already exists`);
      } else {
        const newCat = new Category(cat);
        await newCat.save();
        console.log(`✓ Created category "${cat.name}"`);
      }
    }

    const count = await Category.countDocuments();
    console.log(`\n✅ Done! Total categories in database: ${count}`);
    
    const allCategories = await Category.find().sort({ name: 1 });
    console.log('\nAll categories:');
    allCategories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
