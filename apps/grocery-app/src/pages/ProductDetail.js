import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorMessage from '../components/ErrorMessage';
import LazyImage from '../components/LazyImage';
import WishlistButton from '../components/WishlistButton';
import Reviews from '../components/Reviews';
import axios from 'axios';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, warning } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/grocery/items/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      warning('Item is out of stock');
      return;
    }

    if (quantity > product.stock) {
      warning(`Only ${product.stock} items available in stock`);
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart_grocery') || '[]');
    const existingItem = cart.find(c => c.itemId === product._id);
    
    let newCart;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        warning(`Cannot add more. Only ${product.stock} items available in stock`);
        return;
      }
      newCart = cart.map(c =>
        c.itemId === product._id
          ? { ...c, quantity: newQuantity }
          : c
      );
    } else {
      newCart = [...cart, {
        itemId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image
      }];
    }

    localStorage.setItem('cart_grocery', JSON.stringify(newCart));
    success(`${quantity} ${product.name} added to cart!`);
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      warning(`Only ${product.stock} items available`);
      return;
    }
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="product-detail container">
        <SkeletonCard />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail container">
        <ErrorMessage message={error || 'Product not found'} onRetry={fetchProduct} />
      </div>
    );
  }

  const discountAmount = product.discountAmount || 0;
  const finalPrice = product.price - discountAmount;
  const discountPercent = product.discount ? Math.round((discountAmount / product.price) * 100) : 0;

  return (
    <div className="product-detail container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="product-content">
        <div className="product-image-section">
          <div className="product-image-wrapper">
            <LazyImage
              src={product.image}
              alt={product.name}
              placeholder="🛒"
              fallback="https://via.placeholder.com/500x500?text=No+Image"
            />
            {product.discount && discountPercent > 0 && (
              <div className="discount-badge">
                -{discountPercent}%
              </div>
            )}
            <WishlistButton
              itemId={product._id}
              itemType="product"
              name={product.name}
              image={product.image}
              price={product.price}
            />
          </div>
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          <p className="product-category">{product.category}</p>
          
          {product.rating && (
            <div className="product-rating">
              <span className="stars">⭐</span>
              <span className="rating-value">{product.rating.toFixed(1)}</span>
              {product.reviewsCount && (
                <span className="reviews-count">({product.reviewsCount} reviews)</span>
              )}
            </div>
          )}

          <div className="product-price-section">
            {product.discount && discountAmount > 0 ? (
              <>
                <div className="price-row">
                  <span className="original-price">₹{product.price.toFixed(2)}</span>
                  <span className="final-price">₹{finalPrice.toFixed(2)}</span>
                </div>
                <span className="discount-text">You save ₹{discountAmount.toFixed(2)}</span>
              </>
            ) : (
              <span className="final-price">₹{product.price.toFixed(2)}</span>
            )}
            <span className="unit">/{product.unit || 'unit'}</span>
          </div>

          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">✓ In Stock (<strong>{product.stock}</strong> available)</span>
            ) : (
              <span className="out-of-stock">✗ Out of Stock</span>
            )}
          </div>

          {product.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.stock > 0 && (
            <div className="product-actions">
              <div className="quantity-selector">
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <button className="btn btn-primary add-to-cart-btn" onClick={addToCart}>
                Add to Cart - ₹{(finalPrice * quantity).toFixed(2)}
              </button>
            </div>
          )}

          {product.stock <= 0 && (
            <button className="btn btn-secondary" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>

      <Reviews type="product" itemId={product._id} />
    </div>
  );
};

export default ProductDetail;



