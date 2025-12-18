import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modules, setModules] = useState([]);

  useEffect(() => {
    fetchModules();
  }, []);

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

  const getActiveModules = () => {
    return modules.filter(m => m.isActive);
  };

  const activeModules = getActiveModules();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Ecommerce App
        </Link>
        <div className="navbar-menu">
          {!isAdmin && !isAdminPage && activeModules.map(module => (
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
              <Link to="/bookings" className="navbar-link">My Bookings</Link>
              <Link to="/wishlist" className="navbar-link">Wishlist</Link>
              <Link to="/chat" className="navbar-link">Chat</Link>
              <Link to="/payment-history" className="navbar-link">Payments</Link>
              <Link to="/profile" className="navbar-link">Profile</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="navbar-link">Admin Panel</Link>
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

