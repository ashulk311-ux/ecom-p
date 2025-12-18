import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LazyImage from '../components/LazyImage';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import { EmptySearch } from '../components/EmptyState';
import Pagination from '../components/Pagination';
import './FoodDelivery.css';

const FoodDelivery = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const itemsPerPage = 12;

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('/api/food/restaurants');
      setAllRestaurants(res.data);
      setRestaurants(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let sorted = [...allRestaurants];
    
    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'deliveryTime':
        sorted.sort((a, b) => (a.deliveryTime || 0) - (b.deliveryTime || 0));
        break;
      case 'price':
        sorted.sort((a, b) => (a.deliveryFee || 0) - (b.deliveryFee || 0));
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }
    
    setRestaurants(sorted);
    setCurrentPage(1);
  }, [sortBy, allRestaurants]);

  if (loading) {
    return (
      <div className="food-delivery container">
        <div className="page-header">
          <h1>🍔 Food Delivery</h1>
          <p>Order from your favorite restaurants</p>
        </div>
        <div className="restaurants-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="food-delivery container">
        <div className="page-header">
          <h1>🍔 Food Delivery</h1>
          <p>Order from your favorite restaurants</p>
        </div>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 16px',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              cursor: 'pointer',
              background: 'var(--surface)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="default">Default</option>
            <option value="rating">Rating (High to Low)</option>
            <option value="deliveryTime">Delivery Time (Fastest)</option>
            <option value="price">Price (Low to High)</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>
      <div className="restaurants-grid">
        {restaurants
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map(restaurant => (
          <Link
            key={restaurant._id}
            to={`/restaurant/${restaurant._id}`}
            className="restaurant-card"
          >
            <div className="restaurant-image">
              <LazyImage
                src={restaurant.image}
                alt={restaurant.name}
                placeholder="🍽️"
                fallback="https://via.placeholder.com/300x300?text=No+Image"
              />
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
      {restaurants.length === 0 && <EmptySearch />}
      {restaurants.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(restaurants.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={restaurants.length}
        />
      )}
    </div>
  );
};

export default FoodDelivery;

