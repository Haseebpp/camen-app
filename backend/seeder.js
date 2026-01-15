import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/user.model.js';
import Product from './models/product.model.js';
import Event from './models/event.model.js';
import Sale from './models/sale.model.js';
import Expense from './models/expense.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

// ================== SEED DATA ==================

// Staff Users
const staffData = [
    { name: 'Admin User', email: 'admin@salestrack.com', password: 'admin123', isAdmin: true },
    { name: 'Ahmed Hassan', email: 'ahmed@salestrack.com', password: 'staff123', isAdmin: false },
    { name: 'Sara Mohammed', email: 'sara@salestrack.com', password: 'staff123', isAdmin: false },
    { name: 'Khalid Omar', email: 'khalid@salestrack.com', password: 'staff123', isAdmin: false },
    { name: 'Fatima Ali', email: 'fatima@salestrack.com', password: 'staff123', isAdmin: false },
    { name: 'Omar Yusuf', email: 'omar@salestrack.com', password: 'staff123', isAdmin: false },
];

// Product data
const productsData = [
    { itemCode: 'SW-01', name: 'Shadow Walk', description: 'Premium Fragrance', costPrice: 60, sellingPrice: 180, stockQuantity: 47, initialStock: 50, soldQuantity: 3, category: 'Perfume' },
    { itemCode: 'WF-01', name: 'Wild Flame', description: 'Intense spicy scent', costPrice: 60, sellingPrice: 195, stockQuantity: 38, initialStock: 40, soldQuantity: 2, category: 'Perfume' },
    { itemCode: 'VS-01', name: 'Violet Silk', description: 'Soft floral notes', costPrice: 60, sellingPrice: 160, stockQuantity: 55, initialStock: 60, soldQuantity: 5, category: 'Perfume' },
    { itemCode: 'OR-01', name: 'Oud Risala', description: 'Traditional authentic Oud', costPrice: 40, sellingPrice: 250, stockQuantity: 28, initialStock: 30, soldQuantity: 2, category: 'Oud' },
    { itemCode: 'GO-01', name: 'Green Oud', description: 'Fresh woody blend', costPrice: 40, sellingPrice: 230, stockQuantity: 31, initialStock: 35, soldQuantity: 4, category: 'Oud' },
    { itemCode: 'EB-01', name: 'Eau Blue', description: 'Oceanic fresh breeze', costPrice: 40, sellingPrice: 140, stockQuantity: 52, initialStock: 55, soldQuantity: 3, category: 'Perfume' },
    { itemCode: 'MN-01', name: 'Midnight Noir', description: 'Deep mysterious scent', costPrice: 70, sellingPrice: 220, stockQuantity: 25, initialStock: 30, soldQuantity: 5, category: 'Perfume' },
    { itemCode: 'RS-01', name: 'Rose Smoke', description: 'Smoky rose blend', costPrice: 55, sellingPrice: 175, stockQuantity: 40, initialStock: 45, soldQuantity: 5, category: 'Perfume' },
];

// Events with locations
const eventsData = [
    { name: 'Summer Festival 2024', location: 'Central Park Mall, Riyadh', daysAgo: 75, status: 'CLOSED' },
    { name: 'Eid Special Sale', location: 'Al Nakheel Plaza, Jeddah', daysAgo: 60, status: 'CLOSED' },
    { name: 'Winter Expo', location: 'Kingdom Tower Mall, Riyadh', daysAgo: 45, status: 'CLOSED' },
    { name: 'Spring Market', location: 'Red Sea Mall, Jeddah', daysAgo: 20, status: 'CLOSED' },
    { name: 'National Day Celebration', location: 'Boulevard Riyadh City', daysAgo: 7, status: 'OPEN' },
    { name: 'Weekend Pop-up', location: 'Local Souq, Dammam', daysAgo: 1, status: 'OPEN' },
];

// Expense categories with typical amounts
const expenseCategories = [
    { category: 'Transport', minAmount: 50, maxAmount: 200 },
    { category: 'Supplies', minAmount: 100, maxAmount: 400 },
    { category: 'Food & Beverages', minAmount: 50, maxAmount: 150 },
    { category: 'Marketing', minAmount: 200, maxAmount: 500 },
    { category: 'Staff Allowance', minAmount: 100, maxAmount: 300 },
    { category: 'Equipment Rental', minAmount: 300, maxAmount: 800 },
];

