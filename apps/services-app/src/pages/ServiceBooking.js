import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ServiceBooking.css';

const ServiceBooking = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get('/api/services/services'),
        axios.get('/api/services/categories')
      ]);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const url = selectedCategory
        ? `/api/services/services?category=${selectedCategory}`
        : '/api/services/services';
      const res = await axios.get(url);
      setServices(res.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleServiceSelect = (service, provider) => {
    setSelectedService({ service, provider });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post('/api/services/bookings', {
        serviceId: selectedService.service._id,
        providerId: selectedService.provider.providerId,
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        address: bookingForm.address
      });

      alert('Booking confirmed!');
      navigate('/bookings');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error && !selectedService) {
    return <div className="error-message">{error}</div>;
  }

  if (selectedService) {
    return (
      <div className="service-booking container">
        <button
          className="btn btn-secondary"
          onClick={() => setSelectedService(null)}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Services
        </button>
        <div className="booking-form-card">
          <h2>Book {selectedService.service.name}</h2>
          <div className="provider-info">
            <h3>Service Provider: {selectedService.provider.name}</h3>
            <p>⭐ Rating: {selectedService.provider.rating.toFixed(1)}</p>
            <p>Experience: {selectedService.provider.experience} years</p>
            <p className="price">Price: ₹{selectedService.provider.price}</p>
          </div>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleBookingSubmit}>
            <div className="input-group">
              <label>Date</label>
              <input
                type="date"
                value={bookingForm.scheduledDate}
                onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="input-group">
              <label>Time</label>
              <input
                type="time"
                value={bookingForm.scheduledTime}
                onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Address</label>
              <textarea
                value={bookingForm.address}
                onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="service-booking container">
      <div className="page-header">
        <h1>🔧 On-Demand Services</h1>
        <p>Book professional services at your doorstep</p>
      </div>

      <div className="services-content">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          <button
            className={selectedCategory === '' ? 'active' : ''}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="services-section">
          <div className="services-grid">
            {services.map(service => (
              <div key={service._id} className="service-card">
                <div className="service-image">
                  {service.image ? (
                    <img src={service.image} alt={service.name} />
                  ) : (
                    <div className="placeholder-image">🔧</div>
                  )}
                </div>
                <div className="service-info">
                  <h3>{service.name}</h3>
                  <p className="service-category">{service.category}</p>
                  <p className="service-description">{service.description}</p>
                  <div className="providers-list">
                    <h4>Available Providers:</h4>
                    {service.providers && service.providers.length > 0 ? (
                      service.providers.map((provider, idx) => (
                        <div key={idx} className="provider-card">
                          <div className="provider-details">
                            <span className="provider-name">{provider.name}</span>
                            <span className="provider-rating">⭐ {provider.rating.toFixed(1)}</span>
                            <span className="provider-price">₹{provider.price}</span>
                          </div>
                          {provider.isAvailable ? (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleServiceSelect(service, provider)}
                            >
                              Book Now
                            </button>
                          ) : (
                            <span className="unavailable">Unavailable</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <p>No providers available</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {services.length === 0 && (
        <div className="no-results">
          <p>No services available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceBooking;

