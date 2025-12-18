import React, { useState } from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import './AdvancedFilters.css';

const AdvancedFilters = ({ 
  filters, 
  onFilterChange, 
  priceRange = { min: 0, max: 10000 },
  showRating = true,
  showPrice = true,
  showAvailability = true,
  showCategory = false,
  categories = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    minPrice: filters?.minPrice || priceRange.min,
    maxPrice: filters?.maxPrice || priceRange.max,
    minRating: filters?.minRating || 0,
    availability: filters?.availability || 'all',
    category: filters?.category || 'all',
    ...filters
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      minRating: 0,
      availability: 'all',
      category: 'all'
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFiltersCount = Object.values(localFilters).filter(
    (val) => val !== 'all' && val !== priceRange.min && val !== priceRange.max && val !== 0
  ).length;

  return (
    <div className="advanced-filters">
      <button
        className="filters-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FiFilter />
        Filters
        {activeFiltersCount > 0 && (
          <span className="filter-badge">{activeFiltersCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="filters-content">
            {showPrice && (
              <div className="filter-group">
                <label>Price Range</label>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    value={localFilters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                    min={priceRange.min}
                    max={priceRange.max}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={localFilters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    min={priceRange.min}
                    max={priceRange.max}
                  />
                </div>
                <div className="price-range-display">
                  ₹{localFilters.minPrice} - ₹{localFilters.maxPrice}
                </div>
              </div>
            )}

            {showRating && (
              <div className="filter-group">
                <label>Minimum Rating</label>
                <div className="rating-filter">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={localFilters.minRating}
                    onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                  />
                  <div className="rating-display">
                    {localFilters.minRating > 0 ? (
                      <>
                        {'⭐'.repeat(Math.floor(localFilters.minRating))}
                        {localFilters.minRating % 1 !== 0 && '½'}
                        <span> {localFilters.minRating.toFixed(1)}+</span>
                      </>
                    ) : (
                      <span>Any rating</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showAvailability && (
              <div className="filter-group">
                <label>Availability</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="availability"
                      value="all"
                      checked={localFilters.availability === 'all'}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                    />
                    All
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="availability"
                      value="available"
                      checked={localFilters.availability === 'available'}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                    />
                    Available
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="availability"
                      value="unavailable"
                      checked={localFilters.availability === 'unavailable'}
                      onChange={(e) => handleFilterChange('availability', e.target.value)}
                    />
                    Unavailable
                  </label>
                </div>
              </div>
            )}

            {showCategory && categories.length > 0 && (
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={localFilters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="filters-footer">
            <button className="btn btn-secondary" onClick={handleReset}>
              Reset Filters
            </button>
            <button className="btn btn-primary" onClick={() => setIsOpen(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;



