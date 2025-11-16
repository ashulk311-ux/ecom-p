#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}🛑 Stopping all services...${NC}\n"

# Kill backend
pkill -f "node.*backend.*server.js" && echo -e "${GREEN}✅ Backend stopped${NC}" || echo "Backend not running"

# Kill module apps
pkill -f "react-scripts.*food-app" && echo -e "${GREEN}✅ Food App stopped${NC}" || echo "Food App not running"
pkill -f "react-scripts.*grocery-app" && echo -e "${GREEN}✅ Grocery App stopped${NC}" || echo "Grocery App not running"
pkill -f "react-scripts.*services-app" && echo -e "${GREEN}✅ Services App stopped${NC}" || echo "Services App not running"

# Kill processes on specific ports
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:3003 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null

echo -e "\n${GREEN}✅ All services stopped${NC}"

