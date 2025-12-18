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

    console.log('Booking request:', { serviceId, providerId, scheduledDate, scheduledTime, address });

    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (!service.providers || service.providers.length === 0) {
      return res.status(400).json({ message: 'Service has no providers available' });
    }

    let provider = null;

    // If providerId is provided and is not undefined/null/empty string, try to find the provider
    if (providerId && providerId !== 'undefined' && providerId !== 'null' && providerId !== '') {
      provider = service.providers.find(p => {
        try {
          // Try matching by providerId if it exists
          if (p.providerId && p.providerId.toString) {
            return p.providerId.toString() === String(providerId);
          }
          // Try matching by _id
          if (p._id && p._id.toString) {
            return p._id.toString() === String(providerId);
          }
        } catch (err) {
          console.error('Error matching provider:', err);
          return false;
        }
        return false;
      });
      
      // If not found by providerId, try to find by index
      if (!provider) {
        const providerIndex = parseInt(providerId);
        if (!isNaN(providerIndex) && providerIndex >= 0 && providerIndex < service.providers.length) {
          provider = service.providers[providerIndex];
        }
      }
    }
    
    // If no provider found yet, use the first available provider
    if (!provider) {
      provider = service.providers.find(p => p.isAvailable) || service.providers[0];
    }
    
    if (!provider) {
      return res.status(400).json({ message: 'Service provider not found' });
    }

    if (!provider.isAvailable) {
      return res.status(400).json({ message: 'Selected service provider is not available' });
    }

    // Ensure providerId is a valid ObjectId
    let finalProviderId = req.user._id; // Default fallback
    if (provider.providerId) {
      finalProviderId = provider.providerId;
    } else if (provider._id) {
      finalProviderId = provider._id;
    }

    const booking = new Booking({
      userId: req.user._id,
      serviceId,
      providerId: finalProviderId,
      serviceName: service.name,
      providerName: provider.name || 'Service Provider',
      scheduledDate,
      scheduledTime,
      address: address || req.user.address || 'Address not provided',
      amount: provider.price || 0,
      paymentMethod: paymentMethod || 'cash',
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.error('Booking creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// Update booking status with tracking
router.put('/bookings/:id/status', auth, checkModuleActive, async (req, res) => {
  try {
    const { status, note, providerLocation, estimatedArrival } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is admin or booking owner
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldStatus = booking.status;
    booking.status = status;
    
    if (status === 'completed') {
      booking.completedAt = new Date();
      if (booking.paymentStatus === 'pending') {
        booking.paymentStatus = 'paid';
      }
    }

    // Update tracking
    if (!booking.tracking) {
      booking.tracking = { statusHistory: [] };
    }
    
    booking.tracking.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || ''
    });

    if (providerLocation) booking.tracking.providerLocation = providerLocation;
    if (estimatedArrival) booking.tracking.estimatedArrival = estimatedArrival;

    await booking.save();

    // Create notification if status changed
    if (oldStatus !== status) {
      const { notifyBookingStatus } = require('../utils/notifications');
      await notifyBookingStatus(booking.userId, booking._id, status, {
        serviceName: booking.serviceName,
        providerName: booking.providerName
      });
    }
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

