import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import './components/Toast.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ServiceBooking from './pages/ServiceBooking';
import Bookings from './pages/Bookings';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import PaymentHistory from './pages/PaymentHistory';
import Wishlist from './pages/Wishlist';
import Chat from './pages/Chat';
import OrderTracking from './pages/OrderTracking';
import BookingTracking from './pages/BookingTracking';
import ServiceDetail from './pages/ServiceDetail';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="App">
            <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<ServiceBooking />} />
            <Route path="/service/:id" element={<ServiceDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/bookings"
              element={
                <PrivateRoute>
                  <Bookings />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/payment-history"
              element={
                <PrivateRoute>
                  <PaymentHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PrivateRoute>
                  <Wishlist />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/order-tracking/:id"
              element={
                <PrivateRoute>
                  <OrderTracking />
                </PrivateRoute>
              }
            />
            <Route
              path="/booking-tracking/:id"
              element={
                <PrivateRoute>
                  <BookingTracking />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
        </div>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

