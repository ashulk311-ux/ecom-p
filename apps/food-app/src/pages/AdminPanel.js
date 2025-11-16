import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [modules, setModules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('modules');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/modules'),
        axios.get('/api/admin/analytics')
      ]);
      setModules(modulesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleName) => {
    try {
      const res = await axios.put(`/api/admin/modules/${moduleName}/toggle`);
      setModules(modules.map(m => m.name === moduleName ? res.data : m));
    } catch (error) {
      console.error('Error toggling module:', error);
      alert('Failed to toggle module');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-panel container">
      <h1>Admin Panel</h1>
      <div className="admin-tabs">
        <button
          className={activeTab === 'modules' ? 'active' : ''}
          onClick={() => setActiveTab('modules')}
        >
          Module Management
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'modules' && (
        <div className="modules-section">
          <h2>Module Control</h2>
          <div className="modules-list">
            {modules.map(module => (
              <div key={module.name} className="module-control-card">
                <div className="module-info">
                  <h3>{module.displayName}</h3>
                  <p>{module.description}</p>
                  <span className={`status ${module.isActive ? 'active' : 'inactive'}`}>
                    {module.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  className={`btn ${module.isActive ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => toggleModule(module.name)}
                >
                  {module.isActive ? 'Disable' : 'Enable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && analytics && (
        <div className="analytics-section">
          <h2>Analytics Dashboard</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{analytics.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-value">{analytics.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-value">{analytics.totalBookings}</p>
            </div>
            <div className="stat-card">
              <h3>Food Orders</h3>
              <p className="stat-value">{analytics.foodOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Grocery Orders</h3>
              <p className="stat-value">{analytics.groceryOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">₹{analytics.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

