import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import './Wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await axios.get('/api/wishlist');
      setWishlist(res.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`/api/wishlist/remove/${itemId}`);
      setWishlist({
        ...wishlist,
        items: wishlist.items.filter(item => item.itemId !== itemId)
      });
      success('Item removed from wishlist');
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Failed to remove item from wishlist');
    }
  };

  const handleClearWishlist = () => {
    setShowClearDialog(true);
  };

  const clearWishlist = async () => {
    try {
      await axios.delete('/api/wishlist/clear');
      setWishlist({ ...wishlist, items: [] });
      success('Wishlist cleared');
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      showError('Failed to clear wishlist');
    }
  };

  const handleItemClick = (item) => {
    if (item.itemType === 'restaurant') {
      navigate(`/restaurant/${item.itemId}`);
    } else if (item.itemType === 'product') {
      navigate(`/grocery`);
    } else if (item.itemType === 'service') {
      navigate(`/services`);
    }
  };

  if (loading) {
    return <div className="loading">Loading wishlist...</div>;
  }

  const items = wishlist?.items || [];

  return (
    <div className="wishlist-page container">
      <div className="wishlist-header">
        <h1>
          <FiHeart /> My Wishlist
        </h1>
        {items.length > 0 && (
          <button onClick={handleClearWishlist} className="btn-clear">
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-wishlist">
          <FiHeart className="empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>Start adding items you love!</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item, index) => (
            <div key={index} className="wishlist-item">
              <div className="item-image" onClick={() => handleItemClick(item)}>
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="placeholder-image">
                    {item.itemType === 'restaurant' ? '🍽️' : item.itemType === 'product' ? '🛒' : '🔧'}
                  </div>
                )}
              </div>
              <div className="item-info">
                <h3 onClick={() => handleItemClick(item)}>{item.name}</h3>
                <p className="item-type">{item.itemType}</p>
                {item.price && (
                  <p className="item-price">₹{item.price}</p>
                )}
                <div className="item-actions">
                  <button
                    onClick={() => handleItemClick(item)}
                    className="btn-view"
                  >
                    <FiShoppingCart /> View
                  </button>
                  <button
                    onClick={() => removeItem(item.itemId)}
                    className="btn-remove"
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={clearWishlist}
        title="Clear Wishlist"
        message="Are you sure you want to clear your entire wishlist? This action cannot be undone."
        confirmLabel="Clear All"
        cancelLabel="Cancel"
        type="danger"
      />
    </div>
  );
};

export default Wishlist;

