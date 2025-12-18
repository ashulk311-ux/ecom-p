import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiHeart } from 'react-icons/fi';
import './WishlistButton.css';

const WishlistButton = ({ itemId, itemType, name, image, price }) => {
  const { isAuthenticated } = useAuth();
  const { success, error: showError, info } = useToast();
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && itemId) {
      checkWishlist();
    }
  }, [isAuthenticated, itemId]);

  const checkWishlist = async () => {
    try {
      const res = await axios.get('/api/wishlist');
      const exists = res.data.items?.some(
        item => item.itemId === itemId && item.itemType === itemType
      );
      setInWishlist(exists);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      info('Please login to add items to wishlist');
      return;
    }

    setLoading(true);
    try {
      if (inWishlist) {
        await axios.delete(`/api/wishlist/remove/${itemId}`);
        setInWishlist(false);
        success('Removed from wishlist');
      } else {
        await axios.post('/api/wishlist/add', {
          itemId,
          itemType,
          name,
          image,
          price
        });
        setInWishlist(true);
        success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showError('Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
      onClick={toggleWishlist}
      disabled={loading}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <FiHeart className={inWishlist ? 'filled' : ''} />
    </button>
  );
};

export default React.memo(WishlistButton);

