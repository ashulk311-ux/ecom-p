const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ email: 'superadmin@example.com' });
    
    if (existingSuperAdmin) {
      console.log('Super admin already exists!');
      console.log('Email: superadmin@example.com');
      console.log('To change password, update the user in the database or use the super admin panel.');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: 'superadmin123', // Change this password after first login!
      phone: '0000000000',
      role: 'super_admin'
    });

    await superAdmin.save();

    console.log('✅ Super Admin created successfully!');
    console.log('Email: superadmin@example.com');
    console.log('Password: superadmin123');
    console.log('⚠️  Please change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();



