import React from 'react';
import { Text, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import FoodModule from './screens/FoodModule';
import GroceryModule from './screens/GroceryModule';
import ServicesModule from './screens/ServicesModule';

const Tab = createBottomTabNavigator();

// Get the correct host for the platform
// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator uses localhost
const getHost = () => {
  if (Platform.OS === 'android') {
    return '10.0.2.2'; // Android emulator host IP
  }
  return 'localhost'; // iOS simulator or physical device
};

// Module URLs - Update these to your deployed URLs or local development URLs
// Using development URLs for now (hardcoded to avoid __DEV__ issues in bundled builds)
const MODULE_URLS = {
  FOOD: `http://${getHost()}:3001`,  // Food app port
  GROCERY: `http://${getHost()}:3002`,  // Grocery app port
  SERVICES: `http://${getHost()}:3003`,  // Services app port
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: '#666',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
        }}
      >
        <Tab.Screen
          name="Food"
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>🍔</Text>
            ),
            tabBarLabel: 'Food',
          }}
        >
          {() => <FoodModule url={MODULE_URLS.FOOD} />}
        </Tab.Screen>
        <Tab.Screen
          name="Grocery"
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>🛒</Text>
            ),
            tabBarLabel: 'Grocery',
          }}
        >
          {() => <GroceryModule url={MODULE_URLS.GROCERY} />}
        </Tab.Screen>
        <Tab.Screen
          name="Services"
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 24 }}>🔧</Text>
            ),
            tabBarLabel: 'Services',
          }}
        >
          {() => <ServicesModule url={MODULE_URLS.SERVICES} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

