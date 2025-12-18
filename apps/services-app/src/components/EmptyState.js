import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EmptyState.css';

const EmptyState = ({ 
  icon = '📦', 
  title = 'Nothing here yet', 
  message = 'Get started by adding some items',
  actionLabel = 'Get Started',
  actionPath = '/',
  showAction = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {showAction && actionPath && (
        <button 
          className="btn btn-primary empty-state-action"
          onClick={() => navigate(actionPath)}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const EmptyCart = () => (
  <EmptyState
    icon="🛒"
    title="Your cart is empty"
    message="Add some items to your cart to get started"
    actionLabel="Browse Products"
    actionPath="/"
  />
);

export const EmptyOrders = () => (
  <EmptyState
    icon="📋"
    title="No orders yet"
    message="Your order history will appear here once you place an order"
    actionLabel="Start Shopping"
    actionPath="/"
  />
);

export const EmptyBookings = () => (
  <EmptyState
    icon="📅"
    title="No bookings yet"
    message="Your bookings will appear here once you book a service"
    actionLabel="Browse Services"
    actionPath="/services"
  />
);

export const EmptyWishlist = () => (
  <EmptyState
    icon="❤️"
    title="Your wishlist is empty"
    message="Save items you love to your wishlist for later"
    actionLabel="Start Shopping"
    actionPath="/"
  />
);

export const EmptySearch = ({ searchTerm }) => (
  <EmptyState
    icon="🔍"
    title={`No results for "${searchTerm}"`}
    message="Try adjusting your search or browse our categories"
    actionLabel="Browse All"
    actionPath="/"
    showAction={true}
  />
);

export default EmptyState;



