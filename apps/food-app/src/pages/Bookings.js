import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/services/bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      in_progress: '#007bff',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="bookings container">
      <h1>My Bookings</h1>
      <div className="bookings-list">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3>{booking.serviceName}</h3>
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
                  <strong>Provider:</strong> {booking.providerName}
                </div>
                <div className="booking-detail-item">
                  <strong>Scheduled:</strong> {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                </div>
                <div className="booking-detail-item">
                  <strong>Address:</strong> {booking.address}
                </div>
                <div className="booking-detail-item">
                  <strong>Amount:</strong> ₹{booking.amount.toFixed(2)}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bookings;

