import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search...",
  suggestions = [],
  onSuggestionSelect = null,
  debounceMs = 300,
  showSuggestions = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Debounce search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    // Filter suggestions
    if (showSuggestions && suggestions.length > 0 && searchTerm) {
      const filtered = suggestions.filter(item => {
        const searchLower = searchTerm.toLowerCase();
        const name = (item.name || item.title || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        return name.includes(searchLower) || description.includes(searchLower);
      }).slice(0, 5); // Limit to 5 suggestions
      setFilteredSuggestions(filtered);
      setShowSuggestionsList(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestionsList(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, suggestions, showSuggestions, debounceMs, onSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestionsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    setShowSuggestionsList(false);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSuggestionClick = (suggestion) => {
    const suggestionText = suggestion.name || suggestion.title || '';
    setSearchTerm(suggestionText);
    setShowSuggestionsList(false);
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    } else {
      onSearch(suggestionText);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    setShowSuggestionsList(false);
  };

  return (
    <div className="search-bar-wrapper" ref={searchRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => {
              if (showSuggestions && filteredSuggestions.length > 0) {
                setShowSuggestionsList(true);
              }
            }}
            className="search-input"
            autoComplete="off"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>
      </form>
      
      {showSuggestions && showSuggestionsList && filteredSuggestions.length > 0 && (
        <div className="search-suggestions" ref={suggestionsRef}>
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <FiSearch className="suggestion-icon" />
              <div className="suggestion-content">
                <div className="suggestion-name">
                  {suggestion.name || suggestion.title}
                </div>
                {suggestion.description && (
                  <div className="suggestion-description">
                    {suggestion.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
