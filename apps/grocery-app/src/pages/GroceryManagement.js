import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiX, FiPackage } from 'react-icons/fi';
import './GroceryManagement.css';

const GroceryManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: 0,
    unit: 'piece',
    stock: 0,
    isAvailable: true,
    image: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [filterCategory]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/grocery/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/content/grocery');
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to load grocery items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      price: 0,
      unit: 'piece',
      stock: 0,
      isAvailable: true,
      image: ''
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: item.price,
      unit: item.unit || 'piece',
      stock: item.stock || 0,
      isAvailable: item.isAvailable !== false,
      image: item.image || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/content/grocery/${id}`);
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
      if (editingItem) {
        await axios.put(`/api/admin/content/grocery/${editingItem._id}`, formData);
      } else {
        await axios.post('/api/admin/content/grocery', formData);
      }
      setShowForm(false);
      fetchItems();
      alert(editingItem ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      console.error('Error saving item:', error);
      alert(error.response?.data?.message || 'Failed to save item');
    }
  };

  const filteredItems = filterCategory
    ? items.filter(item => item.category === filterCategory)
    : items;

  if (loading) {
    return <div className="loading">Loading grocery items...</div>;
  }

  return (
    <div className="grocery-management">
      <div className="management-header">
        <h1>🛒 Grocery Item Management</h1>
        <button onClick={handleAdd} className="btn-add">
          <FiPlus /> Add Item
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
        <span className="item-count">{filteredItems.length} items</span>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <div className="form-header">
              <h2>{editingItem ? 'Edit' : 'Add New'} Grocery Item</h2>
              <button onClick={() => setShowForm(false)} className="btn-close-modal">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Dairy, Vegetables"
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
                  <label>Unit *</label>
                  <select
                    value={formData.unit}
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
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Item description..."
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
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stock}
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
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  />
                  Available (Visible to users)
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="items-grid">
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <p>No items found. Click "Add Item" to create one.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item._id} className="item-card">
              {item.image && (
                <div className="item-image">
                  <img src={item.image} alt={item.name} />
                </div>
              )}
              <div className="item-info">
                <div className="item-header">
                  <h3>{item.name}</h3>
                  <span className={`status-badge ${item.isAvailable ? 'active' : 'inactive'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="category">{item.category}</p>
                {item.description && (
                  <p className="description">{item.description}</p>
                )}
                <div className="item-stats">
                  <span className="price">₹{item.price.toFixed(2)}</span>
                  <span className="unit">/{item.unit}</span>
                  <span className={`stock ${item.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    <FiPackage /> {item.stock} in stock
                  </span>
                </div>
                <div className="item-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="btn-edit"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
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

export default GroceryManagement;



