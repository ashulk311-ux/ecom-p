import React from 'react';
import { FiGrid, FiList } from 'react-icons/fi';
import './ViewToggle.css';

const ViewToggle = ({ view, onViewChange }) => {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onViewChange('grid')}
        title="Grid View"
        aria-label="Grid View"
      >
        <FiGrid />
      </button>
      <button
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onViewChange('list')}
        title="List View"
        aria-label="List View"
      >
        <FiList />
      </button>
    </div>
  );
};

export default React.memo(ViewToggle);



