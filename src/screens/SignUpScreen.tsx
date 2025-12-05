const EMAIL_CONFIRM_URL = 'https://joinwhirl.fun/auth/confirm';

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import tiger from '../../assets/logos/tiger.png';
import whirlLogo from '../../assets/logos/tornado-whirl-logo-transparent.png';

type SignUpNav = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<SignUpNav>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const H = Dimensions.get('window').height;

  async function handleSignUp() {
    setError('');

    if (!email || !password || !confirm) {
      setError('All fields are required');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: EMAIL_CONFIRM_URL,
        },
      });
      if (error) throw error;

      navigation.navigate('Login');
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed');
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
        {/* Main content area (no ScrollView) */}
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            paddingTop: 10,
            paddingHorizontal: 16,
          }}
        >
          {/* Logo */}
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
              color: 'white',
              fontSize: 23,
              fontFamily: 'Inter',
              fontWeight: '400',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            Create your Account
          </Text>

          {/* White Card */}
          <View
            style={{
              width: '85%',
              backgroundColor: 'white',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D9D9D9',
              padding: 24,
              gap: 12,
              marginBottom: 24,
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
            <View
              style={{
                position: 'relative',
                marginBottom: 8,
              }}
            >
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#D9D9D9',
                  borderRadius: 8,
                  padding: 12,
                  paddingRight: 40,
                }}
                placeholderTextColor="#B3B3B3"
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
                  color="#666"
                />
              </Pressable>
            </View>


            {/* Confirm Password */}
            <Text style={{ fontSize: 16, fontWeight: '400' }}>Confirm Password</Text>
            <View
              style={{
                position: 'relative',
                marginBottom: 16,
              }}
            >
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={setConfirm}
                style={{
                  borderWidth: 1,
                  borderColor: '#D9D9D9',
                  borderRadius: 8,
                  padding: 12,
                  paddingRight: 40,
                }}
                placeholderTextColor="#B3B3B3"
              />
              <Pressable
                onPress={() => setShowConfirm((prev) => !prev)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  marginTop: -12,
                  padding: 4,
                }}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </Pressable>
            </View>

            {error ? (
              <Text
                style={{
                  color: 'red',
                  textAlign: 'center',
                  marginBottom: 6,
                }}
              >
                {error}
              </Text>
            ) : null}

            {/* Sign Up Button */}
            <Pressable
              onPress={handleSignUp}
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
                {loading ? 'Creating Account…' : 'Sign Up'}
              </Text>
            </Pressable>

            {/* Link to Login */}
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
              <Text style={{ color: 'black', fontSize: 15 }}>Have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Login')}>
                <Text
                  style={{
                    color: '#551A8B',
                    fontSize: 15,
                    marginLeft: 4,
                  }}
                >
                  Log in
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Tiger footer */}
      <View
        style={{
          width: '100%',
          height: H * 0.2,
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <Image
          source={tiger}
          style={{
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
        />
      </View>
    </View>
  );
}
