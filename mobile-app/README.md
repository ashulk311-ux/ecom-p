# Ecommerce Mobile App

React Native mobile app that integrates all three modules (Food, Grocery, Services) using WebView.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

3. Update module URLs in `App.js`:
   - For development: Update ports (3001, 3002, 3003)
   - For production: Update with deployed URLs

4. Start the app:
```bash
npm start
```

## Running on Device

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

## Module URLs Configuration

Update the `MODULE_URLS` in `App.js`:

```javascript
const MODULE_URLS = {
  FOOD: 'http://localhost:3001',      // Food app
  GROCERY: 'http://localhost:3002',   // Grocery app
  SERVICES: 'http://localhost:3003',  // Services app
};
```

For production, replace with your deployed URLs.

## Features

- Bottom tab navigation between modules
- WebView integration for each module
- Back button support
- Loading states
- Error handling with retry
- Native mobile experience

## Requirements

- Node.js
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)
- Or Expo Go app on physical device

