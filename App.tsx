import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { supabase } from './src/lib/supabase';
import { navigationRef } from './src/navigation/navigationRef';
import React from "react";
import DiscoverScreen from "./src/screens/DiscoverScreen";

export default function App() {
  const [fontsLoaded] = useFonts({
    CherryBomb: require('./assets/fonts/CherryBombFont.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <RootNavigator />;
}
