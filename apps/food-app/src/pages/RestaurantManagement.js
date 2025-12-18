import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiMenu, FiX } from 'react-icons/fi';
import RestaurantMenuManager from './RestaurantMenuManager';
import './RestaurantManagement.css';

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    description: '',
    deliveryTime: 30,
    deliveryFee: 0,
    rating: 0,
    isActive: true,
    image: ''
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/content/restaurants');
      setRestaurants(res.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      alert('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRestaurant(null);
    setFormData({
      name: '',
      cuisine: '',
      description: '',
      deliveryTime: 30,
      deliveryFee: 0,
      rating: 0,
      isActive: true,
      image: ''
    });
    setShowForm(true);
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      description: restaurant.description || '',
      deliveryTime: restaurant.deliveryTime || 30,
      deliveryFee: restaurant.deliveryFee || 0,
      rating: restaurant.rating || 0,
      isActive: restaurant.isActive !== false,
      image: restaurant.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/content/restaurants/${id}`);
      fetchRestaurants();
      alert('Restaurant deleted successfully');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        await axios.put(`/api/admin/content/restaurants/${editingRestaurant._id}`, formData);
      } else {
        await axios.post('/api/admin/content/restaurants', formData);
      }
      setShowForm(false);
      fetchRestaurants();
      alert(editingRestaurant ? 'Restaurant updated successfully' : 'Restaurant added successfully');
    } catch (error) {
      console.error('Error saving restaurant:', error);
      alert(error.response?.data?.message || 'Failed to save restaurant');
    }
  };

  const handleManageMenu = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowMenuManager(true);
  };

  if (loading) {
    return <div className="loading">Loading restaurants...</div>;
  }

  return (
    <div className="restaurant-management">
      <div className="management-header">
        <h1>🍔 Restaurant Management</h1>
        <button onClick={handleAdd} className="btn-add">
          <FiPlus /> Add Restaurant
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingRestaurant ? 'Edit' : 'Add New'} Restaurant</h2>
              <button onClick={() => setShowForm(false)} className="btn-close-modal">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Restaurant Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Cuisine Type *</label>
                <input
                  type="text"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="e.g., Italian, Chinese, Indian"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Restaurant description..."
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
              <div className="form-row">
                <div className="form-group">
                  <label>Delivery Time (minutes) *</label>
                  <input
                    type="number"
                    value={formData.deliveryTime}
                    onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Fee (₹) *</label>
                  <input
                    type="number"
                    value={formData.deliveryFee}
                    onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
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
                  {editingRestaurant ? 'Update Restaurant' : 'Create Restaurant'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="restaurants-grid">
        {restaurants.length === 0 ? (
          <div className="no-items">
            <p>No restaurants found. Click "Add Restaurant" to create one.</p>
          </div>
        ) : (
          restaurants.map(restaurant => (
            <div key={restaurant._id} className="restaurant-card">
              {restaurant.image && (
                <div className="restaurant-image">
                  <img src={restaurant.image} alt={restaurant.name} />
                </div>
              )}
              <div className="restaurant-info">
                <div className="restaurant-header">
                  <h3>{restaurant.name}</h3>
                  <span className={`status-badge ${restaurant.isActive ? 'active' : 'inactive'}`}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="cuisine">{restaurant.cuisine}</p>
                {restaurant.description && (
                  <p className="description">{restaurant.description}</p>
                )}
                <div className="restaurant-stats">
                  <span>⭐ {restaurant.rating.toFixed(1)}</span>
                  <span>⏱️ {restaurant.deliveryTime} mins</span>
                  <span>💰 ₹{restaurant.deliveryFee}</span>
                  <span>🍽️ {restaurant.menu?.length || 0} items</span>
                </div>
                <div className="restaurant-actions">
                  <button
                    onClick={() => handleManageMenu(restaurant)}
                    className="btn-menu"
                  >
                    <FiMenu /> Manage Menu
                  </button>
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="btn-edit"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(restaurant._id)}
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

      {showMenuManager && selectedRestaurant && (
        <RestaurantMenuManager
          restaurant={selectedRestaurant}
          onUpdate={(updated) => {
            setRestaurants(restaurants.map(r => r._id === updated._id ? updated : r));
            setSelectedRestaurant(updated);
          }}
          onClose={() => {
            setShowMenuManager(false);
            setSelectedRestaurant(null);
            fetchRestaurants();
          }}
        />
      )}
    </div>
  );
};

export default RestaurantManagement;