// Expense descriptions
const expenseDescriptions = {
    'Transport': ['Delivery truck rental', 'Staff transport', 'Product shipping', 'Van hire for setup'],
    'Supplies': ['Packaging materials', 'Display stands', 'Shopping bags', 'Receipt rolls', 'Gift wrapping'],
    'Food & Beverages': ['Staff lunch', 'Water bottles', 'Coffee and snacks', 'Catering for team'],
    'Marketing': ['Banner printing', 'Flyer distribution', 'Social media ads', 'Promotional items'],
    'Staff Allowance': ['Overtime payment', 'Daily allowance', 'Transportation allowance'],
    'Equipment Rental': ['Tent rental', 'Display equipment', 'Cash register rental', 'Tables and chairs'],
};

// Combo names for combo sales
const comboNames = ['Premium Bundle', 'Oud Collection', 'Family Pack', 'Gift Set', 'Starter Kit'];

// ================== HELPER FUNCTIONS ==================

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    // Add random hours
    date.setHours(getRandomInt(9, 20), getRandomInt(0, 59), getRandomInt(0, 59));
    return date;
};

// ================== MAIN SEEDER ==================

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
        console.log('\n🌱 Starting comprehensive database seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Sale.deleteMany({});
        await Expense.deleteMany({});
        await Event.deleteMany({});
        await Product.deleteMany({});
        // Only delete non-real users (keep users with custom emails)
        const existingUsers = await User.find();
        console.log(`   Found ${existingUsers.length} existing users`);

        // ================== 1. SEED USERS ==================
        console.log('\n👥 Seeding staff users...');
        const createdUsers = [];

        for (const userData of staffData) {
            let user = await User.findOne({ email: userData.email });
            if (!user) {
                user = await User.create(userData);
                console.log(`   ✅ Created user: ${user.name} (${user.email}) ${user.isAdmin ? '[ADMIN]' : ''}`);
            } else {
                console.log(`   ⏭️  User exists: ${user.name} (${user.email})`);
            }
            createdUsers.push(user);
        }

        const adminUser = createdUsers.find(u => u.isAdmin);
        const staffUsers = createdUsers.filter(u => !u.isAdmin);

        // ================== 2. SEED PRODUCTS ==================
        console.log('\n📦 Seeding products...');
        const productsWithUser = productsData.map((product) => ({
            ...product,
            user: adminUser._id,
        }));
        const createdProducts = await Product.insertMany(productsWithUser);
        console.log(`   ✅ Created ${createdProducts.length} products`);

        // ================== 3. SEED EVENTS ==================
        console.log('\n📅 Seeding events...');
        const createdEvents = [];

        for (const eventData of eventsData) {
            const event = await Event.create({
                user: adminUser._id,
                name: eventData.name,
                date: getRandomDate(eventData.daysAgo),
                location: eventData.location,
                status: eventData.status,
            });
            createdEvents.push(event);
            console.log(`   ✅ Created event: "${event.name}" at ${event.location} [${event.status}]`);
        }

        // ================== 4. SEED SALES ==================
        console.log('\n💰 Seeding sales...');
        let totalSales = 0;
        const salesPerEvent = [8, 10, 7, 6, 5, 4]; // Distribution across events

        for (let i = 0; i < createdEvents.length; i++) {
            const event = createdEvents[i];
            const numSales = salesPerEvent[i];
            const eventDaysAgo = eventsData[i].daysAgo;

            for (let j = 0; j < numSales; j++) {
                const staffMember = getRandomElement(staffUsers);
                const isCombo = Math.random() > 0.7; // 30% chance of combo

                // Generate random items
                const numItems = isCombo ? getRandomInt(2, 4) : getRandomInt(1, 2);
                const selectedProducts = [];
                const usedProductIds = new Set();

                while (selectedProducts.length < numItems) {
                    const product = getRandomElement(createdProducts);
                    if (!usedProductIds.has(product._id.toString())) {
                        usedProductIds.add(product._id.toString());
                        selectedProducts.push({
                            productId: product._id,
                            productName: product.name,
                            quantity: getRandomInt(1, 3),
                            unitPrice: product.sellingPrice,
                        });
                    }
                }

                const totalAmount = selectedProducts.reduce(
                    (sum, item) => sum + (item.unitPrice * item.quantity),
                    0
                );

                // Create sale with random time during event
                const saleDate = getRandomDate(eventDaysAgo + getRandomInt(-1, 1));

                await Sale.create({
                    user: adminUser._id,
                    timestamp: saleDate,
                    type: isCombo ? 'COMBO' : 'INDIVIDUAL',
                    items: selectedProducts,
                    totalAmount,
                    comboName: isCombo ? getRandomElement(comboNames) : null,
                    soldBy: staffMember.name,
                    event: event._id,
                });
                totalSales++;
            }
            console.log(`   ✅ Created ${numSales} sales for "${event.name}"`);
        }
        console.log(`   📊 Total sales created: ${totalSales}`);

        // ================== 5. SEED EXPENSES ==================
        console.log('\n💸 Seeding expenses...');
        let totalExpenses = 0;
        const expensesPerEvent = [5, 6, 4, 4, 3, 3]; // Distribution across events

        for (let i = 0; i < createdEvents.length; i++) {
            const event = createdEvents[i];
            const numExpenses = expensesPerEvent[i];
            const eventDaysAgo = eventsData[i].daysAgo;

            for (let j = 0; j < numExpenses; j++) {
                const categoryData = getRandomElement(expenseCategories);
                const descriptions = expenseDescriptions[categoryData.category];
                const description = getRandomElement(descriptions);
                const amount = getRandomInt(categoryData.minAmount, categoryData.maxAmount);

                const expenseDate = getRandomDate(eventDaysAgo + getRandomInt(-2, 0));

                await Expense.create({
                    user: adminUser._id,
                    description,
                    category: categoryData.category,
                    amount,
                    date: expenseDate,
                    event: event._id,
                });
                totalExpenses++;
            }
            console.log(`   ✅ Created ${numExpenses} expenses for "${event.name}"`);
        }
        console.log(`   📊 Total expenses created: ${totalExpenses}`);

        // ================== SUMMARY ==================
        console.log('\n' + '='.repeat(50));
        console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        console.log(`   👥 Users:    ${createdUsers.length} (1 admin + ${staffUsers.length} staff)`);
        console.log(`   📦 Products: ${createdProducts.length}`);
        console.log(`   📅 Events:   ${createdEvents.length}`);
        console.log(`   💰 Sales:    ${totalSales}`);
        console.log(`   💸 Expenses: ${totalExpenses}`);
        console.log('='.repeat(50));
        console.log('\n📌 Login credentials:');
        console.log('   Admin: admin@salestrack.com / admin123');
        console.log('   Staff: ahmed@salestrack.com / staff123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error(`❌ Error seeding database: ${error.message}`);
        console.error(error);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        console.log('🗑️  Destroying all data...');

        const deletedSales = await Sale.deleteMany({});
        console.log(`   Deleted ${deletedSales.deletedCount} sales`);

        const deletedExpenses = await Expense.deleteMany({});
        console.log(`   Deleted ${deletedExpenses.deletedCount} expenses`);

        const deletedEvents = await Event.deleteMany({});
        console.log(`   Deleted ${deletedEvents.deletedCount} events`);

        const deletedProducts = await Product.deleteMany({});
        console.log(`   Deleted ${deletedProducts.deletedCount} products`);

        console.log('\n🗑️ All data destroyed successfully!');
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error destroying data: ${error.message}`);
        process.exit(1);
    }
};

// Make a specific user admin by email
const makeAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`❌ User with email "${email}" not found`);
            process.exit(1);
        }

        user.isAdmin = true;
        await user.save();

        console.log(`✅ User "${user.name}" (${user.email}) is now an admin!`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ Error making user admin: ${error.message}`);
        process.exit(1);
    }
};

// Show usage help
const showHelp = () => {
    console.log(`
📌 SalesTrack Database Seeder
=============================

Usage: node seeder.js [option]

Options:
  (no option)    Seed database with sample data
  -d             Destroy all data (clear database)
  -a <email>     Make a user admin by email
  -h, --help     Show this help message

Examples:
  node seeder.js                    # Seed database
  node seeder.js -d                 # Clear all data
  node seeder.js -a user@email.com  # Make user an admin
`);
    process.exit(0);
};

// Run based on command line argument
if (process.argv[2] === '-d') {
    destroyData();
} else if (process.argv[2] === '-a' && process.argv[3]) {
    makeAdmin(process.argv[3]);
} else if (process.argv[2] === '-h' || process.argv[2] === '--help') {
    showHelp();
} else {
    seedDatabase();
}
