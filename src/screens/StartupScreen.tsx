import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, StatusBar } from 'react-native';
import { supabase } from '../lib/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import tornadoGif from '../../assets/TornadoStartup.gif';
type Props = NativeStackScreenProps<RootStackParamList, 'Startup'>;

export default function StartupScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        // Not logged in → Login
        if (!session) {
          navigation.replace('Login');
          return;
        }

        // Logged in → check if this user has completed onboarding
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('display_name, major')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.log('Error checking onboarding status:', profileError);
          // If something goes wrong, just fall back to Home
          navigation.replace('AppTabs');
          return;
        }

        const needsOnboarding =
          !profile ||
          !profile.display_name ||
          !profile.major ||
          profile.display_name.trim().length === 0 ||
          profile.major.trim().length === 0;

        navigation.replace(needsOnboarding ? 'Onboarding' : 'AppTabs');
      } catch (e) {
        console.log('Startup error:', e);
        navigation.replace('Login');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, bob]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animated.View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          opacity: fadeAnim,
          transform: [{ translateY: bob }],
        }}
      >
        <Animated.Text style={styles.logoText}>Wh</Animated.Text>

        <Image
          source={tornadoGif}
          style={styles.tornado}
          resizeMode="contain"
        />

        <Animated.Text style={styles.logoText}>rl</Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#461D7C',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoText: {
    fontFamily: 'CherryBomb',
    fontSize: 86,
    color: '#ffffff',
  },

  tornado: {
    width: 75,  
    height: 95,
    marginHorizontal: 6,
  },
});