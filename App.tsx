import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';

import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    FodaDisplay: require('./assets/Fonts/Foda_Display.ttf'),
    CherryBombOne: require('./assets/Fonts/CherryBombOne-Regular.ttf'),

  });

  if (!fontsLoaded) return null;

  return <RootNavigator />;
}
