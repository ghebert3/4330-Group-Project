import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

import tiger from '../../assets/logos/tiger.png';
import whirlLogo from '../../assets/logos/tornado-whirl-logo-transparent.png'; // <-- YOUR TRANSPARENT LOGO

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const H = Dimensions.get('window').height;

  async function handleLogin() {
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      navigation.replace('AppTabs');
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#461D7C' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            alignItems: 'center',
            paddingTop: 10,
            paddingBottom: H * 0.38,
          }}
          keyboardShouldPersistTaps="handled"
        >

          {/* LOGO HERE */}
          <Image
            source={whirlLogo}
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 1.6,
              resizeMode: 'contain',
              marginBottom: -90,
              marginTop: 5,
            }}
          />

          {/* Subtitle */}
          <Text
            style={{
              color: 'white',
              fontSize: 23,
              fontFamily: 'Inter',
              fontWeight: '400',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Log in to your Account
          </Text>

          {/* Form card */}
          <View
            style={{
              width: '85%',
              backgroundColor: 'white',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D9D9D9',
              padding: 24,
              gap: 12,
            }}
          >
            {/* Email */}
            <Text style={{ fontSize: 16, fontWeight: '400' }}>Email</Text>
            <TextInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={{
                borderWidth: 1,
                borderColor: '#D9D9D9',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
              }}
              placeholderTextColor="#B3B3B3"
            />

            {/* Password */}
            <Text style={{ fontSize: 16, fontWeight: '400' }}>Password</Text>
            <TextInput
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{
                borderWidth: 1,
                borderColor: '#D9D9D9',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
              placeholderTextColor="#B3B3B3"
            />

            {/* Error */}
            {error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginBottom: 6 }}>
                {error}
              </Text>
            ) : null}

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: '#5903C3',
                borderRadius: 8,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#2C2C2C',
                opacity: loading ? 0.7 : 1,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: '#F5F5F5', fontSize: 16, fontWeight: '600' }}>
                {loading ? 'Loading…' : 'Login'}
              </Text>
            </Pressable>

            {/* Link to Sign Up */}
            <View style={{ position: 'absolute', bottom: 15, right: 20 }}>
              <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text
                  style={{ color: '#551A8B', fontSize: 13 }}>
                  Create new account
                </Text>
              </Pressable>
            </View>

            <View style={{ position: 'absolute', bottom: 15, left: 20 }}>
              <Pressable onPress={() => navigation.navigate('Restart')}>
                <Text
                  style={{ color: '#551A8B', fontSize: 13, }}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
          
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* TIGER BOTTOM */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: H * 0.23,
          overflow: 'hidden',
        }}
      >
        <Image
          source={tiger}
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
        />
      </View>
    </View>
  );
}
