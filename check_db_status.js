import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('Connecting to Mongo...');
// Hide password in logs if possible, but for debugging we need to know if URI is read
console.log('URI:', process.env.MONGO_URI ? 'Defined' : 'Undefined');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check Users
        const users = await mongoose.connection.db.collection('users').find().toArray();
        console.log('Users found:', users.length);
        users.forEach(u => console.log(' - User:', u.email, 'Admin:', u.isAdmin));

        // Check Products (for dashboard)
        const productsCount = await mongoose.connection.db.collection('products').countDocuments();
        console.log('Products count:', productsCount);

        // Check Sales
        const salesCount = await mongoose.connection.db.collection('sales').countDocuments();
        console.log('Sales count:', salesCount);

    } catch (error) {
        console.error('DB Connection Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

run();
