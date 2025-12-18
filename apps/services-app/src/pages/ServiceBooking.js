import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import WishlistButton from '../components/WishlistButton';
import LazyImage from '../components/LazyImage';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import { EmptySearch } from '../components/EmptyState';
import Pagination from '../components/Pagination';
import './ServiceBooking.css';

const ServiceBooking = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const itemsPerPage = 12;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [selectedCategory, searchTerm, allServices]);

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get('/api/services/services'),
        axios.get('/api/services/categories')
      ]);
      setAllServices(servicesRes.data);
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...allServices];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term)
      );
    }

    // Sort services
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price':
        const aPrice = a.providers?.[0]?.price || 0;
        const bPrice = b.providers?.[0]?.price || 0;
        filtered.sort((a, b) => aPrice - bPrice);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    setServices(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
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
      // Use providerId if available, otherwise use _id, or omit if neither exists
      const providerId = selectedService.provider?.providerId || selectedService.provider?._id || null;
      
      const res = await axios.post('/api/services/bookings', {
        serviceId: selectedService.service._id,
        ...(providerId && { providerId }), // Only include providerId if it exists
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        address: bookingForm.address
      });

      success('Booking confirmed!');
      navigate('/bookings');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create booking';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="service-booking container">
        <div className="page-header">
          <h1>🔧 On-Demand Services</h1>
          <p>Book professional services at your convenience</p>
        </div>
        <div className="services-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error && !selectedService) {
    return (
      <div className="service-booking container">
        <div className="page-header">
          <h1>🔧 On-Demand Services</h1>
          <p>Book professional services at your convenience</p>
        </div>
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    );
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
            <div className="provider-info-content">
              <div className="provider-header-section">
                <div className="provider-avatar">
                  <FiUser />
                </div>
                <div>
                  <h3>{selectedService.provider.name}</h3>
                  <div className="provider-badges">
                    {selectedService.provider.rating && (
                      <span className="badge badge-rating">
                        <FiStar /> {selectedService.provider.rating.toFixed(1)}
                      </span>
                    )}
                    {selectedService.provider.experience && (
                      <span className="badge badge-experience">
                        <FiAward /> {selectedService.provider.experience} years
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="price-section">
              <div className="price-label">Total Price</div>
              <div className="price">₹{selectedService.provider.price}</div>
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
                <span className="summary-value">{selectedService.service.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Provider:</span>
                <span className="summary-value">{selectedService.provider.name}</span>
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
                onClick={() => setSelectedService(null)}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search services..."
                suggestions={allServices}
                showSuggestions={true}
                debounceMs={300}
              />
            </div>
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
                <option value="price">Price (Low to High)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>
          <div className="services-grid">
            {services
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(service => (
              <div 
                key={service._id} 
                className="service-card" 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => navigate(`/service/${service._id}`)}
              >
                <WishlistButton
                  itemId={service._id}
                  itemType="service"
                  name={service.name}
                  image={service.image}
                />
                <div className="service-image">
                  <LazyImage
                    src={service.image}
                    alt={service.name}
                    placeholder="🔧"
                    fallback="https://via.placeholder.com/300x300?text=No+Image"
                  />
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
                          <div className="provider-actions">
                            {provider.isAvailable ? (
                              <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleServiceSelect(service, provider);
                                }}
                              >
                                Book Now
                              </button>
                            ) : (
                              <span className="unavailable">Unavailable</span>
                            )}
                            <button
                              className="btn btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/service/${service._id}`);
                              }}
                            >
                              View Details
                            </button>
                          </div>
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
          {services.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(services.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={services.length}
            />
          )}
        </div>
      </div>

      {services.length === 0 && <EmptySearch />}
    </div>
  );
};

export default ServiceBooking;

