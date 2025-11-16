# Ecommerce Multi-Module Application

This project has been restructured into separate applications for each module, plus a mobile app that integrates them all.

## Project Structure

```
ecommerce-app/
├── backend/              # Shared backend API (Node.js/Express/MongoDB)
├── apps/
│   ├── food-app/        # Food Delivery Module (React)
│   ├── grocery-app/     # Grocery Delivery Module (React)
│   └── services-app/    # Services Booking Module (React)
├── mobile-app/          # React Native Mobile App (WebView integration)
└── frontend/            # Original monolithic frontend (legacy)
```

## Architecture

### Backend
- Single shared API server
- Handles all three modules
- MongoDB database
- RESTful API endpoints

### Module Apps
- **Food App**: Standalone React app for food delivery
- **Grocery App**: Standalone React app for grocery delivery
- **Services App**: Standalone React app for service booking
- Each can be deployed independently
- All connect to the same backend API

### Mobile App
- React Native app using Expo
- Bottom tab navigation
- WebView integration for each module
- Native mobile experience

## Getting Started

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

### 2. Start Module Apps

**Food App:**
```bash
cd apps/food-app
npm install
PORT=3001 npm start
```

**Grocery App:**
```bash
cd apps/grocery-app
npm install
PORT=3002 npm start
```

**Services App:**
```bash
cd apps/services-app
npm install
PORT=3003 npm start
```

### 3. Start Mobile App
```bash
cd mobile-app
npm install
npm start
```

## Mobile App Setup

1. Install Expo CLI:
```bash
npm install -g expo-cli
```

2. Update module URLs in `mobile-app/App.js`:
```javascript
const MODULE_URLS = {
  FOOD: 'http://localhost:3001',
  GROCERY: 'http://localhost:3002',
  SERVICES: 'http://localhost:3003',
};
```

3. For physical device testing:
   - Install Expo Go app on your phone
   - Scan QR code from terminal
   - Make sure phone and computer are on same network
   - Update URLs to use your computer's IP address

4. For simulator/emulator:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## Deployment

### Module Apps
Each module app can be deployed separately:
- Vercel
- Netlify
- AWS Amplify
- Any static hosting

### Mobile App
- Build with Expo:
```bash
cd mobile-app
expo build:android
expo build:ios
```

Or use EAS Build:
```bash
eas build --platform android
eas build --platform ios
```

## Features

### Module Apps
- Independent deployment
- Shared authentication
- Module-specific UI/UX
- Full functionality of each module

### Mobile App
- Native navigation
- WebView integration
- Offline error handling
- Back button support
- Loading states
- Seamless module switching

## Configuration

### Backend CORS
Backend is configured to accept requests from:
- localhost:3000-3003 (module apps)
- Expo development servers

### Environment Variables
Each module app uses the same backend:
- Backend URL: http://localhost:5001 (development)
- Update proxy in package.json for production

## Development Tips

1. **Testing Mobile App Locally:**
   - Use your computer's IP address instead of localhost
   - Example: `http://192.168.1.100:3001`

2. **Hot Reload:**
   - Module apps support hot reload
   - Mobile app WebView reloads on navigation

3. **Debugging:**
   - Use React DevTools for module apps
   - Use React Native Debugger for mobile app
   - Check WebView console in mobile app

## Production URLs

Update these in `mobile-app/App.js`:
```javascript
const MODULE_URLS = {
  FOOD: 'https://food-app.vercel.app',
  GROCERY: 'https://grocery-app.vercel.app',
  SERVICES: 'https://services-app.vercel.app',
};
```

## Troubleshooting

1. **WebView not loading:**
   - Check if module app is running
   - Verify URL in App.js
   - Check network connectivity
   - For Android: Add internet permission

2. **CORS errors:**
   - Verify backend CORS configuration
   - Check backend is running
   - Verify API endpoints

3. **Mobile app build issues:**
   - Clear Expo cache: `expo start -c`
   - Reinstall dependencies
   - Check Expo CLI version

## Next Steps

1. Deploy module apps to hosting platforms
2. Update mobile app with production URLs
3. Build and publish mobile app to app stores
4. Set up CI/CD for automated deployments

