import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList, AppTabParamList } from '../navigation/types';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import StartupScreen from '../screens/StartupScreen';
import RestartScreen from '../screens/RestartScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();

// Bottom Tab Navigator for the main app
function AppTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#ddd' },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Discover':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Alerts':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={focused ? '#5903C3' : color}
            />
          );
        },
        tabBarActiveTintColor: '#5903C3',
        tabBarInactiveTintColor: '#777',
      })}
    >
      {/* Replace HomeScreen with real screens as your team builds them */}
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Search" component={HomeScreen} />
      <Tabs.Screen name="Discover" component={HomeScreen} />
      <Tabs.Screen name="Alerts" component={HomeScreen} />
      <Tabs.Screen name="Profile" component={HomeScreen} />
    </Tabs.Navigator>
  );
}

// Root stack navigator
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Startup"
      >
        {/* Animated startup / splash screen */}
        <Stack.Screen name="Startup" component={StartupScreen} />

        {/* Auth flow */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Restart" component={RestartScreen} />

        {/* Main app (tabs) */}
        <Stack.Screen name="AppTabs" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}