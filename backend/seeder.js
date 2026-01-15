import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/user.model.js';
import Product from './models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// Product data from prototype
const productsData = [
    {
        itemCode: 'SW-01',
        name: 'Shadow Walk',
        description: 'Premium Fragrance',
        costPrice: 60,
        sellingPrice: 180,
        stockQuantity: 47,
        initialStock: 50,
        soldQuantity: 3,
        category: 'Perfume',
    },
    {
        itemCode: 'WF-01',
        name: 'Wild Flame',
        description: 'Intense spicy scent',
        costPrice: 60,
        sellingPrice: 195,
        stockQuantity: 38,
        initialStock: 40,
        soldQuantity: 2,
        category: 'Perfume',
    },
    {
        itemCode: 'VS-01',
        name: 'Violet Silk',
        description: 'Soft floral notes',
        costPrice: 60,
        sellingPrice: 160,
        stockQuantity: 55,
        initialStock: 60,
        soldQuantity: 5,
        category: 'Perfume',
    },
    {
        itemCode: 'OR-01',
        name: 'Oud Risala',
        description: 'Traditional authentic Oud',
        costPrice: 40,
        sellingPrice: 250,
        stockQuantity: 28,
        initialStock: 30,
        soldQuantity: 2,
        category: 'Oud',
    },
    {
        itemCode: 'GO-01',
        name: 'Green Oud',
        description: 'Fresh woody blend',
        costPrice: 40,
        sellingPrice: 230,
        stockQuantity: 31,
        initialStock: 35,
        soldQuantity: 4,
        category: 'Oud',
    },
    {
        itemCode: 'EB-01',
        name: 'Eau Blue',
        description: 'Oceanic fresh breeze',
        costPrice: 40,
        sellingPrice: 140,
        stockQuantity: 52,
        initialStock: 55,
        soldQuantity: 3,
        category: 'Perfume',
    },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Check if there's at least one user to associate products with
        let user = await User.findOne();

        if (!user) {
            // Create a default user if none exists
            console.log('No user found. Creating default seeder user...');
            user = await User.create({
                name: 'Seeder Admin',
                email: 'admin@salestrack.com',
                password: 'admin123',
            });
            console.log(`Default user created: ${user.email}`);
        }

        // Clear existing products for this user
        const deletedCount = await Product.deleteMany({ user: user._id });
        console.log(`Cleared ${deletedCount.deletedCount} existing products for user`);

        // Create products with user reference
        const productsWithUser = productsData.map((product) => ({
            ...product,
            user: user._id,
        }));

        const createdProducts = await Product.insertMany(productsWithUser);
        console.log(`✅ Successfully seeded ${createdProducts.length} products:`);

        createdProducts.forEach((product) => {
            console.log(`   - ${product.itemCode}: ${product.name} (Stock: ${product.stockQuantity})`);
        });

        console.log('\n🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const deletedProducts = await Product.deleteMany({});
        console.log(`Deleted ${deletedProducts.deletedCount} products`);

        console.log('\n🗑️ Data destroyed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error destroying data: ${error.message}`);
        process.exit(1);
    }
};

// Run based on command line argument
if (process.argv[2] === '-d') {
    destroyData();
} else {
    seedDatabase();
}
