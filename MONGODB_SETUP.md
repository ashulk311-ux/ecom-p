# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Recommended - Free & Easy)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a free cluster (M0 - Free tier)
4. Create a database user (username/password)
5. Whitelist your IP address (or use 0.0.0.0/0 for development)
6. Get your connection string (click "Connect" > "Connect your application")
7. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce-app?retryWrites=true&w=majority
   ```
8. Restart the backend server
9. Run the seed script: `cd backend && node seed-via-api.js`

## Option 2: Local MongoDB Installation

### macOS (using Homebrew)
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

### Or Download Manually
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service
4. MongoDB will run on `mongodb://localhost:27017`

## After MongoDB is Running

Once MongoDB is connected, run:
```bash
cd backend
node seed-via-api.js
```

This will populate:
- 3 test users (admin, user, provider)
- 4 restaurants with menus
- 15 grocery items
- 6 services with providers

