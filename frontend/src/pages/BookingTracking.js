import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCheckCircle } from 'react-icons/fi';
import './BookingTracking.css';

const BookingTracking = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
    const interval = setInterval(fetchBooking, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await axios.get(`/api/services/bookings/${id}`);
      setBooking(res.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="status-icon" />;
      case 'confirmed': return <FiCheckCircle className="status-icon" />;
      case 'in_progress': return <FiUser className="status-icon" />;
      case 'completed': return <FiCheckCircle className="status-icon completed" />;
      case 'cancelled': return <FiClock className="status-icon cancelled" />;
      default: return <FiClock className="status-icon" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <div className="loading">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="error">Booking not found</div>;
  }

  const statuses = ['pending', 'confirmed', 'in_progress', 'completed'];
  const currentStatusIndex = statuses.indexOf(booking.status);

  return (
    <div className="booking-tracking container">
      <h1>📅 Booking Tracking</h1>
      
      <div className="tracking-card">
        <div className="booking-header">
          <div>
            <h2>{booking.serviceName}</h2>
            <p className="provider-name">Provider: {booking.providerName}</p>
          </div>
          <div className={`status-badge ${booking.status}`}>
            {getStatusIcon(booking.status)}
            {getStatusLabel(booking.status)}
          </div>
        </div>

        <div className="booking-info-grid">
          <div className="info-item">
            <FiCalendar />
            <div>
              <label>Date</label>
              <p>{new Date(booking.scheduledDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="info-item">
            <FiClock />
            <div>
              <label>Time</label>
              <p>{booking.scheduledTime}</p>
            </div>
          </div>
          <div className="info-item">
            <FiMapPin />
            <div>
              <label>Address</label>
              <p>{booking.address}</p>
            </div>
          </div>
          <div className="info-item">
            <FiUser />
            <div>
              <label>Amount</label>
              <p>₹{booking.amount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="status-timeline">
          <h3>Status Timeline</h3>
          {statuses.map((status, index) => (
            <div
              key={status}
              className={`timeline-item ${index <= currentStatusIndex ? 'completed' : ''} ${index === currentStatusIndex ? 'current' : ''}`}
            >
              <div className="timeline-icon">
                {getStatusIcon(status)}
              </div>
              <div className="timeline-content">
                <h4>{getStatusLabel(status)}</h4>
                {booking.tracking?.statusHistory?.find(h => h.status === status) && (
                  <p className="timeline-note">
                    {new Date(booking.tracking.statusHistory.find(h => h.status === status).timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {booking.tracking?.estimatedArrival && (
          <div className="arrival-info">
            <FiClock />
            <span>Estimated Arrival: {new Date(booking.tracking.estimatedArrival).toLocaleString()}</span>
          </div>
        )}

        {booking.tracking?.providerLocation && (
          <div className="location-info">
            <FiMapPin />
            <span>Provider Location: {booking.tracking.providerLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingTracking;



