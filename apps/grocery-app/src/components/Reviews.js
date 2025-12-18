import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import './Reviews.css';

const Reviews = ({ type, itemId, orderId, bookingId }) => {
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError, info } = useToast();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [type, itemId]);

  const fetchReviews = async () => {
    try {
      let endpoint = '';
      if (type === 'restaurant') {
        endpoint = `/api/reviews/restaurant/${itemId}`;
      } else if (type === 'product') {
        endpoint = `/api/reviews/product/${itemId}`;
      } else if (type === 'provider') {
        endpoint = `/api/reviews/provider/${itemId}`;
      } else {
        return;
      }

      const res = await axios.get(endpoint);
      setReviews(res.data.reviews || []);
      setAverageRating(res.data.averageRating || 0);
      setTotalReviews(res.data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      info('Please login to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        rating: formData.rating,
        comment: formData.comment
      };

      if (type === 'restaurant') {
        reviewData.restaurantId = itemId;
      } else if (type === 'product') {
        reviewData.productId = itemId;
      } else if (type === 'provider') {
        reviewData.providerId = itemId;
      }

      if (orderId) reviewData.orderId = orderId;
      if (bookingId) reviewData.bookingId = bookingId;

      await axios.post('/api/reviews', reviewData);
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews();
      success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      showError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const markHelpful = async (reviewId) => {
    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`);
      setReviews(reviews.map(r => 
        r._id === reviewId ? { ...r, helpful: (r.helpful || 0) + 1 } : r
      ));
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-value">{averageRating.toFixed(1)}</span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(star => (
                <FiStar
                  key={star}
                  className={star <= averageRating ? 'filled' : ''}
                />
              ))}
            </div>
          </div>
          <p className="total-reviews">{totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
        </div>
        {isAuthenticated && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-write-review">
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <h3>Write a Review</h3>
          <div className="form-group">
            <label>Rating</label>
            <div className="rating-input">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, rating: star })}
                >
                  <FiStar />
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows="4"
              placeholder="Share your experience..."
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormData({ rating: 5, comment: '' });
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div>
                  <h4>{review.userName || review.userId?.name || 'Anonymous'}</h4>
                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <FiStar
                        key={star}
                        className={star <= review.rating ? 'filled' : ''}
                      />
                    ))}
                  </div>
                </div>
                <div className="review-meta">
                  {review.verified && <span className="verified-badge">✓ Verified</span>}
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
              <div className="review-footer">
                <button
                  onClick={() => markHelpful(review._id)}
                  className="btn-helpful"
                >
                  <FiThumbsUp /> Helpful ({review.helpful || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;

