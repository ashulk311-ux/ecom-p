import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import WishlistButton from '../components/WishlistButton';
import Reviews from '../components/Reviews';
import ProductSlider from '../components/ProductSlider';
import './GroceryDelivery.css';

const GroceryDelivery = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productSections, setProductSections] = useState([]);
  const [userSections, setUserSections] = useState([]);
  
  // Get all product IDs from sections to exclude from main grid
  const getSectionProductIds = () => {
    const allSectionProducts = [
      ...productSections.flatMap(section => section.products || []),
      ...userSections.flatMap(section => section.products || [])
    ];
    return new Set(allSectionProducts.map(product => product._id));
  };

  useEffect(() => {
    fetchData();
    loadCart();
    fetchProductSections();
  }, []);

  useEffect(() => {
    if (isAuthenticated && cart.length > 0) {
      fetchUserSections();
    }
  }, [isAuthenticated, cart]);

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        axios.get('/api/grocery/items'),
        axios.get('/api/grocery/categories')
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load grocery items');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductSections = async () => {
    try {
      const res = await axios.get('/api/product-sections/sections');
      console.log('Product sections fetched:', res.data);
      console.log('Number of sections:', res.data.length);
      if (res.data.length > 0) {
        console.log('First section:', res.data[0]);
        console.log('First section products:', res.data[0].products?.length || 0);
      }
      setProductSections(res.data);
    } catch (error) {
      console.error('Error fetching product sections:', error);
      console.error('Error response:', error.response);
    }
  };

  const fetchUserSections = async () => {
    try {
      const cartItems = cart.map(item => ({ itemId: item.itemId }));
      const token = localStorage.getItem('token');
      const config = {
        params: { cartItems: JSON.stringify(cartItems) }
      };
      
      if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
      }
      
      const res = await axios.get('/api/product-sections/sections/user', config);
      setUserSections(res.data);
    } catch (error) {
      console.error('Error fetching user sections:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const url = selectedCategory
        ? `/api/grocery/items?category=${selectedCategory}`
        : '/api/grocery/items';
      const res = await axios.get(url);
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart_grocery');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCart = (newCart) => {
    localStorage.setItem('cart_grocery', JSON.stringify(newCart));
    setCart(newCart);
  };

  const addToCart = (item) => {
    if (item.stock <= 0) {
      alert('Item is out of stock');
      return;
    }

    const existingItem = cart.find(c => c.itemId === item._id);
    let newCart;

    if (existingItem) {
      if (existingItem.quantity >= item.stock) {
        alert('Insufficient stock');
        return;
      }
      newCart = cart.map(c =>
        c.itemId === item._id
          ? { ...c, quantity: c.quantity + 1 }
          : c
      );
    } else {
      newCart = [...cart, {
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity: 1
      }];
    }

    saveCart(newCart);
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter(c => c.itemId !== itemId);
    saveCart(newCart);
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const newCart = cart.map(c =>
      c.itemId === itemId ? { ...c, quantity } : c
    );
    saveCart(newCart);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/cart', { state: { items: cart, type: 'grocery' } });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="grocery-delivery container">
      {/* <div className="page-header">
        <h1>🛒 Grocery Delivery</h1>
        <p>Get your groceries delivered in minutes</p>
      </div> */}

      <div className="grocery-content">
        <div className="categories-sidebar">
          <h3>Categories</h3>
          <button
            className={selectedCategory === '' ? 'active' : ''}
            onClick={() => setSelectedCategory('')}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="items-section" style={{ width: '100%', maxWidth: '100%', overflow: 'visible' }}>
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', borderRadius: '4px', fontSize: '12px' }}>
              <strong>Debug:</strong> Sections: {productSections.length}, User Sections: {userSections.length}
              {productSections.length > 0 && (
                <div style={{ marginTop: '5px' }}>
                  {productSections.map(s => (
                    <div key={s._id}>- {s.displayName}: {s.products?.length || 0} products</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product Sections from Backend */}
          {productSections.length > 0 ? (
            productSections.map(section => {
              const sectionProducts = section.products || [];
              if (sectionProducts.length === 0) {
                return null;
              }
              return (
                <ProductSlider
                  key={section._id}
                  title={section.displayName}
                  icon={section.icon}
                  description={section.description}
                  items={sectionProducts}
                  onAddToCart={addToCart}
                />
              );
            })
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
              Loading product sections...
            </div>
          )}

          {/* User-specific sections */}
          {userSections.length > 0 && userSections.map(section => {
            const sectionProducts = section.products || [];
            if (sectionProducts.length === 0) {
              return null;
            }
            return (
              <ProductSlider
                key={section._id}
                title={section.displayName}
                icon={section.icon}
                description={section.description}
                items={sectionProducts}
                onAddToCart={addToCart}
              />
            );
          })}

          <div className="items-grid">
            {items
              .filter(item => {
                // Exclude items that are already in any section slider
                const sectionProductIds = getSectionProductIds();
                return !sectionProductIds.has(item._id);
              })
              .map(item => (
              <div key={item._id} className="grocery-item-card" style={{ position: 'relative' }}>
                <WishlistButton
                  itemId={item._id}
                  itemType="product"
                  name={item.name}
                  image={item.image}
                  price={item.price}
                />
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">🛒</div>
                  )}
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p className="item-description">{item.description}</p>
                  <div className="item-meta">
                    <span className="price">₹{item.price}</span>
                    <span className="unit">/{item.unit}</span>
                    {item.stock > 0 ? (
                      <span className="stock">In Stock ({item.stock})</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                  {item.stock > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={() => addToCart(item)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {cart.length > 0 && (
          <div className="cart-sidebar">
            <h3>Cart ({cart.length})</h3>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.itemId} className="cart-item">
                  <div className="cart-item-info">
                    <span>{item.name}</span>
                    <span>₹{item.price} x {item.quantity}</span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Total: ₹{getTotal().toFixed(2)}</strong>
            </div>
            <button className="btn btn-success" onClick={handleCheckout}>
              Checkout
            </button>
          </div>
        )}
      </div>

      {items.length === 0 && (
        <div className="no-results">
          <p>No items available in this category.</p>
        </div>
      )}
    </div>
  );
};

export default GroceryDelivery;

