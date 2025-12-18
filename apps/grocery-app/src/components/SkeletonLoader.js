import React from 'react';
import './SkeletonLoader.css';

export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-line skeleton-text short"></div>
        <div className="skeleton-footer">
          <div className="skeleton-line skeleton-badge"></div>
          <div className="skeleton-line skeleton-badge"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-list-item">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-list-content">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-text"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonText = ({ lines = 3, width = '100%' }) => {
  return (
    <div className="skeleton-text-container">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-line skeleton-text"
          style={{ width: index === lines - 1 ? '60%' : width }}
        ></div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="skeleton-line skeleton-header"></div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton-line skeleton-cell"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonCard;

