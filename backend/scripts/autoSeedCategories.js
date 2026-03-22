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
        { name: 'Partner Program', slug: 'partner', imageUrl: '/Partner.jpg' },
        { name: 'Pan Card', slug: 'pan', imageUrl: '/Pan.jpg' },
        { name: 'Insurance', slug: 'insurance', imageUrl: '/Insurance.jpg' },
        { name: 'Service', slug: 'service', imageUrl: '/service.jpg' },
        { name: 'Tax', slug: 'tax', imageUrl: '/tax.jpg' },
        { name: 'Land Record', slug: 'land-record', imageUrl: '/land.jpg' },
        { name: 'Certificate', slug: 'certificate', imageUrl: '/Car.jpg' },
        { name: 'Library Section', slug: 'library', imageUrl: '/li.jpg' }
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
