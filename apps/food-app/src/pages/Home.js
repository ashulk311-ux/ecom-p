import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import { EmptySearch } from '../components/EmptyState';
import './FoodDelivery.css';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/api/food/restaurants');
      setAllRestaurants(res.data);
      setRestaurants(res.data);
      if (res.data.length === 0) {
        setError('No restaurants available at the moment.');
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = allRestaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(term) ||
        restaurant.cuisine.toLowerCase().includes(term) ||
        restaurant.description?.toLowerCase().includes(term)
      );
      setRestaurants(filtered);
    } else {
      setRestaurants(allRestaurants);
    }
  }, [searchTerm, allRestaurants]);

  if (loading) {
    return (
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <ErrorMessage message={error} onRetry={fetchRestaurants} />
      </div>
    );
  }

  return (
    <div className="food-delivery container">
      <div className="page-header">
        <h1>🍔 Food Delivery</h1>
        <p>Order from your favorite restaurants</p>
      </div>
      <SearchBar 
        onSearch={setSearchTerm} 
        placeholder="Search restaurants..."
      />
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
      {restaurants.length === 0 && !loading && (
        <EmptySearch searchTerm={searchTerm} />
      )}
    </div>
  );
};

export default Home;
