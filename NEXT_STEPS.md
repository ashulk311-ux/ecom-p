# Next Steps - Getting Started

## ✅ What's Done

1. ✅ Three separate module apps created
2. ✅ React Native mobile app created
3. ✅ Backend CORS configured
4. ✅ Dependencies installed
5. ✅ Startup scripts created

## 🚀 Quick Start

### Option 1: Use Startup Script (Easiest)
```bash
./start-all.sh
```

This will:
- Check and start MongoDB
- Start backend server
- Start all three module apps
- Show you all access URLs

### Option 2: Manual Start

1. **Start Backend:**
```bash
cd backend
npm start
```

2. **Start Module Apps** (in separate terminals):
```bash
# Terminal 2 - Food App
cd apps/food-app
PORT=3001 npm start

# Terminal 3 - Grocery App
cd apps/grocery-app
PORT=3002 npm start

# Terminal 4 - Services App
cd apps/services-app
PORT=3003 npm start
```

3. **Start Mobile App:**
```bash
cd mobile-app
npm start
```

## 📱 Testing the Apps

### Web Apps
- Food App: http://localhost:3001
- Grocery App: http://localhost:3002
- Services App: http://localhost:3003

### Mobile App
1. Install Expo Go on your phone
2. Run `npm start` in mobile-app directory
3. Scan QR code with Expo Go
4. Or press `i` for iOS simulator / `a` for Android emulator

## 🔧 Configuration

### Update Mobile App URLs
If your module apps are on different ports or deployed, update `mobile-app/App.js`:

```javascript
const MODULE_URLS = {
  FOOD: 'http://localhost:3001',      // or your IP: http://192.168.1.100:3001
  GROCERY: 'http://localhost:3002',
  SERVICES: 'http://localhost:3003',
};
```

### For Physical Device Testing
1. Find your computer's IP address:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
2. Update URLs in `mobile-app/App.js` to use your IP instead of localhost
3. Make sure phone and computer are on same WiFi network

## 🧪 Testing Checklist

- [ ] Backend is running and MongoDB connected
- [ ] Food app loads and shows restaurants
- [ ] Grocery app loads and shows items
- [ ] Services app loads and shows services
- [ ] Mobile app opens and shows all three tabs
- [ ] Each module loads in mobile app WebView
- [ ] Can navigate between modules in mobile app
- [ ] Can place orders/bookings from mobile app

## 🐛 Troubleshooting

### Module apps not loading in mobile app
- Check if module apps are running on correct ports
- Verify URLs in `mobile-app/App.js`
- For physical device: Use IP address instead of localhost
- Check network connectivity

### CORS errors
- Verify backend CORS configuration includes your ports
- Restart backend after CORS changes

### MongoDB connection issues
- Check if MongoDB is running: `brew services list | grep mongodb`
- Start MongoDB: `brew services start mongodb/brew/mongodb-community@7.0`

## 📦 Deployment

### Deploy Module Apps
Each app can be deployed independently:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- Or any static hosting

### Deploy Mobile App
```bash
cd mobile-app
expo build:android  # or expo build:ios
```

Or use EAS Build:
```bash
eas build --platform android
eas build --platform ios
```

## 🎯 What to Test

1. **Individual Module Apps:**
   - Login/Register
   - Browse items/services
   - Add to cart
   - Place orders
   - View order history

2. **Mobile App:**
   - Tab navigation works
   - Each module loads correctly
   - Can interact with each module
   - Back button works
   - Loading states show properly

## 📝 Notes

- All apps share the same backend API
- Authentication is shared across apps
- Each module app is independent and can be deployed separately
- Mobile app uses WebView to load each module
- Backend must be running for all apps to work

## 🆘 Need Help?

- Check logs: `/tmp/*.log` (if using start script)
- Check backend console for API errors
- Check browser console for frontend errors
- Check Expo console for mobile app errors

