const express = require('express');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Module = require('../models/Module');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Check if services module is active
const checkModuleActive = async (req, res, next) => {
  const module = await Module.findOne({ name: 'services' });
  if (!module || !module.isActive) {
    return res.status(403).json({ message: 'Services module is currently disabled' });
  }
  next();
};

// Get all services
router.get('/services', checkModuleActive, async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }
    const services = await Service.find(query).populate('providers.providerId', 'name phone');
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service categories
router.get('/categories', checkModuleActive, async (req, res) => {
  try {
    const categories = await Service.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get service by ID
router.get('/services/:id', checkModuleActive, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('providers.providerId', 'name phone');
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/bookings', auth, checkModuleActive, async (req, res) => {
  try {
    const { serviceId, providerId, scheduledDate, scheduledTime, address, paymentMethod } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const provider = service.providers.find(p => p.providerId.toString() === providerId);
    if (!provider || !provider.isAvailable) {
      return res.status(400).json({ message: 'Service provider not available' });
    }

    const booking = new Booking({
      userId: req.user._id,
      serviceId,
      providerId,
      serviceName: service.name,
      providerName: provider.name,
      scheduledDate,
      scheduledTime,
      address: address || req.user.address,
      amount: provider.price,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user bookings
router.get('/bookings', auth, checkModuleActive, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('serviceId', 'name category')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get booking by ID
router.get('/bookings/:id', auth, checkModuleActive, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('serviceId', 'name category');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking status
router.put('/bookings/:id/status', auth, checkModuleActive, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'completed') {
      booking.completedAt = new Date();
      booking.paymentStatus = 'paid';
    }

    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add feedback
router.post('/bookings/:id/feedback', auth, checkModuleActive, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only provide feedback for completed bookings' });
    }

    booking.feedback = { rating, comment };
    await booking.save();

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

