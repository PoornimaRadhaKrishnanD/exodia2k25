// Make existing user an admin
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');

async function makeUserAdmin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'subi@gmail.com';
    
    // Find the user
    const user = await User.findOne({ email: email });
    if (!user) {
      console.log(`❌ User ${email} not found`);
      console.log('📧 Available users:');
      const allUsers = await User.find({}, 'name email role');
      allUsers.forEach(u => console.log(`  - ${u.name} (${u.email}) - ${u.role}`));
      
      // Create the user as admin
      console.log(`👤 Creating ${email} as admin user...`);
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const adminUser = new User({
        name: 'Subi Admin',
        email: email,
        phone: '+1234567890',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log(`✅ Created ${email} as admin user!`);
      console.log(`🔑 Password: password123`);
    } else {
      // Update existing user to admin
      console.log(`👤 Found user: ${user.name} (${user.email})`);
      console.log(`📊 Current role: ${user.role}`);
      
      if (user.role === 'admin') {
        console.log('✅ User is already an admin!');
      } else {
        user.role = 'admin';
        await user.save();
        console.log('✅ User upgraded to admin!');
      }
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Use your existing password`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔚 Connection closed');
  }
}

makeUserAdmin();