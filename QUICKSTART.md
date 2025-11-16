# Quick Start Guide

## Prerequisites Check
- ✅ Node.js installed (v14+)
- ✅ MongoDB running locally or MongoDB Atlas account

## Step-by-Step Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Backend Environment
Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-app
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Seed Sample Data (Optional but Recommended)
```bash
cd ../backend
npm run seed
```

This will create:
- Admin user: `admin@example.com` / `admin123`
- Test user: `user@example.com` / `user123`
- Sample restaurants, groceries, and services

### 5. Start Backend Server
```bash
cd backend
npm start
# or for development
npm run dev
```

Backend runs on: http://localhost:5000

### 6. Start Frontend Server
```bash
cd frontend
npm start
```

Frontend runs on: http://localhost:3000

## First Steps

1. **Login as Admin**
   - Email: `admin@example.com`
   - Password: `admin123`
   - Go to Admin Panel to manage modules

2. **Test as Regular User**
   - Email: `user@example.com`
   - Password: `user123`
   - Browse modules and place orders

3. **Module Management**
   - Admin can toggle modules ON/OFF
   - Disabled modules won't appear on homepage
   - API endpoints for disabled modules return 403

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check MongoDB service
- For MongoDB Atlas: Update `MONGODB_URI` in `.env` with your connection string

### Port Already in Use
- Change `PORT` in `backend/.env`
- Update proxy in `frontend/package.json` if needed

### Module Not Showing
- Check if module is active in Admin Panel
- Verify modules are initialized (run seed script)

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET in backend `.env`
- Verify token in browser DevTools > Application > Local Storage

## Project Structure Overview

```
ecommerce-app/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Main server file
│   ├── seed.js          # Seed script
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React Context (Auth)
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md            # Full documentation
```

## Key Features to Test

1. **Module Toggle**
   - Login as admin
   - Go to Admin Panel
   - Toggle any module OFF
   - Check homepage - module should disappear

2. **Food Ordering**
   - Browse restaurants
   - Add items to cart
   - Place order
   - View order history

3. **Grocery Shopping**
   - Browse by category
   - Add items to cart
   - Check stock availability
   - Place order

4. **Service Booking**
   - Browse services
   - Select provider
   - Schedule appointment
   - View bookings

## Next Steps

- Customize the UI/UX
- Add more sample data
- Integrate payment gateway
- Add image uploads
- Implement real-time notifications

Happy coding! 🚀

