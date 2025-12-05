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
import AnimatedButton from '../components/AnimatedButton';
import { useNavigation } from '@react-navigation/native';
import FadeInView from '../components/FadeInView';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

import tiger from '../../assets/logos/tiger.png';
import whirlLogo from '../../assets/logos/tornado-whirl-logo-transparent.png'; // <-- YOUR TRANSPARENT LOGO

type LoginNav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

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

      navigation.reset({
        index: 0,
        routes: [{ name: 'Startup' }],
      });
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background}}>
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

          <Text
            style={{
              color: theme.headerText,
              fontSize: 23,
              fontFamily: 'Inter',
              fontWeight: '400',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Log in to your Account
          </Text>

          <FadeInView
            delay={150}
            style={{
              width: '85%',
              backgroundColor: theme.card,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 24,
              gap: 12,
            }}
          >
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '400',
              color: theme.textPrimary, 
              
              }}>
                Email</Text>
            <TextInput
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                color: theme.textPrimary,
              }}
              placeholderTextColor={theme.textSecondary}
            />

            <Text style={{ 
              fontSize: 16, 
              fontWeight: '400',
              color: theme.textPrimary, 
              }}>
                Password</Text>
            <View
              style={{
                position: 'relative',
                marginBottom: 16,
              }}
            >
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={{
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 8,
                  padding: 12,
                  paddingRight: 40,
                  color: theme.textPrimary,
                }}
                placeholderTextColor={theme.textSecondary}
              />

              <Pressable
                onPress={() => setShowPassword((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  marginTop: -12,
                  padding: 4,
                }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>


            {/* Error */}
            {error ? (
              <Text style={{ 
                color: theme.accent, 
                textAlign: 'center', 
                marginBottom: 6 
                }}>
                {error}
              </Text>
            ) : null}

            {/* Login Button */}
            <AnimatedButton
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: theme.accent,
                borderRadius: 8,
                padding: 14,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.border,
                opacity: loading ? 0.7 : 1,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: theme.accentText, fontSize: 16, fontWeight: '600' }}>
                {loading ? 'Loading…' : 'Login'}
              </Text>
            </AnimatedButton>

            {/* Link to Sign Up */}
            <View style={{ position: 'absolute', bottom: 15, right: 20 }}>
              <Pressable onPress={() => navigation.navigate('SignUp')}>
                <Text
                  style={{ color: theme.accent, fontSize: 13 }}>
                  Create new account
                </Text>
              </Pressable>
            </View>

            <View style={{ position: 'absolute', bottom: 15, left: 20 }}>
              <Pressable onPress={() => navigation.navigate('Restart')}>
                <Text
                  style={{ color: theme.accent, fontSize: 13, }}>
                  Forgot Password?
                </Text>
              </Pressable>
            </View>
          
          </FadeInView>
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
