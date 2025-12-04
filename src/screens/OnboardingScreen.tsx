import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function parseList(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function OnboardingScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');
  const [saving, setSaving] = useState(false);

  const tags = parseList(tagsInput);
  const lookingForItems = parseList(lookingForInput);

  async function handleSave() {
    if (!name.trim() || !major.trim()) {
        Alert.alert('Missing info', 'Please fill out your Name and Major.');
        return;
    }

    setSaving(true);
    try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
        throw userError || new Error('No logged in user');
        }

        const user = userData.user;

        const tags = parseList(tagsInput);
        const lookingForItems = parseList(lookingForInput);

        const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
            {
            id: user.id,                    
            display_name: name.trim(),      // <- for Profile name
            major: major.trim(),
            tags,
            looking_for: lookingForItems,
            onboarding_complete: true,
            last_onboarding_at: new Date().toISOString(),
            // you can also initialize bio here if you want
            },
            {
            onConflict: 'id',
            }
        );

        if (profileError) {
        throw profileError;
        }

        Alert.alert('Welcome to Whirl!', 'Your profile is set up.');
        navigation.reset({
        index: 0,
        routes: [{ name: 'AppTabs' }],
        });
    } catch (err: any) {
        console.error('Onboarding save error:', err);
        Alert.alert('Error', err.message || 'Could not save profile. Try again.');
    } finally {
        setSaving(false);
    }
    }


  function handleSkip() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AppTabs' }],
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#461D7C' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logoText}>Whirl</Text>

        <View style={styles.card}>
          <Text style={styles.title}>Set up your profile</Text>
          <Text style={styles.subtitle}>
            Let other LSU students know who you are and what you&apos;re looking for.
          </Text>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* Major */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Major</Text>
            <TextInput
              value={major}
              onChangeText={setMajor}
              placeholder="Computer Science, Business, etc."
              placeholderTextColor="#999"
              style={styles.input}
            />
          </View>

          {/* Tags */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tags</Text>
            <Text style={styles.helperText}>
              Separate tags with commas (ex. &quot;Study partner, Gaming, Gym&quot;).
            </Text>
            <TextInput
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="Study partner, Gaming, Gym"
              placeholderTextColor="#999"
              style={[styles.input, { height: 70 }]}
              multiline
            />
            {tags.length > 0 && (
              <View style={styles.chipRow}>
                {tags.map((tag, idx) => (
                  <View key={`${tag}-${idx}`} style={styles.chip}>
                    <Text style={styles.chipText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Looking For */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Looking for</Text>
            <Text style={styles.helperText}>
              What do you want from Whirl? (ex. &quot;Friends to go to games with&quot;).
            </Text>
            <TextInput
              value={lookingForInput}
              onChangeText={setLookingForInput}
              placeholder="Study buddies, people to go to Tigerland with..."
              placeholderTextColor="#999"
              style={[styles.input, { height: 90 }]}
              multiline
            />
            {lookingForItems.length > 0 && (
              <View style={styles.chipRow}>
                {lookingForItems.map((item, idx) => (
                  <View key={`${item}-${idx}`} style={[styles.chip, { backgroundColor: '#E9E3FF' }]}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSkip}
              disabled={saving}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Skip for now
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.primaryButton]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save and continue</Text>
              )}
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#461D7C',
  },
  logoText: {
    fontFamily: 'CherryBomb',
    fontSize: 42,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  card: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'CherryBomb',
    marginBottom: 4,
    color: '#2C2C2C',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  chip: {
    backgroundColor: '#EEE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 11,
    fontFamily: 'CherryBomb',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#461D7C',
  },
  secondaryButton: {
    backgroundColor: '#F2ECFF',
    borderWidth: 1,
    borderColor: '#D9C8FF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#461D7C',
  },
});