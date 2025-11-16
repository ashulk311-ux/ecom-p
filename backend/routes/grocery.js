const express = require('express');
const Grocery = require('../models/Grocery');
const Order = require('../models/Order');
const Module = require('../models/Module');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Check if grocery module is active
const checkModuleActive = async (req, res, next) => {
  const module = await Module.findOne({ name: 'grocery' });
  if (!module || !module.isActive) {
    return res.status(403).json({ message: 'Grocery delivery module is currently disabled' });
  }
  next();
};

// Get all grocery items
router.get('/items', checkModuleActive, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isAvailable: true };
    if (category) {
      query.category = category;
    }
    const items = await Grocery.find(query);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grocery categories
router.get('/categories', checkModuleActive, async (req, res) => {
  try {
    const categories = await Grocery.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grocery item by ID
router.get('/items/:id', checkModuleActive, async (req, res) => {
  try {
    const item = await Grocery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
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

    // Check stock availability
    for (const item of items) {
      const groceryItem = await Grocery.findById(item.itemId);
      if (!groceryItem || groceryItem.stock < item.quantity) {
        return res.status(400).json({ 
          message: `${item.name} is out of stock or insufficient quantity` 
        });
      }
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
    }

    const order = new Order({
      userId: req.user._id,
      moduleType: 'grocery',
      items,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    // Update stock
    for (const item of items) {
      await Grocery.findByIdAndUpdate(item.itemId, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/orders', auth, checkModuleActive, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id, moduleType: 'grocery' })
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
      moduleType: 'grocery'
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

// Update order status
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

