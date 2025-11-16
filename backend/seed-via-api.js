const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function seedData() {
  try {
    console.log('🌱 Starting to seed test data via API...\n');

    // Step 1: Register admin user (if doesn't exist)
    console.log('1. Creating admin user...');
    try {
      const adminRes = await axios.post(`${API_BASE}/auth/register`, {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '1234567890',
        role: 'admin'
      });
      console.log('   ✅ Admin user created');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  Admin user already exists');
      } else {
        console.log('   ⚠️  Admin user creation:', error.response?.data?.message || error.message);
      }
    }

    // Step 2: Login as admin
    console.log('\n2. Logging in as admin...');
    let token;
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      token = loginRes.data.token;
      console.log('   ✅ Logged in successfully');
    } catch (error) {
      console.error('   ❌ Login failed:', error.response?.data?.message || error.message);
      console.log('\n   Trying to register admin again...');
      // Try registering first
      await axios.post(`${API_BASE}/auth/register`, {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '1234567890',
        role: 'admin'
      });
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: 'admin@example.com',
        password: 'admin123'
      });
      token = loginRes.data.token;
      console.log('   ✅ Registered and logged in');
    }

    // Step 3: Initialize modules
    console.log('\n3. Initializing modules...');
    try {
      await axios.post(`${API_BASE}/admin/init-modules`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Modules initialized');
    } catch (error) {
      console.log('   ⚠️  Modules:', error.response?.data?.message || error.message);
    }

    // Step 4: Seed test data
    console.log('\n4. Seeding test data...');
    try {
      const seedRes = await axios.post(`${API_BASE}/admin/seed-data`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Test data seeded successfully!');
      console.log('\n   📊 Summary:');
      console.log(`      - Users: ${JSON.stringify(seedRes.data.users)}`);
      console.log(`      - Restaurants: ${seedRes.data.restaurants}`);
      console.log(`      - Grocery Items: ${seedRes.data.groceries}`);
      console.log(`      - Services: ${seedRes.data.services}`);
    } catch (error) {
      console.error('   ❌ Seeding failed:', error.response?.data?.message || error.message);
      if (error.response?.data?.error) {
        console.error('   Error details:', error.response.data.error);
      }
      process.exit(1);
    }

    console.log('\n✅ All test data has been seeded successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: user@example.com / user123');
    console.log('   Provider: provider@example.com / provider123');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Could not connect to backend server.');
      console.error('   Make sure the backend is running on http://localhost:5001');
    }
    process.exit(1);
  }
}

seedData();

