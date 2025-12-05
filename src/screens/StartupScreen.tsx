import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Image, StatusBar, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

import tornadoGif from '../../assets/TornadoStartup.gif';
type Props = NativeStackScreenProps<RootStackParamList, 'Startup'>;

export default function StartupScreen({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;

  const [safetyTip, setSafetyTip] = useState("");

  useEffect(() => {
    const tips = [
      "Stay aware of your surroundings.",
      "Meet in public spaces for first meetups.",
      "Avoid sharing personal information too fast.",
      "Use your intuition—if something feels off, trust it.",
      "Let a friend know when you're meeting someone new.",
      "Keep your valuables secured in public spaces.",
      "If vibes feel weird, abort mission immediately.",
      "Report suspicious users immediately.",
      "Stay safe. Don’t follow strangers… unless they have snacks.",
      "Stay safe on campus — Mike the Tiger is watching.",
    ];

    setSafetyTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

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

      <Animated.Text style={[styles.safetyTip, { opacity: fadeAnim }]}>
        💡 {safetyTip}
      </Animated.Text>
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

  safetyTip: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});
