import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { EmptyCart } from '../components/EmptyState';
import axios from 'axios';
import './Cart.css';

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();
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

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(index);
      return;
    }
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    setItems(updatedItems);
    // Update localStorage
    if (type) {
      localStorage.setItem(`cart_${type}`, JSON.stringify(updatedItems));
    }
  };

  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    // Update localStorage
    if (type) {
      localStorage.setItem(`cart_${type}`, JSON.stringify(updatedItems));
    }
    success('Item removed from cart');
  };

  const getSubtotal = () => {
    return getTotal();
  };

  const getDeliveryFee = () => {
    return 0; // Can be calculated based on distance
  };

  const getGrandTotal = () => {
    return getSubtotal() + getDeliveryFee();
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

      success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to place order';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart container">
        <EmptyCart />
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
                <p><strong>₹{item.price}</strong> per item</p>
                <div className="quantity-controls">
                  <button 
                    className="quantity-btn" 
                    onClick={() => updateQuantity(idx, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button 
                    className="quantity-btn" 
                    onClick={() => updateQuantity(idx, item.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                  <button 
                    className="quantity-btn" 
                    onClick={() => removeItem(idx)}
                    style={{ marginLeft: 'auto', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            </div>
          ))}
          <div className="cart-total-section">
            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Delivery Fee</span>
                <span>{getDeliveryFee() === 0 ? 'Free' : `₹${getDeliveryFee().toFixed(2)}`}</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span className="total-amount">₹{getGrandTotal().toFixed(2)}</span>
              </div>
            </div>
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

