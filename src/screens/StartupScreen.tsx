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
      const { data } = await supabase.auth.getSession();
      navigation.replace(data.session ? 'AppTabs' : 'Login');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

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