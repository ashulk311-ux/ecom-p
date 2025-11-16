# Ecommerce Web App - Multi-Module Platform

A comprehensive ecommerce web application with three distinct service modules (Food Delivery, Grocery Delivery, and On-Demand Services) controlled by an admin panel. Built with React, Node.js, Express, and MongoDB.

## Features

### Three Service Modules

1. **Food Delivery (Swiggy-like)**
   - Browse restaurants
   - View menus and add items to cart
   - Place orders with delivery tracking
   - Order history

2. **Grocery Delivery (Blinkit-like)**
   - Browse grocery items by category
   - Stock management
   - Quick checkout
   - Order tracking

3. **On-Demand Services (UrbanClap-like)**
   - Browse service categories
   - Select service providers
   - Schedule appointments
   - Booking management and feedback

### Admin Panel

- Toggle modules ON/OFF independently
- View analytics dashboard
- Manage users and orders
- Monitor revenue and statistics

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
ecommerce-app/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   └── App.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone or navigate to the project directory

```bash
cd ecommerce-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-app
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in the `.env` file.

### 5. Initialize Modules

After starting the backend, you need to initialize the modules. You can do this by:

1. Creating an admin user (register with role: 'admin')
2. Logging in as admin
3. Visiting the Admin Panel
4. The modules will be initialized automatically when you access the admin panel

Alternatively, you can use the API endpoint:

```bash
POST http://localhost:5000/api/admin/init-modules
```

(Requires admin authentication)

## Running the Application

### Start Backend Server

```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Admin
- `GET /api/admin/modules` - Get all modules
- `PUT /api/admin/modules/:moduleName/toggle` - Toggle module status (admin only)
- `GET /api/admin/analytics` - Get analytics (admin only)
- `GET /api/admin/orders` - Get all orders (admin only)
- `GET /api/admin/bookings` - Get all bookings (admin only)
- `GET /api/admin/users` - Get all users (admin only)

### Food Delivery
- `GET /api/food/restaurants` - Get all restaurants
- `GET /api/food/restaurants/:id` - Get restaurant details
- `POST /api/food/orders` - Create order (protected)
- `GET /api/food/orders` - Get user orders (protected)
- `GET /api/food/orders/:id` - Get order details (protected)

### Grocery Delivery
- `GET /api/grocery/items` - Get all grocery items
- `GET /api/grocery/categories` - Get categories
- `GET /api/grocery/items/:id` - Get item details
- `POST /api/grocery/orders` - Create order (protected)
- `GET /api/grocery/orders` - Get user orders (protected)

### Services
- `GET /api/services/services` - Get all services
- `GET /api/services/categories` - Get categories
- `GET /api/services/services/:id` - Get service details
- `POST /api/services/bookings` - Create booking (protected)
- `GET /api/services/bookings` - Get user bookings (protected)
- `POST /api/services/bookings/:id/feedback` - Add feedback (protected)

## Creating an Admin User

To create an admin user, you can:

1. Register a new user through the frontend
2. Manually update the user role in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Or use the registration API with role parameter (if you modify the backend to allow it during registration).

## Sample Data

You can add sample data manually through MongoDB or create a seed script. Here's an example structure:

### Sample Restaurant
```json
{
  "name": "Pizza Palace",
  "cuisine": "Italian",
  "rating": 4.5,
  "deliveryTime": 30,
  "deliveryFee": 20,
  "menu": [
    {
      "name": "Margherita Pizza",
      "price": 299,
      "description": "Classic cheese pizza"
    }
  ]
}
```

### Sample Grocery Item
```json
{
  "name": "Milk",
  "category": "Dairy",
  "price": 50,
  "unit": "liter",
  "stock": 100
}
```

### Sample Service
```json
{
  "name": "Home Cleaning",
  "category": "Cleaning",
  "description": "Professional home cleaning service",
  "providers": [
    {
      "providerId": "provider_user_id",
      "name": "John Doe",
      "rating": 4.8,
      "price": 500
    }
  ]
}
```

## Features Implementation

### Module Toggle
- Admin can enable/disable any module independently
- Disabled modules are hidden from the homepage
- API endpoints for disabled modules return 403 errors

### Authentication
- JWT-based authentication
- Protected routes for authenticated users
- Admin-only routes for admin panel

### Cart Management
- LocalStorage-based cart for guest users
- Persistent cart across sessions
- Separate carts for different modules

## Development Notes

- The frontend uses a proxy to the backend (configured in `package.json`)
- CORS is enabled on the backend for cross-origin requests
- JWT tokens are stored in localStorage
- Password hashing uses bcryptjs

## Future Enhancements

- Payment gateway integration
- Real-time order tracking
- Push notifications
- Email notifications
- Advanced search and filters
- Reviews and ratings system
- Image upload functionality
- Admin dashboard charts and graphs

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

# ecom-p
