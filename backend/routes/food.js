const express = require('express');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Module = require('../models/Module');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Check if food module is active
const checkModuleActive = async (req, res, next) => {
  const module = await Module.findOne({ name: 'food' });
  if (!module || !module.isActive) {
    return res.status(403).json({ message: 'Food delivery module is currently disabled' });
  }
  next();
};

// Get all restaurants
router.get('/restaurants', checkModuleActive, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true });
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get restaurant by ID
router.get('/restaurants/:id', checkModuleActive, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/orders', auth, checkModuleActive, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
    }

    const order = new Order({
      userId: req.user._id,
      moduleType: 'food',
      items,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/orders', auth, checkModuleActive, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id, moduleType: 'food' })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/orders/:id', auth, checkModuleActive, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
      moduleType: 'food'
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (for tracking)
router.put('/orders/:id/status', auth, checkModuleActive, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

