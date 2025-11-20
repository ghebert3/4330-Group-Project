// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../navigation/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';

import type {
  RootStackParamList,
  AppTabParamList,
} from '../navigation/types';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import StartupScreen from '../screens/StartupScreen';
import RestartScreen from '../screens/RestartScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

// If you have Search/Discover/Alerts/Profile screens, import them as well
// import SearchScreen from '../screens/SearchScreen';
// import DiscoverScreen from '../screens/DiscoverScreen';
// import AlertsScreen from '../screens/AlertsScreen';
// import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

const LSU_PURPLE = '#461D7C';

// Deep linking configuration
const linking = {

  prefixes: [Linking.createURL('/'), 'whirl://'],
  config: {
    screens: {
      Startup: 'startup',
      Login: 'login',
      SignUp: 'signup',
      Restart: 'restart',
      ChangePassword: 'reset-password',
      AppTabs: {
        screens: {
          Home: 'home',
          Search: 'search',
          Discover: 'discover',
          Alerts: 'alerts',
          Profile: 'profile',
        },
      },
    },
  },
};

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: LSU_PURPLE,
        tabBarInactiveTintColor: '#999',
        tabBarShowLabel: true,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') iconName = 'home-outline';
          if (route.name === 'Search') iconName = 'search-outline';
          if (route.name === 'Discover') iconName = 'compass-outline';
          if (route.name === 'Alerts') iconName = 'notifications-outline';
          if (route.name === 'Profile') iconName = 'person-circle-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Startup"
      >
        <Stack.Screen name="Startup" component={StartupScreen} />

        {/* Auth flow */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Restart" component={RestartScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

        {/* Main app (tabs) */}
        <Stack.Screen name="AppTabs" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}