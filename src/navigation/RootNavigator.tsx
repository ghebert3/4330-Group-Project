// src/navigation/RootNavigator.tsx
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import { supabase } from '../lib/supabase';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import type { AuthStackParamList } from './types'; // <- src/navigation/types.ts

const Stack = createNativeStackNavigator<AuthStackParamList>();
const Tabs = createBottomTabNavigator();

function FeedScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Feed</Text>
    </View>
  );
}

function AppTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Feed" component={FeedScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  // Normal auth state check
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setIsAuthed(!!data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setIsAuthed(!!session);
      }
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // --- TEMP (optional): force sign-out once to show SignUp first ---
  // useEffect(() => { (async () => { try { await supabase.auth.signOut(); } catch {} })(); }, []);
  // ---------------------------------------------------------------

  if (isAuthed === null) return null;

  return (
    <NavigationContainer>
      {isAuthed ? (
        <AppTabs />
      ) : (
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="SignUp" // start on SignUp when logged out
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
