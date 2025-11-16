#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Ecommerce Multi-Module Application${NC}\n"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB is not running. Starting MongoDB...${NC}"
    brew services start mongodb/brew/mongodb-community@7.0 2>/dev/null || echo "Please start MongoDB manually"
    sleep 2
fi

# Function to start a service
start_service() {
    local name=$1
    local dir=$2
    local port=$3
    local command=$4
    
    echo -e "${GREEN}Starting ${name}...${NC}"
    cd "$dir"
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies for ${name}..."
        npm install > /dev/null 2>&1
    fi
    PORT=$port $command > /tmp/${name}.log 2>&1 &
    echo -e "${GREEN}✅ ${name} started on port ${port}${NC}"
    sleep 2
}

# Start Backend
echo -e "\n${BLUE}📦 Starting Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install > /dev/null 2>&1
fi
npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
sleep 3

# Start Module Apps
cd ..
start_service "Food App" "apps/food-app" "3001" "npm start"
start_service "Grocery App" "apps/grocery-app" "3002" "npm start"
start_service "Services App" "apps/services-app" "3003" "npm start"

echo -e "\n${GREEN}✅ All services started!${NC}\n"
echo -e "${BLUE}📱 Access Points:${NC}"
echo -e "  Backend API:    http://localhost:5001"
echo -e "  Food App:       http://localhost:3001"
echo -e "  Grocery App:    http://localhost:3002"
echo -e "  Services App:   http://localhost:3003"
echo -e "\n${YELLOW}To start mobile app, run:${NC}"
echo -e "  cd mobile-app && npm start"
echo -e "\n${YELLOW}To stop all services, run:${NC}"
echo -e "  ./stop-all.sh"
echo -e "\n${YELLOW}Logs are in /tmp/*.log${NC}"

