import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { SkeletonList } from '../components/SkeletonLoader';
import { EmptyBookings, EmptyOrders } from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import './Bookings.css';

const Bookings = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [foodOrders, setFoodOrders] = useState([]);
  const [groceryOrders, setGroceryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAll();
    } else {
      setLoading(false);
      setError('Please log in to view your bookings.');
    }
  }, [isAuthenticated]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bookingsRes, foodRes, groceryRes] = await Promise.all([
        axios.get('/api/services/bookings').catch(err => {
          console.error('Error fetching service bookings:', err);
          console.error('Status:', err.response?.status);
          console.error('Data:', err.response?.data);
          if (err.response?.status === 401) {
            setError('Please log in to view your bookings.');
          }
          return { data: [], error: err.response?.data?.message || err.message };
        }),
        axios.get('/api/food/orders').catch(err => {
          console.error('Error fetching food orders:', err);
          console.error('Status:', err.response?.status);
          console.error('Data:', err.response?.data);
          return { data: [], error: err.response?.data?.message || err.message };
        }),
        axios.get('/api/grocery/orders').catch(err => {
          console.error('Error fetching grocery orders:', err);
          console.error('Status:', err.response?.status);
          console.error('Data:', err.response?.data);
          return { data: [], error: err.response?.data?.message || err.message };
        })
      ]);
      setBookings(bookingsRes.data || []);
      setFoodOrders(foodRes.data || []);
      setGroceryOrders(groceryRes.data || []);
      
      // Log what we got
      console.log('Fetched data:', {
        bookings: bookingsRes.data?.length || 0,
        foodOrders: foodRes.data?.length || 0,
        groceryOrders: groceryRes.data?.length || 0
      });
      
      if (bookingsRes.error || foodRes.error || groceryRes.error) {
        const errors = [bookingsRes.error, foodRes.error, groceryRes.error].filter(e => e);
        if (errors.length > 0 && !error) {
          setError(errors.join('; '));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      in_progress: '#007bff',
      preparing: '#007bff',
      out_for_delivery: '#6f42c1',
      completed: '#28a745',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#666';
  };

  const getAllItems = () => {
    const all = [];
    bookings.forEach(b => all.push({ ...b, type: 'service' }));
    foodOrders.forEach(o => all.push({ ...o, type: 'food' }));
    groceryOrders.forEach(o => all.push({ ...o, type: 'grocery' }));
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const getFilteredItems = () => {
    if (activeTab === 'all') return getAllItems();
    if (activeTab === 'services') return bookings.map(b => ({ ...b, type: 'service' }));
    if (activeTab === 'food') return foodOrders.map(o => ({ ...o, type: 'food' }));
    if (activeTab === 'grocery') return groceryOrders.map(o => ({ ...o, type: 'grocery' }));
    return [];
  };

  const renderServiceBooking = (booking) => (
    <div key={booking._id} className="booking-card">
      <div className="booking-header">
        <div>
          <h3>{booking.serviceName || 'Service Booking'}</h3>
          <p className="booking-date">
            {new Date(booking.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className="booking-status"
          style={{ backgroundColor: getStatusColor(booking.status) }}
        >
          {booking.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div className="booking-details">
        <div className="booking-detail-item">
          <strong>Provider:</strong> {booking.providerName || 'N/A'}
        </div>
        <div className="booking-detail-item">
          <strong>Scheduled:</strong> {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'} at {booking.scheduledTime || 'N/A'}
        </div>
        <div className="booking-detail-item">
          <strong>Address:</strong> {booking.address || 'N/A'}
        </div>
        <div className="booking-detail-item">
          <strong>Amount:</strong> <strong>₹{booking.amount?.toFixed(2) || '0.00'}</strong>
        </div>
        {booking.feedback && (
          <div className="booking-feedback">
            <strong>Feedback:</strong>
            <div>Rating: {'⭐'.repeat(booking.feedback.rating)}</div>
            {booking.feedback.comment && (
              <div>Comment: {booking.feedback.comment}</div>
            )}
          </div>
        )}
        <div className="booking-actions">
          {booking.status !== 'cancelled' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/booking-tracking/${booking._id}`)}
            >
              Track Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderOrder = (order) => (
    <div key={order._id} className="booking-card">
      <div className="booking-header">
        <div>
          <h3>{order.type === 'food' ? '🍔 Food Order' : '🛒 Grocery Order'}</h3>
          <p className="booking-date">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className="booking-status"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      <div className="booking-details">
        <div className="booking-detail-item">
          <strong>Items:</strong> {order.items?.length || 0} item(s)
        </div>
        {order.items && order.items.length > 0 && (
          <div className="order-items">
            {order.items.map((item, idx) => (
              <div key={idx} className="order-item">
                <span>{item.name} x <strong>{item.quantity}</strong></span>
                <span><strong>₹{(item.price * item.quantity).toFixed(2)}</strong></span>
              </div>
            ))}
          </div>
        )}
        <div className="order-footer">
          <div className="order-address">
            <strong>Delivery Address:</strong> {order.deliveryAddress || 'N/A'}
          </div>
          <div className="order-total">
            <strong>Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}</strong>
          </div>
        </div>
        <div className="booking-actions">
          {order.status !== 'cancelled' && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/order-tracking/${order._id}`)}
            >
              Track Order
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="bookings container">
        <h1>My Bookings & Orders</h1>
        <div className="error-message" style={{ padding: '20px', color: '#dc3545', textAlign: 'center' }}>
          <p>Please log in to view your bookings and orders.</p>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Test user: user@example.com / user123
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bookings container">
        <h1>My Bookings & Orders</h1>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings container">
        <h1>My Bookings & Orders</h1>
        <ErrorMessage message={error} onRetry={fetchAll} />
      </div>
    );
  }

  const filteredItems = getFilteredItems();
  const totalCount = bookings.length + foodOrders.length + groceryOrders.length;

  return (
    <div className="bookings container">
      <h1>My Bookings & Orders</h1>
      <div className="bookings-tabs">
        <button
          className={activeTab === 'all' ? 'active' : ''}
          onClick={() => setActiveTab('all')}
        >
          All ({totalCount})
        </button>
        <button
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          Services ({bookings.length})
        </button>
        <button
          className={activeTab === 'food' ? 'active' : ''}
          onClick={() => setActiveTab('food')}
        >
          Food Orders ({foodOrders.length})
        </button>
        <button
          className={activeTab === 'grocery' ? 'active' : ''}
          onClick={() => setActiveTab('grocery')}
        >
          Grocery Orders ({groceryOrders.length})
        </button>
      </div>
      <div className="bookings-list">
        {filteredItems.length === 0 ? (
          activeTab === 'services' ? <EmptyBookings /> :
          activeTab === 'food' || activeTab === 'grocery' ? <EmptyOrders /> :
          <EmptyBookings />
        ) : (
          filteredItems.map(item => {
            if (item.type === 'service') {
              return renderServiceBooking(item);
            } else {
              return renderOrder(item);
            }
          })
        )}
      </div>
    </div>
  );
};

export default Bookings;

