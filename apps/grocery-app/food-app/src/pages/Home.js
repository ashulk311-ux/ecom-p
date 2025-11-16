import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './FoodDelivery.css';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/api/food/restaurants');
      setRestaurants(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading restaurants...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="food-delivery container">
      <div className="page-header">
        <h1>🍔 Food Delivery</h1>
        <p>Order from your favorite restaurants</p>
      </div>
      <div className="restaurants-grid">
        {restaurants.map(restaurant => (
          <Link
            key={restaurant._id}
            to={`/restaurant/${restaurant._id}`}
            className="restaurant-card"
          >
            <div className="restaurant-image">
              {restaurant.image ? (
                <img src={restaurant.image} alt={restaurant.name} />
              ) : (
                <div className="placeholder-image">🍽️</div>
              )}
            </div>
            <div className="restaurant-info">
              <h3>{restaurant.name}</h3>
              <p className="cuisine">{restaurant.cuisine}</p>
              <div className="restaurant-meta">
                <span className="rating">⭐ {restaurant.rating.toFixed(1)}</span>
                <span className="delivery-time">{restaurant.deliveryTime} mins</span>
                <span className="delivery-fee">
                  {restaurant.deliveryFee === 0 ? 'Free' : `₹${restaurant.deliveryFee}`}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {restaurants.length === 0 && (
        <div className="no-results">
          <p>No restaurants available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Home;
