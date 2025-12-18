import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import './ContentManagement.css';

const ContentManagement = () => {
  const [activeModule, setActiveModule] = useState('grocery'); // Grocery app only manages grocery items
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchItems();
  }, [activeModule]);

  const fetchItems = async () => {
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
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to load items');
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
    setFormData(item);
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
      alert('Failed to delete item');
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
        menu: []
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
        rating: 0
      };
    } else if (activeModule === 'services') {
      return {
        name: '',
        category: '',
        description: '',
        isActive: true,
        providers: []
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
              <input
                type="text"
                value={formData.unit || 'piece'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., kg, liter, pack"
                required
              />
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
              rows="3"
              required
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
              <p className="item-meta">Cuisine: {item.cuisine} | Delivery: {item.deliveryTime} mins</p>
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
        <div className="item-actions">
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

      {/* Module tabs hidden for grocery app - only manages grocery items */}

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
    </div>
  );
};

export default ContentManagement;

