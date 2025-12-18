import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiX, FiMenu, FiUserPlus, FiUsers } from 'react-icons/fi';
import RestaurantMenuManager from './RestaurantMenuManager';
import './ContentManagement.css';

const ContentManagement = () => {
  const [activeModule, setActiveModule] = useState('restaurants');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [providerFormData, setProviderFormData] = useState({
    name: '',
    price: 0,
    rating: 0,
    experience: 0,
    isAvailable: true
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchItems();
    }
  }, [activeModule, user, isAdmin]);

  const fetchItems = async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let endpoint = '';
      if (activeModule === 'restaurants') {
        endpoint = '/api/admin/content/restaurants';
      } else if (activeModule === 'grocery') {
        endpoint = '/api/admin/content/grocery';
      } else if (activeModule === 'services') {
        endpoint = '/api/admin/content/services';
      }

      const res = await axios.get(endpoint);
      setItems(res.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Please login as admin to manage content');
      } else {
        alert('Failed to load items');
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData(getDefaultFormData());
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      image: item.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      let endpoint = '';
      if (activeModule === 'restaurants') {
        endpoint = `/api/admin/content/restaurants/${id}`;
      } else if (activeModule === 'grocery') {
        endpoint = `/api/admin/content/grocery/${id}`;
      } else if (activeModule === 'services') {
        endpoint = `/api/admin/content/services/${id}`;
      }

      await axios.delete(endpoint);
      fetchItems();
      alert('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(error.response?.data?.message || 'Failed to delete item');
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
      setSelectedService(null);
      fetchItems();
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
      fetchItems();
      alert('Provider deleted successfully');
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert(error.response?.data?.message || 'Failed to delete provider');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (activeModule === 'restaurants') {
        endpoint = editingItem
          ? `/api/admin/content/restaurants/${editingItem._id}`
          : '/api/admin/content/restaurants';
      } else if (activeModule === 'grocery') {
        endpoint = editingItem
          ? `/api/admin/content/grocery/${editingItem._id}`
          : '/api/admin/content/grocery';
      } else if (activeModule === 'services') {
        endpoint = editingItem
          ? `/api/admin/content/services/${editingItem._id}`
          : '/api/admin/content/services';
      }

      if (editingItem) {
        await axios.put(endpoint, formData);
      } else {
        await axios.post(endpoint, formData);
      }

      setShowForm(false);
      fetchItems();
      alert(editingItem ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      console.error('Error saving item:', error);
      alert(error.response?.data?.message || 'Failed to save item');
    }
  };

  const getDefaultFormData = () => {
    if (activeModule === 'restaurants') {
      return {
        name: '',
        cuisine: '',
        description: '',
        deliveryTime: 30,
        deliveryFee: 0,
        rating: 0,
        isActive: true,
        menu: [],
        image: ''
      };
    } else if (activeModule === 'grocery') {
      return {
        name: '',
        category: '',
        description: '',
        price: 0,
        unit: 'piece',
        stock: 0,
        isAvailable: true,
        rating: 0,
        image: ''
      };
    } else if (activeModule === 'services') {
      return {
        name: '',
        category: '',
        description: '',
        isActive: true,
        providers: [],
        image: ''
      };
    }
    return {};
  };

  const renderForm = () => {
    if (activeModule === 'restaurants') {
      return (
        <>
          <div className="form-group">
            <label>Restaurant Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Cuisine *</label>
            <input
              type="text"
              value={formData.cuisine || ''}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Restaurant description..."
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Delivery Time (mins) *</label>
              <input
                type="number"
                value={formData.deliveryTime || 30}
                onChange={(e) => setFormData({ ...formData, deliveryTime: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Delivery Fee (₹) *</label>
              <input
                type="number"
                value={formData.deliveryFee || 0}
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
                value={formData.rating || 0}
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
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active (Visible to users)
            </label>
          </div>
        </>
      );
    } else if (activeModule === 'grocery') {
      return (
        <>
          <div className="form-group">
            <label>Item Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Dairy, Vegetables, Fruits"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              placeholder="Item description..."
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={formData.price || 0}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Unit *</label>
              <select
                value={formData.unit || 'piece'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required
              >
                <option value="piece">Piece</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="liter">Liter</option>
                <option value="ml">Milliliter (ml)</option>
                <option value="pack">Pack</option>
                <option value="dozen">Dozen</option>
                <option value="bunch">Bunch</option>
              </select>
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                required
                min="0"
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isAvailable !== false}
                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              />
              Available (Visible to users)
            </label>
          </div>
        </>
      );
    } else if (activeModule === 'services') {
      return (
        <>
          <div className="form-group">
            <label>Service Name *</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Cleaning, Plumbing, Beauty"
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description || ''}
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
              value={formData.image || ''}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive !== false}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Active (Visible to users)
            </label>
          </div>
          {editingItem && editingItem.providers && editingItem.providers.length > 0 && (
            <div className="form-group">
              <label>Existing Providers</label>
              <div className="providers-list-form">
                {editingItem.providers.map(provider => (
                  <div key={provider._id} className="provider-item-form">
                    <span>{provider.name} - ₹{provider.price}</span>
                    <button
                      type="button"
                      onClick={() => {
                        handleDeleteProvider(editingItem._id, provider._id);
                        setShowForm(false);
                      }}
                      className="btn-delete-small"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }
  };

  const renderItems = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    if (items.length === 0) {
      return <div className="no-items">No items found. Click "Add New" to create one.</div>;
    }

    return items.map(item => (
      <div key={item._id} className="content-item-card">
        <div className="item-header">
          <div>
            <h3>{item.name}</h3>
            {activeModule === 'restaurants' && (
              <p className="item-meta">Cuisine: {item.cuisine} | Delivery: {item.deliveryTime} mins | Menu Items: {item.menu?.length || 0}</p>
            )}
            {activeModule === 'grocery' && (
              <p className="item-meta">Category: {item.category} | Price: ₹{item.price}/{item.unit} | Stock: {item.stock}</p>
            )}
            {activeModule === 'services' && (
              <p className="item-meta">Category: {item.category} | Providers: {item.providers?.length || 0}</p>
            )}
          </div>
          <div className="item-status">
            <span className={`status-badge ${(item.isActive !== false && item.isAvailable !== false) ? 'active' : 'inactive'}`}>
              {(item.isActive !== false && item.isAvailable !== false) ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {item.description && (
          <p className="item-description">{item.description}</p>
        )}
        
        {/* Show providers for services */}
        {activeModule === 'services' && item.providers && item.providers.length > 0 && (
          <div className="providers-preview">
            <h4><FiUsers /> Providers:</h4>
            <div className="providers-list-preview">
              {item.providers.slice(0, 3).map(provider => (
                <span key={provider._id} className="provider-badge">
                  {provider.name} - ₹{provider.price}
                </span>
              ))}
              {item.providers.length > 3 && (
                <span className="provider-badge">+{item.providers.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        <div className="item-actions">
          {activeModule === 'restaurants' && (
            <button
              onClick={() => {
                setSelectedRestaurant(item);
                setShowMenuManager(true);
              }}
              className="btn-menu"
            >
              <FiMenu /> Menu ({item.menu?.length || 0})
            </button>
          )}
          {activeModule === 'services' && (
            <button
              onClick={() => handleAddProvider(item)}
              className="btn-provider"
            >
              <FiUserPlus /> Add Provider
            </button>
          )}
          <button onClick={() => handleEdit(item)} className="btn-edit">
            <FiEdit /> Edit
          </button>
          <button onClick={() => handleDelete(item._id)} className="btn-delete">
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="content-management">
      <div className="content-header">
        <h1>📦 Content Management</h1>
        <button onClick={handleAdd} className="btn-add">
          <FiPlus /> Add New
        </button>
      </div>

      <div className="module-tabs">
        <button
          className={activeModule === 'restaurants' ? 'active' : ''}
          onClick={() => setActiveModule('restaurants')}
        >
          🍔 Restaurants
        </button>
        <button
          className={activeModule === 'grocery' ? 'active' : ''}
          onClick={() => setActiveModule('grocery')}
        >
          🛒 Grocery Items
        </button>
        <button
          className={activeModule === 'services' ? 'active' : ''}
          onClick={() => setActiveModule('services')}
        >
          🔧 Services
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingItem ? 'Edit' : 'Add New'} {activeModule === 'restaurants' ? 'Restaurant' : activeModule === 'grocery' ? 'Grocery Item' : 'Service'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-close-modal">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {renderForm()}
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="content-list">
        {renderItems()}
      </div>

      {showMenuManager && selectedRestaurant && (
        <RestaurantMenuManager
          restaurant={selectedRestaurant}
          onUpdate={(updated) => {
            setItems(items.map(item => item._id === updated._id ? updated : item));
            setSelectedRestaurant(updated);
          }}
          onClose={() => {
            setShowMenuManager(false);
            setSelectedRestaurant(null);
            fetchItems();
          }}
        />
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
    </div>
  );
};

export default ContentManagement;

