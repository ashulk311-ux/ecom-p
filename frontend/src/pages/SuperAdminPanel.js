import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SuperAdminPanel.css';

const SuperAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [modules, setModules] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [groceries, setGroceries] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'modules') {
      fetchModules();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'food') {
      fetchRestaurants();
    } else if (activeTab === 'grocery') {
      fetchGroceries();
    } else if (activeTab === 'services') {
      fetchServices();
    }
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/users');
      setUsers(res.data.users || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/modules');
      setModules(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/orders');
      setOrders(res.data.orders || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/bookings');
      setBookings(res.data.bookings || res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/food/restaurants');
      setRestaurants(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroceries = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/grocery/items');
      setGroceries(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch groceries');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/super-admin/services/list');
      setServices(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/super-admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/super-admin/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const toggleModule = async (moduleName, isActive) => {
    try {
      await axios.put(`/api/super-admin/modules/${moduleName}`, { isActive: !isActive });
      fetchModules();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle module');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/super-admin/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/super-admin/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status');
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await axios.delete(`/api/super-admin/food/restaurants/${id}`);
      fetchRestaurants();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete restaurant');
    }
  };

  const deleteGrocery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this grocery item?')) return;
    try {
      await axios.delete(`/api/super-admin/grocery/items/${id}`);
      fetchGroceries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete grocery item');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await axios.delete(`/api/super-admin/services/${id}`);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete service');
    }
  };

  if (loading && !dashboardData) {
    return <div className="super-admin-panel"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="super-admin-panel">
      <div className="super-admin-header">
        <h1>Super Admin Panel</h1>
        <p>Manage all apps and users</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="super-admin-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={activeTab === 'modules' ? 'active' : ''}
          onClick={() => setActiveTab('modules')}
        >
          🧩 Modules
        </button>
        <button
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders
        </button>
        <button
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          📅 Bookings
        </button>
        <button
          className={activeTab === 'food' ? 'active' : ''}
          onClick={() => setActiveTab('food')}
        >
          🍔 Food
        </button>
        <button
          className={activeTab === 'grocery' ? 'active' : ''}
          onClick={() => setActiveTab('grocery')}
        >
          🛒 Grocery
        </button>
        <button
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          🔧 Services
        </button>
      </div>

      <div className="super-admin-content">
        {activeTab === 'dashboard' && dashboardData && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p className="stat-number">{dashboardData.users?.total || 0}</p>
                <div className="stat-details">
                  <span>Regular: {dashboardData.users?.regular || 0}</span>
                  <span>Admins: {dashboardData.users?.admins || 0}</span>
                  <span>Super Admins: {dashboardData.users?.superAdmins || 0}</span>
                </div>
              </div>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p className="stat-number">₹{dashboardData.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p className="stat-number">{dashboardData.orders?.total || 0}</p>
                <div className="stat-details">
                  <span>Food: {dashboardData.orders?.food || 0}</span>
                  <span>Grocery: {dashboardData.orders?.grocery || 0}</span>
                </div>
              </div>
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p className="stat-number">{dashboardData.bookings?.total || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Content</h3>
                <div className="stat-details">
                  <span>Restaurants: {dashboardData.content?.restaurants || 0}</span>
                  <span>Groceries: {dashboardData.content?.groceries || 0}</span>
                  <span>Services: {dashboardData.content?.services || 0}</span>
                </div>
              </div>
              <div className="stat-card">
                <h3>Modules</h3>
                <p className="stat-number">{dashboardData.modules?.active || 0}/{dashboardData.modules?.total || 0}</p>
                <p className="stat-label">Active</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>User Management</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="service_provider">Service Provider</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteUser(user._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'modules' && (
          <div className="modules-section">
            <h2>Module Management</h2>
            <div className="modules-list">
              {modules.map(module => (
                <div key={module._id} className="module-card">
                  <h3>{module.displayName || module.name}</h3>
                  <p>{module.description}</p>
                  <button
                    className={module.isActive ? 'btn-active' : 'btn-inactive'}
                    onClick={() => toggleModule(module.name, module.isActive)}
                  >
                    {module.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <h2>All Orders</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-8)}</td>
                    <td>{order.userId?.name || 'N/A'}</td>
                    <td>{order.moduleType}</td>
                    <td>₹{order.totalAmount}</td>
                    <td>{order.status}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>All Bookings</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Service</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking._id.slice(-8)}</td>
                    <td>{booking.userId?.name || 'N/A'}</td>
                    <td>{booking.serviceId?.name || 'N/A'}</td>
                    <td>₹{booking.amount}</td>
                    <td>{booking.status}</td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'food' && (
          <div className="food-section">
            <h2>Restaurants</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Cuisine</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {restaurants.map(restaurant => (
                  <tr key={restaurant._id}>
                    <td>{restaurant.name}</td>
                    <td>{restaurant.cuisine}</td>
                    <td>{restaurant.rating}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteRestaurant(restaurant._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'grocery' && (
          <div className="grocery-section">
            <h2>Grocery Items</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groceries.map(grocery => (
                  <tr key={grocery._id}>
                    <td>{grocery.name}</td>
                    <td>{grocery.category}</td>
                    <td>₹{grocery.price}</td>
                    <td>{grocery.stock}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteGrocery(grocery._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-section">
            <h2>Services</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service._id}>
                    <td>{service.name}</td>
                    <td>{service.category}</td>
                    <td>{service.description}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => deleteService(service._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminPanel;



