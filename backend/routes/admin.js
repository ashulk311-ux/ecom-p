const express = require('express');
const mongoose = require('mongoose');
const Module = require('../models/Module');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Grocery = require('../models/Grocery');
const Service = require('../models/Service');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Initialize modules if they don't exist
router.post('/init-modules', adminAuth, async (req, res) => {
  try {
    const modules = [
      { name: 'food', displayName: 'Food Delivery', description: 'Swiggy-like food delivery service', isActive: true },
      { name: 'grocery', displayName: 'Grocery Delivery', description: 'Blinkit-like grocery delivery service', isActive: true },
      { name: 'services', displayName: 'On-Demand Services', description: 'UrbanClap-like service booking', isActive: true }
    ];

    for (const module of modules) {
      await Module.findOneAndUpdate(
        { name: module.name },
        module,
        { upsert: true, new: true }
      );
    }

    res.json({ message: 'Modules initialized successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all modules
router.get('/modules', async (req, res) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. Connection state:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database not connected. Please set up MongoDB.',
        modules: [] 
      });
    }

    const modules = await Module.find();
    // If no modules exist, return empty array instead of error
    res.json(modules || []);
  } catch (error) {
    console.error('Error fetching modules:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    // Return empty array if MongoDB is not connected
    if (error.name === 'MongooseServerSelectionError' || 
        error.name === 'MongooseError' ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('connection') ||
        error.message.includes('MongoServerError')) {
      return res.status(503).json({ 
        message: 'Database not connected. Please set up MongoDB.',
        modules: [] 
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      errorName: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Toggle module status
router.put('/modules/:moduleName/toggle', adminAuth, async (req, res) => {
  try {
    const { moduleName } = req.params;
    const module = await Module.findOne({ name: moduleName });
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    module.isActive = !module.isActive;
    module.updatedAt = new Date();
    await module.save();

    res.json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    const foodOrders = await Order.countDocuments({ moduleType: 'food' });
    const groceryOrders = await Order.countDocuments({ moduleType: 'grocery' });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const serviceRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenue = (totalRevenue[0]?.total || 0) + (serviceRevenue[0]?.total || 0);

    // Time-based analytics (last 7 days, 30 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Orders in last 7 days
    const ordersLast7Days = await Order.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    const ordersLast30Days = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Revenue in last 7 days
    const revenueLast7Days = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const bookingRevenueLast7Days = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const revenue7Days = (revenueLast7Days[0]?.total || 0) + (bookingRevenueLast7Days[0]?.total || 0);

    // Daily revenue for last 7 days (for chart)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrderRevenue = await Order.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: date, $lt: nextDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      const dayBookingRevenue = await Booking.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: date, $lt: nextDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: (dayOrderRevenue[0]?.total || 0) + (dayBookingRevenue[0]?.total || 0)
      });
    }

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Top performing modules
    const foodRevenue = await Order.aggregate([
      { $match: { moduleType: 'food', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const groceryRevenue = await Order.aggregate([
      { $match: { moduleType: 'grocery', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const modulePerf = [
      { name: 'Food', orders: foodOrders, revenue: foodRevenue[0]?.total || 0 },
      { name: 'Grocery', orders: groceryOrders, revenue: groceryRevenue[0]?.total || 0 },
      { name: 'Services', orders: totalBookings, revenue: serviceRevenue[0]?.total || 0 }
    ];

    // Recent users (last 7 days)
    const newUsersLast7Days = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Calculate growth rates
    const orderGrowth = ordersLast30Days > 0 
      ? ((ordersLast7Days / (ordersLast30Days - ordersLast7Days + ordersLast7Days)) * 100).toFixed(1)
      : 0;

    res.json({
      totalUsers,
      totalOrders,
      totalBookings,
      foodOrders,
      groceryOrders,
      totalRevenue: revenue,
      modules: await Module.find(),
      // Enhanced analytics
      trends: {
        ordersLast7Days,
        ordersLast30Days,
        revenueLast7Days: revenue7Days,
        newUsersLast7Days,
        orderGrowth: parseFloat(orderGrowth)
      },
      dailyRevenue,
      orderStatusBreakdown: orderStatusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      modulePerformance: modulePerf,
      insights: {
        avgOrderValue: totalOrders > 0 ? (revenue / totalOrders).toFixed(2) : 0,
        conversionRate: totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(2) : 0,
        topModule: modulePerf.reduce((top, m) => m.revenue > (top?.revenue || 0) ? m : top, null)?.name || 'N/A'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders
router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed test data
router.post('/seed-data', adminAuth, async (req, res) => {
  try {
    // Create admin user if doesn't exist
    let admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '1234567890',
        role: 'admin'
      });
      await admin.save();
    }

    // Create test user if doesn't exist
    let testUser = await User.findOne({ email: 'user@example.com' });
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: 'user@example.com',
        password: 'user123',
        phone: '9876543210',
        role: 'user'
      });
      await testUser.save();
    }

    // Create service provider user
    let provider = await User.findOne({ email: 'provider@example.com' });
    if (!provider) {
      provider = new User({
        name: 'Service Provider',
        email: 'provider@example.com',
        password: 'provider123',
        phone: '5555555555',
        role: 'service_provider'
      });
      await provider.save();
    }

    // Seed Restaurants
    const restaurants = [
      {
        name: 'Pizza Palace',
        cuisine: 'Italian',
        description: 'Authentic Italian pizzas and pasta',
        rating: 4.5,
        deliveryTime: 30,
        deliveryFee: 20,
        menu: [
          { name: 'Margherita Pizza', description: 'Classic cheese pizza with tomato sauce', price: 299, category: 'Pizza' },
          { name: 'Pepperoni Pizza', description: 'Pizza with pepperoni and cheese', price: 349, category: 'Pizza' },
          { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon', price: 249, category: 'Pasta' },
          { name: 'Garlic Bread', description: 'Fresh baked garlic bread', price: 99, category: 'Sides' }
        ]
      },
      {
        name: 'Burger King',
        cuisine: 'American',
        description: 'Juicy burgers and fries',
        rating: 4.3,
        deliveryTime: 25,
        deliveryFee: 15,
        menu: [
          { name: 'Classic Burger', description: 'Beef patty with lettuce and tomato', price: 199, category: 'Burgers' },
          { name: 'Chicken Burger', description: 'Grilled chicken burger', price: 179, category: 'Burgers' },
          { name: 'French Fries', description: 'Crispy golden fries', price: 99, category: 'Sides' },
          { name: 'Onion Rings', description: 'Crispy onion rings', price: 129, category: 'Sides' }
        ]
      },
      {
        name: 'Sushi House',
        cuisine: 'Japanese',
        description: 'Fresh sushi and Japanese cuisine',
        rating: 4.7,
        deliveryTime: 40,
        deliveryFee: 30,
        menu: [
          { name: 'Salmon Sushi Roll', description: 'Fresh salmon sushi roll', price: 399, category: 'Sushi' },
          { name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 349, category: 'Main Course' },
          { name: 'Miso Soup', description: 'Traditional Japanese soup', price: 149, category: 'Soup' }
        ]
      },
      {
        name: 'Curry Express',
        cuisine: 'Indian',
        description: 'Authentic Indian curries and biryanis',
        rating: 4.6,
        deliveryTime: 35,
        deliveryFee: 25,
        menu: [
          { name: 'Butter Chicken', description: 'Creamy tomato-based curry', price: 299, category: 'Curry' },
          { name: 'Chicken Biryani', description: 'Fragrant rice with spiced chicken', price: 349, category: 'Biryani' },
          { name: 'Naan Bread', description: 'Fresh baked naan', price: 49, category: 'Bread' }
        ]
      }
    ];

    for (const restaurant of restaurants) {
      await Restaurant.findOneAndUpdate(
        { name: restaurant.name },
        restaurant,
        { upsert: true, new: true }
      );
    }

    // Seed Grocery Items
    const groceries = [
      { name: 'Milk', category: 'Dairy', price: 50, unit: 'liter', stock: 100, description: 'Fresh whole milk' },
      { name: 'Bread', category: 'Bakery', price: 30, unit: 'pack', stock: 50, description: 'White bread' },
      { name: 'Eggs', category: 'Dairy', price: 60, unit: 'dozen', stock: 75, description: 'Farm fresh eggs' },
      { name: 'Rice', category: 'Grains', price: 80, unit: 'kg', stock: 40, description: 'Basmati rice' },
      { name: 'Tomatoes', category: 'Vegetables', price: 40, unit: 'kg', stock: 60, description: 'Fresh tomatoes' },
      { name: 'Onions', category: 'Vegetables', price: 35, unit: 'kg', stock: 55, description: 'Fresh onions' },
      { name: 'Potatoes', category: 'Vegetables', price: 30, unit: 'kg', stock: 70, description: 'Fresh potatoes' },
      { name: 'Bananas', category: 'Fruits', price: 50, unit: 'kg', stock: 45, description: 'Fresh bananas' },
      { name: 'Apples', category: 'Fruits', price: 120, unit: 'kg', stock: 35, description: 'Fresh red apples' },
      { name: 'Chicken', category: 'Meat', price: 200, unit: 'kg', stock: 25, description: 'Fresh chicken' },
      { name: 'Yogurt', category: 'Dairy', price: 45, unit: 'pack', stock: 60, description: 'Plain yogurt' },
      { name: 'Cheese', category: 'Dairy', price: 150, unit: 'pack', stock: 30, description: 'Cheddar cheese' },
      { name: 'Butter', category: 'Dairy', price: 80, unit: 'pack', stock: 40, description: 'Salted butter' },
      { name: 'Orange Juice', category: 'Beverages', price: 90, unit: 'liter', stock: 50, description: 'Fresh orange juice' },
      { name: 'Coffee', category: 'Beverages', price: 250, unit: 'pack', stock: 35, description: 'Ground coffee' }
    ];

    for (const grocery of groceries) {
      await Grocery.findOneAndUpdate(
        { name: grocery.name },
        grocery,
        { upsert: true, new: true }
      );
    }

    // Seed Services
    const services = [
      {
        name: 'Home Cleaning',
        category: 'Cleaning',
        description: 'Professional home cleaning service',
        providers: [
          {
            providerId: provider._id,
            name: 'John Cleaner',
            rating: 4.8,
            experience: 5,
            price: 500,
            isAvailable: true
          }
        ]
      },
      {
        name: 'Plumbing',
        category: 'Repairs',
        description: 'Expert plumbing services',
        providers: [
          {
            providerId: provider._id,
            name: 'Mike Plumber',
            rating: 4.6,
            experience: 8,
            price: 800,
            isAvailable: true
          }
        ]
      },
      {
        name: 'Haircut',
        category: 'Beauty',
        description: 'Professional haircut and styling',
        providers: [
          {
            providerId: provider._id,
            name: 'Sarah Stylist',
            rating: 4.9,
            experience: 3,
            price: 300,
            isAvailable: true
          }
        ]
      },
      {
        name: 'Electrician',
        category: 'Repairs',
        description: 'Professional electrical services',
        providers: [
          {
            providerId: provider._id,
            name: 'Tom Electrician',
            rating: 4.7,
            experience: 10,
            price: 600,
            isAvailable: true
          }
        ]
      },
      {
        name: 'Carpenter',
        category: 'Repairs',
        description: 'Expert carpentry and furniture repair',
        providers: [
          {
            providerId: provider._id,
            name: 'Bob Carpenter',
            rating: 4.5,
            experience: 7,
            price: 700,
            isAvailable: true
          }
        ]
      },
      {
        name: 'Massage Therapy',
        category: 'Wellness',
        description: 'Relaxing massage therapy',
        providers: [
          {
            providerId: provider._id,
            name: 'Emma Therapist',
            rating: 4.9,
            experience: 4,
            price: 1000,
            isAvailable: true
          }
        ]
      }
    ];

    for (const service of services) {
      await Service.findOneAndUpdate(
        { name: service.name },
        service,
        { upsert: true, new: true }
      );
    }

    res.json({
      message: 'Test data seeded successfully',
      users: { admin: admin.email, testUser: testUser.email, provider: provider.email },
      restaurants: restaurants.length,
      groceries: groceries.length,
      services: services.length
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

