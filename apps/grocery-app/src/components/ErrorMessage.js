import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ 
  message = 'Something went wrong', 
  onRetry, 
  retryLabel = 'Try Again',
  showRetry = true 
}) => {
  return (
    <div className="error-message-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Oops! Something went wrong</h3>
      <p className="error-text">{message}</p>
      {showRetry && onRetry && (
        <button className="btn btn-primary error-retry" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
};

export const NetworkError = ({ onRetry }) => (
  <ErrorMessage
    message="Unable to connect to the server. Please check your internet connection."
    onRetry={onRetry}
    retryLabel="Retry"
  />
);

export const NotFoundError = ({ resource = 'Item' }) => (
  <ErrorMessage
    message={`${resource} not found. It may have been removed or doesn't exist.`}
    showRetry={false}
  />
);

export const ServerError = ({ onRetry }) => (
  <ErrorMessage
    message="Server error occurred. Please try again later."
    onRetry={onRetry}
    retryLabel="Retry"
  />
);

export default ErrorMessage;

