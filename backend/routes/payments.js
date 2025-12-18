const express = require('express');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const { auth, adminAuth } = require('../middleware/auth');
const { notifyPayment } = require('../utils/notifications');

const router = express.Router();

// Get payment history for user
router.get('/history', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderId', 'moduleType status')
      .populate('bookingId', 'serviceName status');
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment details
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('orderId')
      .populate('bookingId');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment (simulated - integrate with actual gateway)
router.post('/process', auth, async (req, res) => {
  try {
    const { orderId, bookingId, paymentMethod, amount } = req.body;
    
    if (!orderId && !bookingId) {
      return res.status(400).json({ message: 'Order ID or Booking ID required' });
    }

    // Generate transaction ID (in real app, this comes from payment gateway)
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = new Payment({
      userId: req.user._id,
      orderId: orderId || null,
      bookingId: bookingId || null,
      amount,
      paymentMethod: paymentMethod || 'card',
      paymentStatus: 'completed',
      transactionId,
      completedAt: new Date()
    });

    await payment.save();

    // Update order/booking payment status
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paymentId: payment._id
      });
    }
    
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        paymentId: payment._id
      });
    }

    // Create notification
    await notifyPayment(req.user._id, payment._id, 'completed', amount);

    res.status(201).json({
      success: true,
      payment,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request refund
router.post('/:id/refund', auth, async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentStatus !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can be refunded' });
    }

    const refund = refundAmount || payment.amount;
    
    payment.refundAmount = refund;
    payment.refundReason = reason;
    payment.paymentStatus = refund === payment.amount ? 'refunded' : 'partially_refunded';
    payment.refundedAt = new Date();

    await payment.save();

    // Update order/booking status
    if (payment.orderId) {
      await Order.findByIdAndUpdate(payment.orderId, {
        status: 'cancelled',
        paymentStatus: 'refunded'
      });
    }

    if (payment.bookingId) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        status: 'cancelled',
        paymentStatus: 'refunded'
      });
    }

    // Create notification
    await notifyPayment(payment.userId, payment._id, 'refunded', refund);

    res.json({
      success: true,
      payment,
      message: 'Refund processed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all payments
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .populate('bookingId')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

