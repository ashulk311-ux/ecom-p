const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Module = require('./models/Module');
const Restaurant = require('./models/Restaurant');
const Grocery = require('./models/Grocery');
const Service = require('./models/Service');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-app');
    console.log('Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({});
    // await Module.deleteMany({});
    // await Restaurant.deleteMany({});
    // await Grocery.deleteMany({});
    // await Service.deleteMany({});

    // Create modules
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
    console.log('Modules initialized');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        phone: '1234567890',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created: admin@example.com / admin123');
    }

    // Create test user
    const userExists = await User.findOne({ email: 'user@example.com' });
    if (!userExists) {
      const user = new User({
        name: 'Test User',
        email: 'user@example.com',
        password: 'user123',
        phone: '9876543210',
        role: 'user'
      });
      await user.save();
      console.log('Test user created: user@example.com / user123');
    }

    // Create sample restaurants
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
          { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon', price: 249, category: 'Pasta' }
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
          { name: 'French Fries', description: 'Crispy golden fries', price: 99, category: 'Sides' }
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
          { name: 'Chicken Teriyaki', description: 'Grilled chicken with teriyaki sauce', price: 349, category: 'Main Course' }
        ]
      }
    ];

    for (const restaurant of restaurants) {
      const exists = await Restaurant.findOne({ name: restaurant.name });
      if (!exists) {
        await Restaurant.create(restaurant);
      }
    }
    console.log('Sample restaurants created');

    // Create sample grocery items
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
      { name: 'Chicken', category: 'Meat', price: 200, unit: 'kg', stock: 25, description: 'Fresh chicken' }
    ];

    for (const grocery of groceries) {
      const exists = await Grocery.findOne({ name: grocery.name });
      if (!exists) {
        await Grocery.create(grocery);
      }
    }
    console.log('Sample grocery items created');

    // Create sample services
    const testUser = await User.findOne({ email: 'user@example.com' });
    if (testUser) {
      const services = [
        {
          name: 'Home Cleaning',
          category: 'Cleaning',
          description: 'Professional home cleaning service',
          providers: [
            {
              providerId: testUser._id,
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
              providerId: testUser._id,
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
              providerId: testUser._id,
              name: 'Sarah Stylist',
              rating: 4.9,
              experience: 3,
              price: 300,
              isAvailable: true
            }
          ]
        }
      ];

      for (const service of services) {
        const exists = await Service.findOne({ name: service.name });
        if (!exists) {
          await Service.create(service);
        }
      }
      console.log('Sample services created');
    }

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

