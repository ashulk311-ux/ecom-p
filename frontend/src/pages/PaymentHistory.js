import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiCreditCard, FiCheckCircle, FiXCircle, FiClock, FiRefreshCw } from 'react-icons/fi';
import './PaymentHistory.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get('/api/payments/history');
      setPayments(res.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="status-icon completed" />;
      case 'failed':
        return <FiXCircle className="status-icon failed" />;
      case 'refunded':
      case 'partially_refunded':
        return <FiRefreshCw className="status-icon refunded" />;
      default:
        return <FiClock className="status-icon pending" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading payment history...</div>;
  }

  return (
    <div className="payment-history container">
      <h1>💳 Payment History</h1>
      
      {payments.length === 0 ? (
        <div className="no-payments">
          <p>No payment history found</p>
        </div>
      ) : (
        <div className="payments-list">
          {payments.map(payment => (
            <div key={payment._id} className="payment-card">
              <div className="payment-header">
                <div className="payment-icon">
                  <FiCreditCard />
                </div>
                <div className="payment-info">
                  <h3>₹{payment.amount.toFixed(2)}</h3>
                  <p className="payment-method">{payment.paymentMethod.toUpperCase()}</p>
                </div>
                <div className="payment-status">
                  {getStatusIcon(payment.paymentStatus)}
                  <span className={`status-badge ${payment.paymentStatus}`}>
                    {payment.paymentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="payment-details">
                <div className="detail-row">
                  <span>Transaction ID:</span>
                  <span className="transaction-id">{payment.transactionId || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <span>{formatDate(payment.createdAt)}</span>
                </div>
                {payment.refundAmount > 0 && (
                  <div className="detail-row refund-info">
                    <span>Refund Amount:</span>
                    <span className="refund-amount">₹{payment.refundAmount.toFixed(2)}</span>
                  </div>
                )}
                {payment.refundReason && (
                  <div className="detail-row">
                    <span>Refund Reason:</span>
                    <span>{payment.refundReason}</span>
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

export default PaymentHistory;



