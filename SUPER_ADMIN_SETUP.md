# Super Admin Setup Guide

## Overview
The Super Admin system allows a single administrator to manage all three apps (Food, Grocery, and Services) from one centralized dashboard.

## Features

### Super Admin Capabilities
- **Dashboard**: View comprehensive statistics across all apps
- **User Management**: View, update roles, and delete users
- **Module Management**: Enable/disable modules (Food, Grocery, Services)
- **Order Management**: View and update order statuses across all apps
- **Booking Management**: View and update service booking statuses
- **Content Management**: Delete restaurants, grocery items, and services

## Setup

### 1. Create a Super Admin User

Run the script to create a default super admin:

```bash
cd backend
node scripts/create-super-admin.js
```

Default credentials:
- **Email**: `superadmin@example.com`
- **Password**: `superadmin123`

⚠️ **Important**: Change the password after first login!

### 2. Manual Super Admin Creation

You can also create a super admin through the API or directly in MongoDB:

```javascript
// Via API (requires admin access)
POST /api/auth/register
{
  "name": "Super Admin",
  "email": "superadmin@example.com",
  "password": "your-secure-password",
  "phone": "1234567890",
  "role": "super_admin"
}
```

### 3. Access Super Admin Panel

1. Login with super admin credentials at `http://localhost:3000/login`
2. Navigate to `/super-admin` or click "Super Admin" in the navbar
3. You'll see the comprehensive dashboard

## API Endpoints

All super admin endpoints require authentication and super admin role:

### Dashboard
- `GET /api/super-admin/dashboard` - Get comprehensive statistics

### User Management
- `GET /api/super-admin/users` - Get all users
- `PUT /api/super-admin/users/:userId/role` - Update user role
- `DELETE /api/super-admin/users/:userId` - Delete user

### Module Management
- `GET /api/super-admin/modules` - Get all modules
- `PUT /api/super-admin/modules/:moduleName` - Update module settings

### Order Management
- `GET /api/super-admin/orders` - Get all orders
- `PUT /api/super-admin/orders/:orderId/status` - Update order status

### Booking Management
- `GET /api/super-admin/bookings` - Get all bookings
- `PUT /api/super-admin/bookings/:bookingId/status` - Update booking status

### Content Management
- `GET /api/super-admin/food/restaurants` - Get all restaurants
- `DELETE /api/super-admin/food/restaurants/:id` - Delete restaurant
- `GET /api/super-admin/grocery/items` - Get all grocery items
- `DELETE /api/super-admin/grocery/items/:id` - Delete grocery item
- `GET /api/super-admin/services/list` - Get all services
- `DELETE /api/super-admin/services/:id` - Delete service

## Security Features

1. **Role Protection**: Super admin routes are protected by `superAdminAuth` middleware
2. **Last Super Admin Protection**: Cannot delete or demote the last super admin
3. **Authentication Required**: All endpoints require valid JWT token
4. **Role Validation**: Only users with `super_admin` role can access

## User Roles

- **user**: Regular customer
- **admin**: Module-specific admin (can manage their module)
- **service_provider**: Service provider for services module
- **super_admin**: Can manage all apps and users

## Frontend Access

The super admin panel is accessible at:
- URL: `http://localhost:3000/super-admin`
- Navbar Link: "Super Admin" (only visible to super admins)

## Dashboard Sections

1. **Dashboard**: Overview statistics
2. **Users**: Manage all users and their roles
3. **Modules**: Enable/disable modules
4. **Orders**: View and manage all orders
5. **Bookings**: View and manage all service bookings
6. **Food**: Manage restaurants
7. **Grocery**: Manage grocery items
8. **Services**: Manage services

## Notes

- Super admins automatically have admin access to all modules
- Regular admins can only manage their specific module
- Super admin can promote users to admin or super admin
- Super admin can delete any user except the last super admin



