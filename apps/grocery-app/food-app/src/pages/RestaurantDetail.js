import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './RestaurantDetail.css';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurant();
    loadCart();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const res = await axios.get(`/api/food/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem(`cart_food_${id}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem(`cart_food_${id}`, JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (item) => {
    const existingItem = cart.find(c => c.itemId === item._id);
    let newCart;
    
    if (existingItem) {
      newCart = cart.map(c =>
        c.itemId === item._id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      );
    } else {
      newCart = [...cart, {
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    }
    
    saveCart(newCart);
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(c => c.itemId !== itemId);
    saveCart(newCart);
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const newCart = cart.map(c =>
      c.itemId === itemId ? { ...c, quantity } : c
    );
    saveCart(newCart);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/cart', { state: { items: cart, type: 'food', restaurantId: id } });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!restaurant) {
    return <div className="error">Restaurant not found</div>;
  }

  return (
    <div className="restaurant-detail container">
      <div className="restaurant-header">
        <h1>{restaurant.name}</h1>
        <p className="cuisine">{restaurant.cuisine}</p>
        <div className="restaurant-stats">
          <span>⭐ {restaurant.rating.toFixed(1)}</span>
          <span>{restaurant.deliveryTime} mins</span>
          <span>{restaurant.deliveryFee === 0 ? 'Free delivery' : `₹${restaurant.deliveryFee} delivery`}</span>
        </div>
      </div>

      <div className="restaurant-content">
        <div className="menu-section">
          <h2>Menu</h2>
          {restaurant.menu && restaurant.menu.length > 0 ? (
            <div className="menu-items">
              {restaurant.menu.map(item => (
                <div key={item._id} className="menu-item">
                  <div className="menu-item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <span className="price">₹{item.price}</span>
                  </div>
                  {item.isAvailable ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(item)}
                    >
                      Add
                    </button>
                  ) : (
                    <span className="unavailable">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No menu items available</p>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar">
            <h3>Your Order</h3>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.itemId} className="cart-item">
                  <div className="cart-item-info">
                    <span>{item.name}</span>
                    <span>₹{item.price} x {item.quantity}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Total: ₹{getTotal().toFixed(2)}</strong>
            </div>
            <button className="btn btn-success" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;

