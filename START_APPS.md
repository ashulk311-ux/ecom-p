# Starting All Applications

## Backend (Required for all apps)
```bash
cd backend
npm start
```
Runs on: http://localhost:5001

## Module Apps

### Food Delivery App
```bash
cd apps/food-app
npm install
PORT=3001 npm start
```
Runs on: http://localhost:3001

### Grocery Delivery App
```bash
cd apps/grocery-app
npm install
PORT=3002 npm start
```
Runs on: http://localhost:3002

### Services Booking App
```bash
cd apps/services-app
npm install
PORT=3003 npm start
```
Runs on: http://localhost:3003

## Mobile App

### Install dependencies first:
```bash
cd mobile-app
npm install
```

### Start mobile app:
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on physical device

## Quick Start Script

Create a script to start all apps at once (optional):

```bash
# Start all apps
cd backend && npm start &
cd ../apps/food-app && PORT=3001 npm start &
cd ../grocery-app && PORT=3002 npm start &
cd ../services-app && PORT=3003 npm start &
cd ../../mobile-app && npm start
```

## Port Configuration

- Backend: 5001
- Food App: 3001
- Grocery App: 3002
- Services App: 3003
- Mobile App: Expo default (19000, 19001)

## Notes

1. Make sure MongoDB is running before starting backend
2. Each module app is independent and can be deployed separately
3. Mobile app connects to module apps via WebView
4. Update `MODULE_URLS` in mobile-app/App.js for production URLs

