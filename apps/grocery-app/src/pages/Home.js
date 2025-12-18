import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import WishlistButton from '../components/WishlistButton';
import LazyImage from '../components/LazyImage';
import AdvancedFilters from '../components/AdvancedFilters';
import ViewToggle from '../components/ViewToggle';
import Pagination from '../components/Pagination';
import { SkeletonList, SkeletonCard } from '../components/SkeletonLoader';
import { EmptySearch } from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import DealSlider from '../components/DealSlider';
import ProductSlider from '../components/ProductSlider';
import '../pages/GroceryDelivery.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    availability: 'all',
    category: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('default');
  const [view, setView] = useState('grid');
  const [showCartModal, setShowCartModal] = useState(false);
  const [productSections, setProductSections] = useState([]);
  const [userSections, setUserSections] = useState([]);
  const itemsPerPage = 12;

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
    filterItems();
  }, [selectedCategory, searchTerm, filters, allItems]);


  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        axios.get('/api/grocery/items'),
        axios.get('/api/grocery/categories')
      ]);
      setAllItems(itemsRes.data);
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
      setProductSections(res.data);
    } catch (error) {
      console.error('Error fetching product sections:', error);
    }
  };

  const fetchUserSections = async () => {
    try {
      const cartItems = cart.map(item => ({ itemId: item.itemId }));
      const res = await axios.get('/api/product-sections/sections/user', {
        params: { cartItems: JSON.stringify(cartItems) }
      });
      setUserSections(res.data);
    } catch (error) {
      console.error('Error fetching user sections:', error);
    }
  };

  const filterItems = () => {
    let filtered = [...allItems];

    // Filter by category (from filters or selectedCategory)
    const categoryFilter = filters.category !== 'all' ? filters.category : selectedCategory;
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => item.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.price <= filters.maxPrice);
    }

    // Filter by rating
    if (filters.minRating > 0) {
      filtered = filtered.filter(item => (item.rating || 0) >= filters.minRating);
    }

    // Filter by availability
    if (filters.availability === 'available') {
      filtered = filtered.filter(item => item.stock > 0 && item.isAvailable !== false);
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(item => item.stock <= 0 || item.isAvailable === false);
    }

    // Sort items
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    setItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Calculate price range from items
  const priceRange = allItems.length > 0 ? {
    min: Math.min(...allItems.map(item => item.price || 0)),
    max: Math.max(...allItems.map(item => item.price || 0))
  } : { min: 0, max: 10000 };

  // Get deal items - prioritize items with discounts, otherwise show top items
  const dealItems = useMemo(() => {
    if (!allItems || allItems.length === 0) {
      return [];
    }
    
    const itemsWithDiscounts = allItems.filter(item => 
      (item.discount > 0 || item.discountAmount > 0) && item.stock > 0
    );
    
    // If we have items with discounts, use those
    if (itemsWithDiscounts.length > 0) {
      return itemsWithDiscounts.slice(0, 10);
    }
    
    // Otherwise, show top items (by rating or stock) as "Deal of the Day"
    const topItems = allItems
      .filter(item => item.stock > 0)
      .sort((a, b) => {
        // Sort by rating first, then by stock
        if ((b.rating || 0) !== (a.rating || 0)) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return (b.stock || 0) - (a.stock || 0);
      })
      .slice(0, 10);
    
    return topItems;
  }, [allItems]);


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
    return (
      <div className="grocery-delivery container">
        {/* <div className="page-header">
          <h1>🛒 Grocery Delivery</h1>
          <p>Get your groceries delivered in minutes</p>
        </div> */}
        <div className="items-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
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

        <div className="items-section">
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <SearchBar 
                onSearch={setSearchTerm} 
                placeholder="Search grocery items..."
                suggestions={allItems}
                showSuggestions={true}
                debounceMs={300}
              />
            </div>
            <AdvancedFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              priceRange={priceRange}
              showRating={true}
              showPrice={true}
              showAvailability={true}
              showCategory={true}
              categories={categories}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 16px',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="default">Default</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </div>
          {loading ? (
            <SkeletonList count={6} />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchData} />
          ) : items.length === 0 ? (
            <EmptySearch />
          ) : (
          <>
          {/* Product Sections from Backend */}
          {productSections.map(section => (
            <ProductSlider
              key={section._id}
              title={section.displayName}
              icon={section.icon}
              description={section.description}
              items={section.products || []}
              onAddToCart={addToCart}
            />
          ))}

          {/* User-specific sections */}
          {userSections.map(section => (
            <ProductSlider
              key={section._id}
              title={section.displayName}
              icon={section.icon}
              description={section.description}
              items={section.products || []}
              onAddToCart={addToCart}
            />
          ))}

          {/* Deal of the Day Slider - Fallback if no sections from backend */}
          {productSections.length === 0 && dealItems && dealItems.length > 0 && (
            <DealSlider 
              items={dealItems} 
              onAddToCart={addToCart}
            />
          )}
          
          {/* <div className={view === 'grid' ? 'items-grid' : 'items-list'}>
            {items
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map(item => (
              <div 
                key={item._id} 
                className="grocery-item-card" 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${item._id}`)}
              >
                <WishlistButton
                  itemId={item._id}
                  itemType="product"
                  name={item.name}
                  image={item.image}
                  price={item.price}
                />
                <div className="item-image">
                  <LazyImage
                    src={item.image}
                    alt={item.name}
                    placeholder="🛒"
                    fallback="https://via.placeholder.com/300x300?text=No+Image"
                  />
                </div>
                <div className="item-info">
                  <h3>{item.name}</h3>
                  {item.rating > 0 && (
                    <div className="item-rating">
                      ⭐ {item.rating.toFixed(1)}
                    </div>
                  )}
                  <p className="item-description">{item.description}</p>
                  <div className="item-meta">
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flex: 1 }}>
                      <span className="price">₹{item.price}</span>
                      <span className="unit">/{item.unit}</span>
                      {(item.discount > 0 || item.discountAmount > 0) && (
                        <span className="item-discount">
                          {item.discount > 0 && `${item.discount}% OFF`}
                          {item.discount > 0 && item.discountAmount > 0 && ' + '}
                          {item.discountAmount > 0 && `₹${item.discountAmount} OFF`}
                        </span>
                      )}
                    </div>
                    {item.stock > 0 ? (
                      <span className="stock">In Stock (<strong>{item.stock}</strong>)</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                  {item.stock > 0 && (
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div> */}
          {/* {items.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(items.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={items.length}
            />
          )} */}
          </>
          )}
        </div>

        {cart.length > 0 && (
          <>
            <div className="cart-sidebar" onClick={() => setShowCartModal(true)}>
              <div className="cart-summary">
                <div className="cart-count">🛒 {cart.length} {cart.length === 1 ? 'item' : 'items'}</div>
                <div className="cart-total-price">₹{getTotal().toFixed(2)}</div>
              </div>
              <button className="btn btn-success" onClick={(e) => {
                e.stopPropagation();
                handleCheckout();
              }}>
                Checkout
              </button>
            </div>

            <Modal 
              isOpen={showCartModal} 
              onClose={() => setShowCartModal(false)} 
              title={`Cart (${cart.length} ${cart.length === 1 ? 'item' : 'items'})`}
              size="medium"
            >
              <div className="cart-modal-content">
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.itemId} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">₹{item.price} x {item.quantity}</span>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>-</button>
                        <span><strong>{item.quantity}</strong></span>
                        <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <strong>Total: ₹{getTotal().toFixed(2)}</strong>
                </div>
                <button className="btn btn-success btn-full" onClick={() => {
                  setShowCartModal(false);
                  handleCheckout();
                }}>
                  Proceed to Checkout
                </button>
              </div>
            </Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;

