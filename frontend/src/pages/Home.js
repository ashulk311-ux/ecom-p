import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await axios.get('/api/admin/modules');
      setModules(res.data.filter(m => m.isActive));
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const moduleRoutes = {
    food: '/food',
    grocery: '/grocery',
    services: '/services'
  };

  const moduleIcons = {
    food: '🍔',
    grocery: '🛒',
    services: '🔧'
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to Ecommerce App</h1>
        <p>Choose a service to get started</p>
      </div>
      <div className="modules-grid">
        {modules.map(module => (
          <Link
            key={module.name}
            to={moduleRoutes[module.name]}
            className="module-card"
          >
            <div className="module-icon">{moduleIcons[module.name]}</div>
            <h2>{module.displayName}</h2>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>
      {modules.length === 0 && (
        <div className="no-modules">
          <p>No active modules available at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Home;

