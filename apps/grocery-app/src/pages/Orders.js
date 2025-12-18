import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { SkeletonList } from '../components/SkeletonLoader';
import { EmptyOrders } from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import './Orders.css';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('food');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'food' ? '/api/food/orders' : '/api/grocery/orders';
      const res = await axios.get(endpoint);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#17a2b8',
      preparing: '#007bff',
      out_for_delivery: '#6f42c1',
      delivered: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return (
      <div className="orders container">
        <h1>My Orders</h1>
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="orders container">
      <h1>My Orders</h1>
      <div className="orders-tabs">
        <button
          className={activeTab === 'food' ? 'active' : ''}
          onClick={() => setActiveTab('food')}
        >
          Food Orders
        </button>
        <button
          className={activeTab === 'grocery' ? 'active' : ''}
          onClick={() => setActiveTab('grocery')}
        >
          Grocery Orders
        </button>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          orders.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className="order-status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span>{item.name} x <strong>{item.quantity}</strong></span>
                    <span><strong>₹{(item.price * item.quantity).toFixed(2)}</strong></span>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <div className="order-address">
                  <strong>Delivery Address:</strong> {order.deliveryAddress}
                </div>
                <div className="order-total">
                  <strong>Total: ₹{order.totalAmount.toFixed(2)}</strong>
                </div>
                {order.status !== 'cancelled' && (
                  <div className="order-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/order-tracking/${order._id}`)}
                    >
                      Track Order
                    </button>
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

export default Orders;

