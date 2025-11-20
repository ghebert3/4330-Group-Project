import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { supabase } from './src/lib/supabase';
import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  const [fontsLoaded] = useFonts({
    FodaDisplay: require('./assets/fonts/Foda_Display.ttf'),
    CherryBomb: require('./assets/fonts/CherryBombFont.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // listen for the pw reset 
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, _session) => {
      if (event === 'PASSWORD_RECOVERY') {
        // User opened the app via reset link
        if (navigationRef.isReady()) {
          navigationRef.navigate('ChangePassword');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return <RootNavigator />;
}
