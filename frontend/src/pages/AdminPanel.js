import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingCart, FiDollarSign, FiActivity, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import ContentManagement from './ContentManagement';
import ProductSectionManagement from './ProductSectionManagement';
import './AdminPanel.css';

// Lazy load recharts to prevent blocking
let LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;
try {
  const recharts = require('recharts');
  LineChart = recharts.LineChart;
  Line = recharts.Line;
  BarChart = recharts.BarChart;
  Bar = recharts.Bar;
  PieChart = recharts.PieChart;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  ResponsiveContainer = recharts.ResponsiveContainer;
} catch (e) {
  console.warn('Recharts not available, charts will be disabled');
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminPanel = () => {
  const [modules, setModules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modulesRes, analyticsRes] = await Promise.all([
        axios.get('/api/admin/modules'),
        axios.get('/api/admin/analytics')
      ]);
      setModules(modulesRes.data || []);
      setAnalytics(analyticsRes.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty data on error so UI can still render
      setModules([]);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleName) => {
    try {
      const res = await axios.put(`/api/admin/modules/${moduleName}/toggle`);
      setModules(modules.map(m => m.name === moduleName ? res.data : m));
      fetchData(); // Refresh analytics
    } catch (error) {
      console.error('Error toggling module:', error);
      alert('Failed to toggle module');
    }
  };

  const getInsights = () => {
    if (!analytics) return [];
    
    const insights = [];
    
    // Revenue trend
    if (analytics.trends?.revenueLast7Days > 0) {
      const avgDailyRevenue = analytics.trends.revenueLast7Days / 7;
      const projectedMonthly = avgDailyRevenue * 30;
      insights.push({
        type: 'info',
        icon: <FiDollarSign />,
        title: 'Revenue Projection',
        message: `Based on last 7 days, projected monthly revenue: ₹${projectedMonthly.toFixed(2)}`
      });
    }

    // Order growth
    if (analytics.trends?.orderGrowth > 0) {
      insights.push({
        type: 'success',
        icon: <FiTrendingUp />,
        title: 'Growing Orders',
        message: `Orders increased by ${analytics.trends.orderGrowth}% in the last week`
      });
    } else if (analytics.trends?.orderGrowth < 0) {
      insights.push({
        type: 'warning',
        icon: <FiTrendingDown />,
        title: 'Declining Orders',
        message: `Orders decreased by ${Math.abs(analytics.trends.orderGrowth)}% - consider promotions`
      });
    }

    // Top module
    if (analytics.insights?.topModule) {
      insights.push({
        type: 'info',
        icon: <FiActivity />,
        title: 'Top Performer',
        message: `${analytics.insights.topModule} module is generating the most revenue`
      });
    }

    // Conversion rate
    if (analytics.insights?.conversionRate) {
      const rate = parseFloat(analytics.insights.conversionRate);
      if (rate < 10) {
        insights.push({
          type: 'warning',
          icon: <FiAlertCircle />,
          title: 'Low Conversion',
          message: `Conversion rate is ${rate}% - consider improving user experience`
        });
      } else {
        insights.push({
          type: 'success',
          icon: <FiCheckCircle />,
          title: 'Good Conversion',
          message: `Conversion rate is ${rate}% - keep up the good work!`
        });
      }
    }

    return insights;
  };

  const insights = analytics ? getInsights() : [];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div>
          <h1>Smart Admin Dashboard</h1>
          <p className="last-update">Last updated: {lastUpdate.toLocaleTimeString()}</p>
          {loading && !analytics && (
            <p style={{ color: '#4299e1', marginTop: '10px' }}>
              ⏳ Loading analytics data...
            </p>
          )}
          {!loading && !analytics && (
            <p style={{ color: '#e53e3e', marginTop: '10px' }}>
              ⚠️ No analytics data available. Make sure you're logged in as admin and the backend is running.
            </p>
          )}
        </div>
        <div className="header-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh (30s)</span>
          </label>
          <button onClick={fetchData} className="btn-refresh">
            🔄 Refresh Now
          </button>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Smart Dashboard
        </button>
        <button
          className={activeTab === 'content' ? 'active' : ''}
          onClick={() => setActiveTab('content')}
        >
          📦 Content Management
        </button>
        <button
          className={activeTab === 'modules' ? 'active' : ''}
          onClick={() => setActiveTab('modules')}
        >
          🧩 Module Management
        </button>
        <button
          className={activeTab === 'sections' ? 'active' : ''}
          onClick={() => setActiveTab('sections')}
        >
          🎯 Product Sections
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Advanced Analytics
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="smart-dashboard">
          {loading && !analytics && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading smart analytics...</p>
            </div>
          )}
          {!loading && analytics && (
            <>
              {/* Smart Insights */}
              {insights.length > 0 && (
            <div className="insights-section">
              <h2>💡 Smart Insights</h2>
              <div className="insights-grid">
                {insights.map((insight, idx) => (
                  <div key={idx} className={`insight-card ${insight.type}`}>
                    <div className="insight-icon">{insight.icon}</div>
                    <div className="insight-content">
                      <h4>{insight.title}</h4>
                      <p>{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Metrics */}
          <div className="metrics-section">
            <h2>📊 Key Metrics</h2>
            {analytics ? (
              <div className="metrics-grid">
                <div className="metric-card primary">
                  <div className="metric-icon"><FiUsers /></div>
                  <div className="metric-content">
                    <h3>Total Users</h3>
                    <p className="metric-value">{analytics.totalUsers || 0}</p>
                    {analytics.trends?.newUsersLast7Days > 0 && (
                      <span className="metric-trend positive">
                        +{analytics.trends.newUsersLast7Days} this week
                      </span>
                    )}
                  </div>
                </div>

              <div className="metric-card success">
                <div className="metric-icon"><FiShoppingCart /></div>
                <div className="metric-content">
                  <h3>Total Orders</h3>
                  <p className="metric-value">{analytics.totalOrders}</p>
                  {analytics.trends?.ordersLast7Days > 0 && (
                    <span className="metric-trend positive">
                      {analytics.trends.ordersLast7Days} in last 7 days
                    </span>
                  )}
                </div>
              </div>

              <div className="metric-card warning">
                <div className="metric-icon"><FiDollarSign /></div>
                <div className="metric-content">
                  <h3>Total Revenue</h3>
                  <p className="metric-value">₹{analytics.totalRevenue.toLocaleString()}</p>
                  {analytics.trends?.revenueLast7Days > 0 && (
                    <span className="metric-trend positive">
                      ₹{analytics.trends.revenueLast7Days.toLocaleString()} this week
                    </span>
                  )}
                </div>
              </div>

              <div className="metric-card info">
                <div className="metric-icon"><FiActivity /></div>
                <div className="metric-content">
                  <h3>Avg Order Value</h3>
                  <p className="metric-value">₹{analytics.insights?.avgOrderValue || 0}</p>
                  <span className="metric-trend">Per order</span>
                </div>
              </div>
            </div>
            ) : (
              <div className="error-message">
                <p>Unable to load analytics data. Please check your connection and try again.</p>
                <button onClick={fetchData} className="btn-refresh">Retry</button>
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          {analytics && analytics.dailyRevenue && analytics.dailyRevenue.length > 0 && (
            <div className="chart-section">
              <h2>📈 Revenue Trend (Last 7 Days)</h2>
              {ResponsiveContainer && LineChart ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        name="Revenue"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="chart-fallback">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.dailyRevenue.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.date}</td>
                          <td>₹{item.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Module Performance */}
          {analytics && analytics.modulePerformance && analytics.modulePerformance.length > 0 && (
            <div className="chart-section">
              <h2>🏆 Module Performance</h2>
              <div className="charts-row">
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.modulePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#0088FE" name="Orders" />
                      <Bar dataKey="revenue" fill="#00C49F" name="Revenue (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.modulePerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {analytics.modulePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Order Status Breakdown */}
          {analytics && analytics.orderStatusBreakdown && Object.keys(analytics.orderStatusBreakdown).length > 0 && (
            <div className="chart-section">
              <h2>📦 Order Status Breakdown</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(analytics.orderStatusBreakdown).map(([status, count]) => ({ status, count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#FF8042" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}

      {activeTab === 'content' && (
        <ContentManagement />
      )}

      {activeTab === 'modules' && (
        <div className="modules-section">
          <h2>Module Control</h2>
          {modules.length === 0 ? (
            <div className="error-message">
              <p>No modules found. Please check your connection and try again.</p>
              <button onClick={fetchData} className="btn-refresh">Retry</button>
            </div>
          ) : (
            <div className="modules-list">
              {modules.map(module => (
              <div key={module.name} className="module-control-card">
                <div className="module-info">
                  <h3>{module.displayName}</h3>
                  <p>{module.description}</p>
                  <span className={`status ${module.isActive ? 'active' : 'inactive'}`}>
                    {module.isActive ? '✅ Active' : '❌ Inactive'}
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
          )}
        </div>
      )}

      {activeTab === 'sections' && (
        <ProductSectionManagement />
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h2>Advanced Analytics</h2>
          {analytics ? (
            <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-value">{analytics.totalUsers}</p>
              <p className="stat-detail">+{analytics.trends?.newUsersLast7Days || 0} new this week</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-value">{analytics.totalOrders}</p>
              <p className="stat-detail">{analytics.trends?.ordersLast7Days || 0} in last 7 days</p>
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
              <p className="stat-value">₹{analytics.totalRevenue.toLocaleString()}</p>
              <p className="stat-detail">₹{analytics.trends?.revenueLast7Days?.toLocaleString() || 0} this week</p>
            </div>
            <div className="stat-card">
              <h3>Conversion Rate</h3>
              <p className="stat-value">{analytics.insights?.conversionRate || 0}%</p>
            </div>
            <div className="stat-card">
              <h3>Avg Order Value</h3>
              <p className="stat-value">₹{analytics.insights?.avgOrderValue || 0}</p>
            </div>
          </div>
          ) : (
            <div className="error-message">
              <p>Unable to load analytics data. Please check your connection and try again.</p>
              <button onClick={fetchData} className="btn-refresh">Retry</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
