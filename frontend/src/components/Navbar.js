import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FiBell } from 'react-icons/fi';
import Notifications from './Notifications';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchModules();
    if (isAuthenticated) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchModules = async () => {
    try {
      const res = await axios.get('/api/admin/modules');
      setModules(res.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const getActiveModules = () => {
    return modules.filter(m => m.isActive);
  };

  const activeModules = getActiveModules();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Ecommerce App
        </Link>
        <div className="navbar-menu">
          {activeModules.map(module => (
            <Link
              key={module.name}
              to={`/${module.name === 'food' ? 'food' : module.name === 'grocery' ? 'grocery' : 'services'}`}
              className="navbar-link"
            >
              {module.displayName}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link to="/orders" className="navbar-link">My Orders</Link>
              <Link to="/bookings" className="navbar-link">My Bookings</Link>
              <Link to="/wishlist" className="navbar-link">Wishlist</Link>
              <Link to="/payment-history" className="navbar-link">Payments</Link>
              <div className="notifications-wrapper">
                <button
                  className="notification-bell"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FiBell />
                  {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <Notifications onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>
              <Link to="/chat" className="navbar-link">💬 Support</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="navbar-link">Admin Panel</Link>
          )}
          {isSuperAdmin && (
            <Link to="/super-admin" className="navbar-link">Super Admin</Link>
          )}
          {isAuthenticated ? (
            <div className="navbar-user">
              <span>Hello, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

