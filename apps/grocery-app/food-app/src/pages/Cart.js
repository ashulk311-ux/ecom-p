import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state) {
      setItems(location.state.items || []);
      setType(location.state.type || '');
    } else {
      // Load from localStorage if no state
      const cartData = localStorage.getItem(`cart_${type}`);
      if (cartData) {
        setItems(JSON.parse(cartData));
      }
    }
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [location.state, user, type]);

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!deliveryAddress) {
      setError('Please provide a delivery address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'food' ? '/api/food/orders' : '/api/grocery/orders';
      const res = await axios.post(endpoint, {
        items,
        deliveryAddress,
        paymentMethod
      });

      // Clear cart
      localStorage.removeItem(`cart_${type}`);
      if (type === 'food' && location.state?.restaurantId) {
        localStorage.removeItem(`cart_food_${location.state.restaurantId}`);
      }

      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart container">
      <h1>Checkout</h1>
      <div className="cart-content">
        <div className="cart-items-section">
          <h2>Order Summary</h2>
          {items.map((item, idx) => (
            <div key={idx} className="cart-item-card">
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p>₹{item.price} x {item.quantity}</p>
              </div>
              <div className="cart-item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
          <div className="cart-total-section">
            <h2>Total: ₹{getTotal().toFixed(2)}</h2>
          </div>
        </div>

        <div className="checkout-form">
          <h2>Delivery Details</h2>
          {error && <div className="error">{error}</div>}
          <div className="input-group">
            <label>Delivery Address</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash on Delivery</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>
          <button
            className="btn btn-success"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;

