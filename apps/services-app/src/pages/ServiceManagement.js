import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUserPlus, FiUsers } from 'react-icons/fi';
import './ServiceManagement.css';

const ServiceManagement = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    isActive: true,
    image: ''
  });
  const [providerFormData, setProviderFormData] = useState({
    name: '',
    price: 0,
    rating: 0,
    experience: 0,
    isAvailable: true
  });

  useEffect(() => {
    if (!user || !isAdmin) {
      setError('Admin access required. Please login as admin.');
      setLoading(false);
      return;
    }
    fetchData();
    fetchServices();
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchServices();
    }
  }, [filterCategory, user, isAdmin]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/services/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    if (!user || !isAdmin) {
      setError('Admin access required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/api/admin/content/services');
      setServices(res.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load services';
      
      if (error.response?.status === 401) {
        setError('Please login as admin to access this page');
        navigate('/login');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(`Error: ${errorMessage}. Please check your connection and try again.`);
        setServices([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      isActive: true,
      image: ''
    });
    setShowForm(true);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      isActive: service.isActive !== false,
      image: service.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/content/services/${id}`);
      fetchServices();
      alert('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`/api/admin/content/services/${editingService._id}`, formData);
      } else {
        await axios.post('/api/admin/content/services', formData);
      }
      setShowForm(false);
      fetchServices();
      alert(editingService ? 'Service updated successfully' : 'Service added successfully');
    } catch (error) {
      console.error('Error saving service:', error);
      alert(error.response?.data?.message || 'Failed to save service');
    }
  };

  const handleAddProvider = (service) => {
    setSelectedService(service);
    setProviderFormData({
      name: '',
      price: 0,
      rating: 0,
      experience: 0,
      isAvailable: true
    });
    setShowProviderForm(true);
  };

  const handleProviderSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/admin/content/services/${selectedService._id}/providers`, providerFormData);
      setShowProviderForm(false);
      fetchServices();
      alert('Provider added successfully');
    } catch (error) {
      console.error('Error adding provider:', error);
      alert(error.response?.data?.message || 'Failed to add provider');
    }
  };

  const handleDeleteProvider = async (serviceId, providerId) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/content/services/${serviceId}/providers/${providerId}`);
      fetchServices();
      alert('Provider deleted successfully');
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Failed to delete provider');
    }
  };

  const filteredServices = filterCategory
    ? services.filter(service => service.category === filterCategory)
    : services;

  if (loading && !error) {
    return <div className="loading">Loading services...</div>;
  }

  if (error && !user) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (error && !isAdmin) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="service-management" style={{ position: 'relative', zIndex: 1 }}>
      <div className="management-header">
        <h1>🔧 Service Management</h1>
        <button onClick={handleAdd} className="btn-add">
          <FiPlus /> Add Service
        </button>
      </div>

      <div className="filter-section">
        <label>Filter by Category:</label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="service-count">{filteredServices.length} services</span>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingService ? 'Edit' : 'Add New'} Service</h2>
              <button onClick={() => setShowForm(false)} className="btn-close-modal">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Cleaning, Plumbing, Beauty"
                  required
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Service description..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active (Visible to users)
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProviderForm && selectedService && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>Add Provider to {selectedService.name}</h2>
              <button onClick={() => setShowProviderForm(false)} className="btn-close-modal">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleProviderSubmit}>
              <div className="form-group">
                <label>Provider Name *</label>
                <input
                  type="text"
                  value={providerFormData.name}
                  onChange={(e) => setProviderFormData({ ...providerFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={providerFormData.price}
                    onChange={(e) => setProviderFormData({ ...providerFormData, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    value={providerFormData.rating}
                    onChange={(e) => setProviderFormData({ ...providerFormData, rating: parseFloat(e.target.value) })}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    value={providerFormData.experience}
                    onChange={(e) => setProviderFormData({ ...providerFormData, experience: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={providerFormData.isAvailable}
                    onChange={(e) => setProviderFormData({ ...providerFormData, isAvailable: e.target.checked })}
                  />
                  Available
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  Add Provider
                </button>
                <button type="button" onClick={() => setShowProviderForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="services-grid">
        {filteredServices.length === 0 ? (
          <div className="no-items">
            <p>No services found. Click "Add Service" to create one.</p>
          </div>
        ) : (
          filteredServices.map(service => (
            <div key={service._id} className="service-card">
              {service.image && (
                <div className="service-image">
                  <img src={service.image} alt={service.name} />
                </div>
              )}
              <div className="service-info">
                <div className="service-header">
                  <h3>{service.name}</h3>
                  <span className={`status-badge ${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="category">{service.category}</p>
                {service.description && (
                  <p className="description">{service.description}</p>
                )}
                <div className="providers-section">
                  <div className="providers-header">
                    <h4><FiUsers /> Providers ({service.providers?.length || 0})</h4>
                    <button
                      onClick={() => handleAddProvider(service)}
                      className="btn-add-provider"
                    >
                      <FiUserPlus /> Add Provider
                    </button>
                  </div>
                  {service.providers && service.providers.length > 0 ? (
                    <div className="providers-list">
                      {service.providers.map(provider => (
                        <div key={provider._id} className="provider-item">
                          <div className="provider-details">
                            <span className="provider-name">{provider.name}</span>
                            <span className="provider-price">₹{provider.price}</span>
                            <span className="provider-rating">⭐ {provider.rating.toFixed(1)}</span>
                            {provider.experience > 0 && (
                              <span className="provider-exp">{provider.experience} yrs exp</span>
                            )}
                            <span className={`provider-status ${provider.isAvailable ? 'available' : 'unavailable'}`}>
                              {provider.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteProvider(service._id, provider._id)}
                            className="btn-delete-provider"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-providers">No providers added yet</p>
                  )}
                </div>
                <div className="service-actions">
                  <button
                    onClick={() => handleEdit(service)}
                    className="btn-edit"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="btn-delete"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;

