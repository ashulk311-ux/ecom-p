const Notification = require('../models/Notification');

// Create notification helper
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Create order notification
const notifyOrderStatus = async (userId, orderId, status, orderData) => {
  const statusMessages = {
    pending: 'Your order has been placed',
    confirmed: 'Your order has been confirmed',
    preparing: 'Your order is being prepared',
    out_for_delivery: 'Your order is out for delivery',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled'
  };

  return await createNotification(
    userId,
    'order',
    'Order Update',
    statusMessages[status] || 'Your order status has been updated',
    { orderId, status, ...orderData }
  );
};

// Create payment notification
const notifyPayment = async (userId, paymentId, status, amount) => {
  const messages = {
    completed: `Payment of ₹${amount} completed successfully`,
    failed: `Payment of ₹${amount} failed`,
    refunded: `Refund of ₹${amount} processed`
  };

  return await createNotification(
    userId,
    'payment',
    'Payment Update',
    messages[status] || 'Payment status updated',
    { paymentId, status, amount }
  );
};

// Create booking notification
const notifyBookingStatus = async (userId, bookingId, status, bookingData) => {
  const statusMessages = {
    pending: 'Your booking has been placed',
    confirmed: 'Your booking has been confirmed',
    in_progress: 'Service provider is on the way',
    completed: 'Your service has been completed',
    cancelled: 'Your booking has been cancelled'
  };

  return await createNotification(
    userId,
    'booking',
    'Booking Update',
    statusMessages[status] || 'Your booking status has been updated',
    { bookingId, status, ...bookingData }
  );
};

module.exports = {
  createNotification,
  notifyOrderStatus,
  notifyPayment,
  notifyBookingStatus
};



