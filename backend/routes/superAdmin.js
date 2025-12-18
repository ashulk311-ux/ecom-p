const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const Grocery = require('../models/Grocery');
const Service = require('../models/Service');
const Module = require('../models/Module');
const { superAdminAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require super admin authentication
router.use(superAdminAuth);

// Dashboard Statistics
router.get('/dashboard', async (req, res) => {
  try {
    // User statistics
    const totalUsers = await User.countDocuments();
    const regularUsers = await User.countDocuments({ role: 'user' });
    const admins = await User.countDocuments({ role: 'admin' });
    const serviceProviders = await User.countDocuments({ role: 'service_provider' });
    const superAdmins = await User.countDocuments({ role: 'super_admin' });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const foodOrders = await Order.countDocuments({ moduleType: 'food' });
    const groceryOrders = await Order.countDocuments({ moduleType: 'grocery' });
    
    const orderRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const bookingRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Module statistics
    const totalRestaurants = await Restaurant.countDocuments();
    const totalGroceries = await Grocery.countDocuments();
    const totalServices = await Service.countDocuments();
    const modules = await Module.find();

    // Recent activity
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      users: {
        total: totalUsers,
        regular: regularUsers,
        admins,
        serviceProviders,
        superAdmins
      },
      orders: {
        total: totalOrders,
        food: foodOrders,
        grocery: groceryOrders,
        revenue: orderRevenue[0]?.total || 0
      },
      bookings: {
        total: totalBookings,
        revenue: bookingRevenue[0]?.total || 0
      },
      modules: {
        total: modules.length,
        active: modules.filter(m => m.isActive).length,
        list: modules
      },
      content: {
        restaurants: totalRestaurants,
        groceries: totalGroceries,
        services: totalServices
      },
      recentActivity: {
        orders: recentOrders,
        bookings: recentBookings
      },
      totalRevenue: (orderRevenue[0]?.total || 0) + (bookingRevenue[0]?.total || 0)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Management
router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'service_provider', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent removing the last super admin
    if (role !== 'super_admin') {
      const user = await User.findById(userId);
      if (user && user.role === 'super_admin') {
        const superAdminCount = await User.countDocuments({ role: 'super_admin' });
        if (superAdminCount <= 1) {
          return res.status(400).json({ message: 'Cannot remove the last super admin' });
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting the last super admin
    const user = await User.findById(userId);
    if (user && user.role === 'super_admin') {
      const superAdminCount = await User.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last super admin' });
      }
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Module Management
router.get('/modules', async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/modules/:moduleName', async (req, res) => {
  try {
    const { moduleName } = req.params;
    const { isActive, displayName, description } = req.body;

    const module = await Module.findOneAndUpdate(
      { name: moduleName },
      { isActive, displayName, description, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    res.json(module);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Food Module Management
router.get('/food/restaurants', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/food/restaurants/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Grocery Module Management
router.get('/grocery/items', async (req, res) => {
  try {
    const groceries = await Grocery.find().sort({ createdAt: -1 });
    res.json(groceries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/grocery/items/:id', async (req, res) => {
  try {
    await Grocery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grocery item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Services Module Management
router.get('/services/list', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Orders Management
router.get('/orders', async (req, res) => {
  try {
    const { moduleType, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (moduleType) query.moduleType = moduleType;
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, updatedAt: new Date() },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bookings Management
router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email')
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status, updatedAt: new Date() },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('serviceId', 'name category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



