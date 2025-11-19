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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

import tiger from '../../assets/logos/tiger.png';
import whirlLogo from '../../assets/logos/tornado-whirl-logo-transparent.png'; // <-- YOUR TRANSPARENT LOGO

type RestartNav = NativeStackNavigationProp<RootStackParamList, 'Restart'>;

export default function LoginScreen() {
  const navigation = useNavigation<RestartNav>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const H = Dimensions.get('window').height;

  async function handleRestart() {
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail( email, {
        // this is for the Supabase reset password link
        // redirect to: "https://whirl-app.com/reset-password"
      });

      if (error) throw error;

      Alert.alert(
        'Check your email',
        'We sent a link to reset your password.'
      );

      //after sending, send user back to login screen
      navigation.navigate('Login');
    } catch (e: any) {
        setError(e.message ?? 'Failed to send reset email');
    } finally {
        setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#461D7C' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}    // change this to android
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
            Reset your Password
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

            {/* Error */}
            {error ? (
              <Text style={{ color: 'red', textAlign: 'center', marginBottom: 6 }}>
                {error}
              </Text>
            ) : null}

            {/* Reset Password Button */}
            <Pressable
              onPress={handleRestart}
              disabled={loading}
              style={{
                backgroundColor: '#5903C3',
                borderRadius: 8,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#2C2C2C',
                marginTop: 8,
              }}
            >
              <Text style={{ color: '#F5F5F5', fontSize: 16, fontWeight: '600' }}>
                {loading ? 'Loading…' : 'Reset Password'}
              </Text>
            </Pressable>

            {/* Back to Login */}
            <Pressable
                onPress={() => navigation.navigate('Login')}
                style={{ marginTop: 16, alignSelf: 'center' }}
            >
                <Text style={{ color: '#551A8B', fontSize: 13 }}>
                    Back to Login
                </Text>
            </Pressable>
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