const Category = require('../models/Category');

/**
 * Auto-seed default categories if database is empty
 * This runs automatically when the server starts
 */
async function autoSeedCategories() {
  try {
    const count = await Category.countDocuments();
    
    // Only seed if no categories exist
    if (count === 0) {
      console.log('📂 No categories found. Seeding default categories...');
      
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

      const results = await Category.insertMany(defaultCategories);
      console.log(`✅ Successfully seeded ${results.length} default categories`);
    } else {
      console.log(`✅ Categories already exist (${count} found). Skipping auto-seed.`);
    }
  } catch (error) {
    console.error('❌ Error auto-seeding categories:', error);
  }
}

module.exports = autoSeedCategories;
