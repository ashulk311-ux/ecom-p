const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const Grocery = require('../models/Grocery');
const Service = require('../models/Service');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get reviews for restaurant
router.get('/restaurant/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    const avgRating = await Review.aggregate([
      { $match: { restaurantId: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      averageRating: avgRating[0]?.avgRating || 0,
      totalReviews: avgRating[0]?.count || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for product
router.get('/product/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    const avgRating = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      averageRating: avgRating[0]?.avgRating || 0,
      totalReviews: avgRating[0]?.count || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews for service provider
router.get('/provider/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ providerId: req.params.id })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    const avgRating = await Review.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    res.json({
      reviews,
      averageRating: avgRating[0]?.avgRating || 0,
      totalReviews: avgRating[0]?.count || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create review
router.post('/', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { restaurantId, productId, providerId, serviceId, orderId, bookingId, rating, comment, images } = req.body;

    // Check if user already reviewed (for order/booking based reviews)
    if (orderId) {
      const existing = await Review.findOne({ userId: req.user._id, orderId });
      if (existing) {
        return res.status(400).json({ message: 'You have already reviewed this order' });
      }
    }

    if (bookingId) {
      const existing = await Review.findOne({ userId: req.user._id, bookingId });
      if (existing) {
        return res.status(400).json({ message: 'You have already reviewed this booking' });
      }
    }

    const review = new Review({
      userId: req.user._id,
      userName: req.user.name,
      restaurantId: restaurantId || null,
      productId: productId || null,
      providerId: providerId || null,
      serviceId: serviceId || null,
      orderId: orderId || null,
      bookingId: bookingId || null,
      rating,
      comment: comment || '',
      images: images || [],
      verified: !!(orderId || bookingId) // Verified if based on order/booking
    });

    await review.save();

    // Update average rating
    if (restaurantId) {
      const avg = await Review.aggregate([
        { $match: { restaurantId: new mongoose.Types.ObjectId(restaurantId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: avg[0]?.avgRating || 0
      });
    }

    if (productId) {
      const avg = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      await Grocery.findByIdAndUpdate(productId, {
        rating: avg[0]?.avgRating || 0
      });
    }

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.helpful += 1;
    await review.save();

    res.json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
router.get('/user/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

