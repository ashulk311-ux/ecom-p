import React, { useRef } from 'react';
import WishlistButton from './WishlistButton';
import './ProductSlider.css';

const ProductSlider = ({ title, icon, items, onAddToCart, description }) => {
  const sliderRef = useRef(null);
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      const currentScroll = scrollRef.current.scrollLeft;
      const scrollWidth = scrollRef.current.scrollWidth;
      const clientWidth = scrollRef.current.clientWidth;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll > 0) {
        const newScroll = direction === 'left' 
          ? Math.max(0, currentScroll - scrollAmount)
          : Math.min(maxScroll, currentScroll + scrollAmount);
        
        scrollRef.current.scrollTo({
          left: newScroll,
          behavior: 'smooth'
        });
      }
    }
  };

  if (!items || items.length === 0) {
    console.log('ProductSlider: No items to display for', title);
    return null;
  }

  console.log('ProductSlider: Rendering', title, 'with', items.length, 'items');

  return (
    <div 
      className="product-slider-section" 
      style={{ 
        display: 'block !important', 
        visibility: 'visible !important', 
        opacity: '1 !important',
        width: '100% !important',
        minHeight: '350px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        marginBottom: '30px',
        borderRadius: '12px',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 10,
        overflow: 'visible'
      }}
    >
      <div className="slider-header" style={{ display: 'flex', visibility: 'visible', width: '100%' }}>
        <div>
          <h2 className="slider-title" style={{ display: 'flex', visibility: 'visible', color: '#333' }}>
            <span className="slider-icon">{icon || '🔥'}</span>
            {title}
          </h2>
          {description && (
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>{description}</p>
          )}
        </div>
      </div>
      <div 
        className="slider-container" 
        ref={sliderRef}
        style={{
          display: 'block',
          visibility: 'visible',
          width: '100%',
          maxWidth: '100%',
          minHeight: '300px',
          backgroundColor: '#ffffff',
          padding: '15px 60px',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Left Navigation Button */}
        <button 
          className="slider-nav-btn slider-nav-btn-left" 
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '3px solid #007bff',
            background: '#ffffff',
            color: '#007bff',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            visibility: 'visible',
            opacity: 1,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#007bff';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ffffff';
            e.target.style.color = '#007bff';
          }}
        >
          ‹
        </button>
        
        {/* Right Navigation Button */}
        <button 
          className="slider-nav-btn slider-nav-btn-right" 
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '3px solid #007bff',
            background: '#ffffff',
            color: '#007bff',
            fontSize: '28px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            visibility: 'visible',
            opacity: 1,
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#007bff';
            e.target.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ffffff';
            e.target.style.color = '#007bff';
          }}
        >
          ›
        </button>
        <div 
          className="slider-content" 
          ref={scrollRef}
          style={{
            display: 'flex',
            visibility: 'visible',
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            gap: '16px',
            padding: '10px',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            boxSizing: 'border-box',
            flexWrap: 'nowrap',
            minWidth: 0
          }}
        >
          {items.map(item => (
            <div
              key={item._id}
              className="slider-item-card"
              style={{
                minWidth: '280px',
                maxWidth: '280px',
                width: '280px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                visibility: 'visible',
                opacity: 1,
                backgroundColor: '#ffffff',
                border: '1px solid #ddd',
                borderRadius: '16px',
                padding: '10px',
                margin: '5px',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <WishlistButton
                itemId={item._id}
                itemType="product"
                name={item.name}
                image={item.image}
                price={item.price}
              />
              <div className="slider-badge">Deal</div>
              <div className="slider-item-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', borderRadius: '8px', fontSize: '48px' }}>🛒</div>
                )}
              </div>
              <div className="slider-item-info">
                <h3 className="slider-item-name">{item.name}</h3>
                {item.rating > 0 && (
                  <div className="slider-item-rating">
                    ⭐ {item.rating.toFixed(1)}
                  </div>
                )}
                <div className="slider-price-section">
                  <div className="slider-price-row">
                    <span className="slider-price">₹{item.price}</span>
                    <span className="slider-unit">/{item.unit}</span>
                    {(item.discount > 0 || item.discountAmount > 0) && (
                      <span className="slider-discount">
                        {item.discount > 0 && `${item.discount}% OFF`}
                        {item.discount > 0 && item.discountAmount > 0 && ' + '}
                        {item.discountAmount > 0 && `₹${item.discountAmount} OFF`}
                      </span>
                    )}
                  </div>
                  {item.stock > 0 ? (
                    <span className="slider-stock">In Stock</span>
                  ) : (
                    <span className="slider-out-of-stock">Out of Stock</span>
                  )}
                </div>
                {item.stock > 0 && (
                  <button
                    className="slider-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(item);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginTop: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#007bff';
                    }}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;

