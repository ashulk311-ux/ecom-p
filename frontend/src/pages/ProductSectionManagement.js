import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiEdit, FiTrash2, FiPlus, FiX, FiArrowUp, FiArrowDown, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Modal from '../components/Modal';
import './ProductSectionManagement.css';

const ProductSectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    icon: '🔥',
    description: '',
    filterCriteria: {
      type: 'manual',
      category: '',
      minDiscount: 0,
      maxPrice: 0,
      minRating: 0,
      sortBy: 'price',
      limit: 10
    },
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, productsRes] = await Promise.all([
        axios.get('/api/product-sections/admin/sections'),
        axios.get('/api/grocery/items')
      ]);
      setSections(sectionsRes.data);
      setAllProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSection(null);
    setFormData({
      displayName: '',
      icon: '🔥',
      description: '',
      filterCriteria: {
        type: 'manual',
        category: '',
        minDiscount: 0,
        maxPrice: 0,
        minRating: 0,
        sortBy: 'price',
        limit: 10
      },
      displayOrder: sections.length,
      isActive: true
    });
    setShowForm(true);
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setFormData({
      displayName: section.displayName,
      icon: section.icon,
      description: section.description || '',
      filterCriteria: section.filterCriteria || {
        type: 'manual',
        category: '',
        minDiscount: 0,
        maxPrice: 0,
        minRating: 0,
        sortBy: 'price',
        limit: 10
      },
      displayOrder: section.displayOrder,
      isActive: section.isActive
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      if (editingSection) {
        await axios.put(`/api/product-sections/admin/sections/${editingSection._id}`, formData);
      } else {
        await axios.post('/api/product-sections/admin/sections', formData);
      }
      await fetchData();
      setShowForm(false);
      setEditingSection(null);
      alert('Section saved successfully');
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    
    try {
      await axios.delete(`/api/product-sections/admin/sections/${id}`);
      await fetchData();
      alert('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section');
    }
  };

  const handleToggleActive = async (section) => {
    try {
      await axios.put(`/api/product-sections/admin/sections/${section._id}`, {
        isActive: !section.isActive
      });
      await fetchData();
    } catch (error) {
      console.error('Error toggling section:', error);
      alert('Failed to toggle section');
    }
  };

  const handleManageProducts = (section) => {
    setSelectedSection(section);
    setShowProductSelector(true);
  };

  const handleUpdateProducts = async (productIds) => {
    try {
      await axios.put(`/api/product-sections/admin/sections/${selectedSection._id}/products`, {
        productIds
      });
      await fetchData();
      setShowProductSelector(false);
      setSelectedSection(null);
      alert('Products updated successfully');
    } catch (error) {
      console.error('Error updating products:', error);
      alert('Failed to update products');
    }
  };

  const handleMoveOrder = async (section, direction) => {
    const currentIndex = sections.findIndex(s => s._id === section._id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    const temp = newSections[currentIndex].displayOrder;
    newSections[currentIndex].displayOrder = newSections[newIndex].displayOrder;
    newSections[newIndex].displayOrder = temp;

    try {
      await Promise.all([
        axios.put(`/api/product-sections/admin/sections/${newSections[currentIndex]._id}`, {
          displayOrder: newSections[currentIndex].displayOrder
        }),
        axios.put(`/api/product-sections/admin/sections/${newSections[newIndex]._id}`, {
          displayOrder: newSections[newIndex].displayOrder
        })
      ]);
      await fetchData();
    } catch (error) {
      console.error('Error moving section:', error);
      alert('Failed to move section');
    }
  };

  if (loading) {
    return <div className="loading">Loading sections...</div>;
  }

  return (
    <div className="product-section-management">
      <div className="section-header">
        <h2>Product Sections Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          <FiPlus /> Add New Section
        </button>
      </div>

      <div className="sections-list">
        {sections.map((section, index) => (
          <div key={section._id} className={`section-card ${!section.isActive ? 'inactive' : ''}`}>
            <div className="section-info">
              <div className="section-header-info">
                <span className="section-icon">{section.icon}</span>
                <div>
                  <h3>{section.displayName}</h3>
                  <p className="section-description">{section.description || 'No description'}</p>
                  <div className="section-meta">
                    <span className="section-type">Type: {section.filterCriteria?.type || 'manual'}</span>
                    <span className="section-products">Products: {section.productIds?.length || 0}</span>
                    <span className="section-order">Order: {section.displayOrder}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="section-actions">
              <button
                className="btn btn-icon"
                onClick={() => handleMoveOrder(section, 'up')}
                disabled={index === 0}
                title="Move up"
              >
                <FiArrowUp />
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handleMoveOrder(section, 'down')}
                disabled={index === sections.length - 1}
                title="Move down"
              >
                <FiArrowDown />
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handleToggleActive(section)}
                title={section.isActive ? 'Disable' : 'Enable'}
              >
                {section.isActive ? <FiToggleRight /> : <FiToggleLeft />}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleManageProducts(section)}
              >
                Manage Products
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleEdit(section)}
              >
                <FiEdit /> Edit
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDelete(section._id)}
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Section Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingSection(null);
        }}
        title={editingSection ? 'Edit Section' : 'Add New Section'}
        size="large"
      >
        <div className="section-form">
          <div className="form-group">
            <label>Display Name *</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="e.g., Deal of the Day"
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="🔥"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Section description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Filter Type *</label>
            <select
              value={formData.filterCriteria.type}
              onChange={(e) => setFormData({
                ...formData,
                filterCriteria: { ...formData.filterCriteria, type: e.target.value }
              })}
            >
              <option value="manual">Manual (Select Products)</option>
              <option value="auto">Auto (Filter by Criteria)</option>
              <option value="dynamic">Dynamic (Based on User Data)</option>
            </select>
          </div>

          {formData.filterCriteria.type === 'auto' && (
            <>
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  value={formData.filterCriteria.category}
                  onChange={(e) => setFormData({
                    ...formData,
                    filterCriteria: { ...formData.filterCriteria, category: e.target.value }
                  })}
                  placeholder="e.g., Vegetables"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Discount (%)</label>
                  <input
                    type="number"
                    value={formData.filterCriteria.minDiscount}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, minDiscount: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Max Price</label>
                  <input
                    type="number"
                    value={formData.filterCriteria.maxPrice}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, maxPrice: parseInt(e.target.value) || 0 }
                    })}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Rating</label>
                  <input
                    type="number"
                    value={formData.filterCriteria.minRating}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, minRating: parseFloat(e.target.value) || 0 }
                    })}
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                <div className="form-group">
                  <label>Sort By</label>
                  <select
                    value={formData.filterCriteria.sortBy}
                    onChange={(e) => setFormData({
                      ...formData,
                      filterCriteria: { ...formData.filterCriteria, sortBy: e.target.value }
                    })}
                  >
                    <option value="price">Price (Low to High)</option>
                    <option value="rating">Rating (High to Low)</option>
                    <option value="discount">Discount (High to Low)</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Limit (Max Products)</label>
                <input
                  type="number"
                  value={formData.filterCriteria.limit}
                  onChange={(e) => setFormData({
                    ...formData,
                    filterCriteria: { ...formData.filterCriteria, limit: parseInt(e.target.value) || 10 }
                  })}
                  min="1"
                  max="50"
                />
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSave}>
              Save Section
            </button>
          </div>
        </div>
      </Modal>

      {/* Product Selector Modal */}
      <Modal
        isOpen={showProductSelector}
        onClose={() => {
          setShowProductSelector(false);
          setSelectedSection(null);
        }}
        title={`Manage Products - ${selectedSection?.displayName}`}
        size="large"
      >
        <ProductSelector
          allProducts={allProducts}
          selectedProducts={selectedSection?.productIds || []}
          onSave={handleUpdateProducts}
          onCancel={() => {
            setShowProductSelector(false);
            setSelectedSection(null);
          }}
        />
      </Modal>
    </div>
  );
};

const ProductSelector = ({ allProducts, selectedProducts, onSave, onCancel }) => {
  const [selected, setSelected] = useState(new Set(selectedProducts.map(p => p._id || p)));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleProduct = (productId) => {
    const newSelected = new Set(selected);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelected(newSelected);
  };

  const handleSave = () => {
    onSave(Array.from(selected));
  };

  const filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-selector">
      <div className="product-selector-header">
        <p>Select products for this section ({selected.size} selected)</p>
        <div className="product-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="product-list">
        {filteredProducts.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          filteredProducts.map(product => (
            <div
              key={product._id}
              className={`product-item ${selected.has(product._id) ? 'selected' : ''}`}
              onClick={() => toggleProduct(product._id)}
            >
              <input
                type="checkbox"
                checked={selected.has(product._id)}
                onChange={() => toggleProduct(product._id)}
              />
              <div className="product-info">
                <span className="product-name">{product.name}</span>
                <span className="product-details">
                  {product.category} • ₹{product.price}/{product.unit}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="product-selector-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Products ({selected.size})
        </button>
      </div>
    </div>
  );
};

export default ProductSectionManagement;

