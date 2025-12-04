import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../navigation/navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MeetupsScreen from '../screens/meetups';
import MeetupsLoading from '../screens/MeetupsLoading';
import DiscoverScreen from '../screens/DiscoverScreen';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import WhirlIcon from '../../assets/icons/whirl.png';

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
import ProfileScreen from '../screens/ProfileScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const MeetupsStack = createNativeStackNavigator();

const LSU_PURPLE = '#461D7C';

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
          Meetups: 'meetups',
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
        tabBarShowLabel: false,
        tabBarStyle: { borderTopWidth: 1, borderTopColor: '#ddd' },
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Discover') {
            return (
              <Image
                source={WhirlIcon}
                style={{
                    width: focused ? size + 8 : size + 6,
                    height: focused ? size + 8 : size + 6,
                  tintColor: focused ? LSU_PURPLE : color,
                  resizeMode: 'contain',
                }}
              />
            );
          }

          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Search':
              iconName = focused ? 'search' : 'search-outline';
              break;
            case 'Meetups':
              iconName = focused ? 'cloud' : 'cloud-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={focused ? LSU_PURPLE : color}
            />
          );
        },
        tabBarActiveTintColor: LSU_PURPLE,
        tabBarInactiveTintColor: '#777',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={HomeScreen} />
      <Tab.Screen name="Discover" component={HomeScreen} />
      <Tab.Screen name="Meetups" component={MeetupsStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MeetupsStackNavigator() {
  return (
    <MeetupsStack.Navigator screenOptions={{ headerShown: false }}>
      <MeetupsStack.Screen
        name="MeetupsLoading"
        component={MeetupsLoading}
      />
      <MeetupsStack.Screen
        name="MeetupsMain"
        component={MeetupsScreen}
      />
    </MeetupsStack.Navigator>
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

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Restart" component={RestartScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

        <Stack.Screen name="AppTabs" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
