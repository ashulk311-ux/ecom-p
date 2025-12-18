import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import LazyImage from '../components/LazyImage';
import WishlistButton from '../components/WishlistButton';
import Reviews from '../components/Reviews';
import { FiCalendar, FiClock, FiMapPin, FiStar, FiUser, FiAward, FiX, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import './ServiceDetail.css';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, warning } = useToast();
  const [service, setService] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/services/services/${id}`);
      setService(res.data);
    } catch (error) {
      console.error('Error fetching service:', error);
      setError('Service not found');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (provider) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedProvider(provider);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const providerId = selectedProvider?.providerId || selectedProvider?._id || null;
      
      await axios.post('/api/services/bookings', {
        serviceId: service._id,
        ...(providerId && { providerId }),
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        address: bookingForm.address
      });

      success('Booking confirmed!');
      navigate('/bookings');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create booking';
      setError(errorMsg);
      warning(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="service-detail container">
        <SkeletonCard />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="service-detail container">
        <ErrorMessage message={error || 'Service not found'} onRetry={fetchService} />
      </div>
    );
  }

  const availableProviders = service.providers?.filter(p => p.isAvailable) || [];
  const allProviders = service.providers || [];

  return (
    <div className="service-detail container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="service-content">
        <div className="service-image-section">
          <div className="service-image-wrapper">
            <LazyImage
              src={service.image}
              alt={service.name}
              placeholder="🔧"
              fallback="https://via.placeholder.com/500x500?text=No+Image"
            />
            {service.discount && (
              <div className="discount-badge">
                {service.discount}% OFF
              </div>
            )}
            <WishlistButton
              itemId={service._id}
              itemType="service"
              name={service.name}
              image={service.image}
              price={service.providers?.[0]?.price || 0}
            />
          </div>
        </div>

        <div className="service-info-section">
          <h1>{service.name}</h1>
          <p className="service-category">{service.category}</p>
          
          {service.rating && (
            <div className="service-rating">
              <span className="stars">⭐</span>
              <span className="rating-value">{service.rating.toFixed(1)}</span>
              {service.reviewsCount && (
                <span className="reviews-count">({service.reviewsCount} reviews)</span>
              )}
            </div>
          )}

          {service.description && (
            <div className="service-description">
              <h3>Description</h3>
              <p>{service.description}</p>
            </div>
          )}

          <div className="providers-section">
            <h3>Available Service Providers ({availableProviders.length})</h3>
            {allProviders.length === 0 ? (
              <p className="no-providers">No providers available for this service.</p>
            ) : (
              <div className="providers-list">
                {allProviders.map((provider, idx) => (
                  <div 
                    key={idx} 
                    className={`provider-card ${!provider.isAvailable ? 'unavailable' : ''}`}
                  >
                    <div className="provider-header">
                      <div className="provider-info">
                        <h4>{provider.name || 'Service Provider'}</h4>
                        {provider.rating && (
                          <div className="provider-rating">
                            <span className="stars">⭐</span>
                            <span>{provider.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="provider-price">
                        ₹{provider.price || 0}
                      </div>
                    </div>
                    
                    {provider.experience && (
                      <p className="provider-experience">
                        Experience: <strong>{provider.experience} years</strong>
                      </p>
                    )}
                    
                    {provider.specialization && (
                      <p className="provider-specialization">
                        Specialization: {provider.specialization}
                      </p>
                    )}

                    <div className="provider-actions">
                      {provider.isAvailable ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleProviderSelect(provider)}
                        >
                          Book Now
                        </button>
                      ) : (
                        <span className="unavailable-badge">Unavailable</span>
                      )}
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/service/${id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingForm && selectedProvider && (
        <div className="booking-form-section">
          <div className="booking-form-card">
            <h2>Book {service.name}</h2>
            <div className="selected-provider-info">
              <div className="selected-provider-info-content">
                <div className="provider-header-section">
                  <div className="provider-avatar">
                    <FiUser />
                  </div>
                  <div>
                    <h3>{selectedProvider.name || 'Service Provider'}</h3>
                    <div className="provider-badges">
                      {selectedProvider.rating && (
                        <span className="badge badge-rating">
                          <FiStar /> {selectedProvider.rating?.toFixed(1) || 'N/A'}
                        </span>
                      )}
                      {selectedProvider.experience && (
                        <span className="badge badge-experience">
                          <FiAward /> {selectedProvider.experience} years
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="price-section">
                <div className="price-label">Total Price</div>
                <div className="price">₹{selectedProvider.price || 0}</div>
                <div className="price-note">Inclusive of all charges</div>
              </div>
            </div>
            {error && (
              <div className="error-message">
                <FiX className="error-icon" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleBookingSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>
                    <FiCalendar className="label-icon" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={bookingForm.scheduledDate}
                    onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <div className="input-hint">Choose your preferred date</div>
                </div>
                <div className="input-group">
                  <label>
                    <FiClock className="label-icon" />
                    Select Time
                  </label>
                  <input
                    type="time"
                    value={bookingForm.scheduledTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                    required
                  />
                  <div className="input-hint">Choose your preferred time</div>
                </div>
              </div>
              <div className="input-group">
                <label>
                  <FiMapPin className="label-icon" />
                  Service Address
                </label>
                <textarea
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                  placeholder="Enter your complete address including street, city, and postal code"
                  required
                  rows="4"
                />
                <div className="input-hint">We'll send the service provider to this address</div>
              </div>
              <div className="booking-summary">
                <div className="summary-item">
                  <span className="summary-label">Service:</span>
                  <span className="summary-value">{service.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Provider:</span>
                  <span className="summary-value">{selectedProvider.name}</span>
                </div>
                {bookingForm.scheduledDate && (
                  <div className="summary-item">
                    <span className="summary-label">Date & Time:</span>
                    <span className="summary-value">
                      {new Date(bookingForm.scheduledDate).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {bookingForm.scheduledTime || '--:--'}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowBookingForm(false);
                    setSelectedProvider(null);
                    setError(null);
                  }}
                >
                  <FiX /> Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <FiCheck /> Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Reviews type="provider" itemId={service.providers?.[0]?._id || service._id} />
    </div>
  );
};

export default ServiceDetail;

