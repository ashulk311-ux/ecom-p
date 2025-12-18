const express = require('express');
const Restaurant = require('../models/Restaurant');
const Grocery = require('../models/Grocery');
const Service = require('../models/Service');
const { adminAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// ==================== RESTAURANTS (FOOD MODULE) ====================

// Get all restaurants (admin view - includes inactive)
router.get('/restaurants', adminAuth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create restaurant
router.post('/restaurants', adminAuth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('cuisine').notEmpty().withMessage('Cuisine is required'),
  body('deliveryTime').isInt({ min: 0 }).withMessage('Delivery time must be a positive number'),
  body('deliveryFee').isFloat({ min: 0 }).withMessage('Delivery fee must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const restaurant = new Restaurant({
      ...req.body,
      rating: req.body.rating || 0,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update restaurant
router.put('/restaurants/:id', adminAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete restaurant
router.delete('/restaurants/:id', adminAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add menu item to restaurant
router.post('/restaurants/:id/menu', adminAuth, [
  body('name').notEmpty().withMessage('Item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.menu.push(req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update menu item
router.put('/restaurants/:id/menu/:menuId', adminAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = restaurant.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    Object.assign(menuItem, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete menu item
router.delete('/restaurants/:id/menu/:menuId', adminAuth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.menu.id(req.params.menuId).remove();
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GROCERY ITEMS ====================

// Get all grocery items (admin view)
router.get('/grocery', adminAuth, async (req, res) => {
  try {
    const items = await Grocery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create grocery item
router.post('/grocery', adminAuth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const grocery = new Grocery({
      ...req.body,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      rating: req.body.rating || 0
    });

    await grocery.save();
    res.status(201).json(grocery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update grocery item
router.put('/grocery/:id', adminAuth, async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!grocery) {
      return res.status(404).json({ message: 'Grocery item not found' });
    }

    res.json(grocery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete grocery item
router.delete('/grocery/:id', adminAuth, async (req, res) => {
  try {
    const grocery = await Grocery.findByIdAndDelete(req.params.id);
    if (!grocery) {
      return res.status(404).json({ message: 'Grocery item not found' });
    }
    res.json({ message: 'Grocery item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SERVICES ====================

// Get all services (admin view)
router.get('/services', adminAuth, async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create service
router.post('/services', adminAuth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = new Service({
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      providers: req.body.providers || []
    });

    await service.save();
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update service
router.put('/services/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
router.delete('/services/:id', adminAuth, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add provider to service
router.post('/services/:id/providers', adminAuth, [
  body('name').notEmpty().withMessage('Provider name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create a dummy ObjectId if providerId is not provided
    const mongoose = require('mongoose');
    const providerId = req.body.providerId || new mongoose.Types.ObjectId();

    service.providers.push({
      providerId: providerId,
      name: req.body.name,
      price: req.body.price,
      isAvailable: req.body.isAvailable !== undefined ? req.body.isAvailable : true,
      rating: req.body.rating || 0,
      experience: req.body.experience || 0
    });

    await service.save();
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update provider
router.put('/services/:id/providers/:providerId', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const provider = service.providers.id(req.params.providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    Object.assign(provider, req.body);
    await service.save();
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete provider
router.delete('/services/:id/providers/:providerId', adminAuth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.providers.id(req.params.providerId).remove();
    await service.save();
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

