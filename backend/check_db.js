const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ isInsurance: true });
        console.log(`Found ${products.length} insurance products:`);

        products.forEach(p => {
            console.log(`- ID: ${p.id}, Title: ${p.title}, isInsurance: ${p.isInsurance}, externalLink: "${p.externalLink}"`);
        });

        const allProducts = await Product.find({ externalLink: { $ne: '' } });
        console.log(`\nFound ${allProducts.length} products with externalLink:`);
        allProducts.forEach(p => {
            console.log(`- ID: ${p.id}, Title: ${p.title}, isInsurance: ${p.isInsurance}, externalLink: "${p.externalLink}"`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkProducts();
