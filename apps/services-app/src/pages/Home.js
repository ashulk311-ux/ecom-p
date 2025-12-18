import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="services-home container">
      <div className="hero-section">
        <h1>🔧 On-Demand Services</h1>
        <p>Book professional services at your doorstep</p>
        <div className="hero-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/services')}
          >
            Browse Services
          </button>
          {isAuthenticated && (
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/bookings')}
            >
              My Bookings
            </button>
          )}
        </div>
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🏠</div>
          <h3>Home Services</h3>
          <p>Cleaning, plumbing, electrical, and more</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💇</div>
          <h3>Beauty & Wellness</h3>
          <p>Haircuts, massages, spa treatments</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔧</div>
          <h3>Repairs & Maintenance</h3>
          <p>Expert technicians for all your needs</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Verified Providers</h3>
          <p>All providers are verified and rated</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

