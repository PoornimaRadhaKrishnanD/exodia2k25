// Admin setup script - Run this once to create an admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@playswiftpay.com' });
    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      console.log('📧 Email: admin@playswiftpay.com');
      console.log('🔑 Password: admin123 (if you haven\'t changed it)');
      process.exit(0);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@playswiftpay.com',
      phone: '+1234567890',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@playswiftpay.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️ Please change the password after first login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔚 Connection closed');
  }
}

// Run the script
createAdminUser();