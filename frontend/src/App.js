import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import FoodDelivery from './pages/FoodDelivery';
import GroceryDelivery from './pages/GroceryDelivery';
import ServiceBooking from './pages/ServiceBooking';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Bookings from './pages/Bookings';
import PaymentHistory from './pages/PaymentHistory';
import OrderTracking from './pages/OrderTracking';
import BookingTracking from './pages/BookingTracking';
import Wishlist from './pages/Wishlist';
import Chat from './pages/Chat';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import SuperAdminPanel from './pages/SuperAdminPanel';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/food" element={<FoodDelivery />} />
            <Route path="/grocery" element={<GroceryDelivery />} />
            <Route path="/services" element={<ServiceBooking />} />
            <Route path="/restaurant/:id" element={<RestaurantDetail />} />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <PrivateRoute>
                  <Bookings />
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
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
            <Route
              path="/super-admin"
              element={
                <SuperAdminRoute>
                  <SuperAdminPanel />
                </SuperAdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

