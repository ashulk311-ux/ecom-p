import React, { useState } from 'react';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import './RestaurantMenuManager.css';

const RestaurantMenuManager = ({ restaurant, onUpdate, onClose }) => {
  const [menu, setMenu] = useState(restaurant.menu || []);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'General',
    isAvailable: true
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'General',
      isAvailable: true
    });
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm(true);
  };

  const handleDelete = async (menuId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/content/restaurants/${restaurant._id}/menu/${menuId}`);
      const updatedMenu = menu.filter(item => item._id !== menuId);
      setMenu(updatedMenu);
      onUpdate({ ...restaurant, menu: updatedMenu });
      alert('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`/api/admin/content/restaurants/${restaurant._id}/menu/${editingItem._id}`, formData);
        const updatedMenu = menu.map(item => item._id === editingItem._id ? { ...item, ...formData } : item);
        setMenu(updatedMenu);
        onUpdate({ ...restaurant, menu: updatedMenu });
      } else {
        const res = await axios.post(`/api/admin/content/restaurants/${restaurant._id}/menu`, formData);
        setMenu([...menu, res.data.menu[res.data.menu.length - 1]]);
        onUpdate(res.data);
      }
      setShowForm(false);
      alert(editingItem ? 'Menu item updated successfully' : 'Menu item added successfully');
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  return (
    <div className="menu-manager-modal">
      <div className="menu-manager-content">
        <div className="menu-manager-header">
          <h2>Manage Menu: {restaurant.name}</h2>
          <button onClick={onClose} className="btn-close">
            <FiX />
          </button>
        </div>

        <div className="menu-actions">
          <button onClick={handleAdd} className="btn-add-item">
            <FiPlus /> Add Menu Item
          </button>
        </div>

        {showForm && (
          <div className="menu-item-form">
            <h3>{editingItem ? 'Edit' : 'Add'} Menu Item</h3>
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
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
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
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  Available
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingItem ? 'Update' : 'Add'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="menu-items-list">
          {menu.length === 0 ? (
            <p className="no-items">No menu items. Click "Add Menu Item" to create one.</p>
          ) : (
            menu.map(item => (
              <div key={item._id} className="menu-item-card">
                <div className="menu-item-info">
                  <h4>{item.name}</h4>
                  {item.description && <p>{item.description}</p>}
                  <div className="menu-item-meta">
                    <span>₹{item.price}</span>
                    <span>{item.category}</span>
                    <span className={item.isAvailable ? 'available' : 'unavailable'}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                <div className="menu-item-actions">
                  <button onClick={() => handleEdit(item)} className="btn-edit">
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="btn-delete">
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantMenuManager;



