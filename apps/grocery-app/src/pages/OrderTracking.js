import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiCheckCircle, FiClock, FiTruck, FiMapPin } from 'react-icons/fi';
import './OrderTracking.css';

const OrderTracking = () => {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [id]);

  const fetchTracking = async () => {
    try {
      // Try grocery orders first, then food
      let res = await axios.get(`/api/grocery/orders/${id}/tracking`).catch(() => null);
      if (!res) {
        res = await axios.get(`/api/food/orders/${id}/tracking`).catch(() => null);
      }
      if (res) {
        setTracking(res.data);
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="status-icon" />;
      case 'confirmed': return <FiCheckCircle className="status-icon" />;
      case 'preparing': return <FiPackage className="status-icon" />;
      case 'out_for_delivery': return <FiTruck className="status-icon" />;
      case 'delivered': return <FiCheckCircle className="status-icon completed" />;
      default: return <FiClock className="status-icon" />;
    }
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return <div className="loading">Loading tracking information...</div>;
  }

  if (!tracking) {
    return <div className="error">Order not found</div>;
  }

  const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statuses.indexOf(tracking.status);

  return (
    <div className="order-tracking container">
      <h1>📦 Order Tracking</h1>
      
      <div className="tracking-card">
        <div className="order-status">
          <h2>Order #{tracking.orderId.slice(-8)}</h2>
          <div className={`status-badge ${tracking.status}`}>
            {getStatusIcon(tracking.status)}
            {getStatusLabel(tracking.status)}
          </div>
        </div>

        <div className="status-timeline">
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
                {tracking.statusHistory?.find(h => h.status === status) && (
                  <p className="timeline-note">
                    {new Date(tracking.statusHistory.find(h => h.status === status).timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {tracking.estimatedDelivery && (
          <div className="delivery-info">
            <FiClock />
            <span>Estimated Delivery: {new Date(tracking.estimatedDelivery).toLocaleString()}</span>
          </div>
        )}

        {tracking.currentLocation && (
          <div className="location-info">
            <FiMapPin />
            <span>{tracking.currentLocation}</span>
          </div>
        )}

        {tracking.deliveryPerson && (
          <div className="delivery-person">
            <h4>Delivery Person</h4>
            <p>Name: {tracking.deliveryPerson.name}</p>
            {tracking.deliveryPerson.phone && (
              <p>Phone: {tracking.deliveryPerson.phone}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;

