const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Test MongoDB Connection and Operations
async function testDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        console.log('📍 Database:', mongoose.connection.db.databaseName);

        // Test creating a user
        console.log('\n🧪 Testing user creation...');
        
        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('🗑️ Deleting existing test user...');
            await User.deleteOne({ email: 'test@example.com' });
        }

        // Create new test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'user'
        });

        const savedUser = await testUser.save();
        console.log('✅ User created successfully:', {
            id: savedUser._id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            createdAt: savedUser.createdAt
        });

        // Test finding the user
        console.log('\n🔍 Testing user lookup...');
        const foundUser = await User.findOne({ email: 'test@example.com' });
        if (foundUser) {
            console.log('✅ User found:', foundUser.name);
        } else {
            console.log('❌ User not found');
        }

        // Test password verification
        console.log('\n🔒 Testing password verification...');
        const passwordValid = await bcrypt.compare('password123', foundUser.password);
        console.log('✅ Password verification:', passwordValid ? 'PASS' : 'FAIL');

        // Count total users
        const userCount = await User.countDocuments();
        console.log('\n📊 Total users in database:', userCount);

        // List all users (without passwords)
        const allUsers = await User.find({}, { password: 0 });
        console.log('\n👥 All users:');
        allUsers.forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        });

        console.log('\n🎉 Database test completed successfully!');

    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the test
testDatabase();