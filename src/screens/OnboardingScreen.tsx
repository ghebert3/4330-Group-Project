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
import { useTheme } from '../theme';

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
  const { theme } = useTheme();

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
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: theme.background },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.logoText, { color: theme.accentText }]}>Whirl</Text>

        <View style={[
          styles.card,
            {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.textPrimary,
            }
          ]}
        >
          <Text style={[styles.title, { color: theme.textPrimary }]}>Set up your profile</Text>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Let other LSU students know who you are and what you&apos;re looking for.
          </Text>

          {/* Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.textPrimary,
                }
              ]}
            />
          </View>

          {/* Major */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Major</Text>
            <TextInput
              value={major}
              onChangeText={setMajor}
              placeholder="Computer Science, Business, etc."
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.textPrimary,
                }
              ]}
            />
          </View>

          {/* Tags */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Tags</Text>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              Separate tags with commas (ex. &quot;Study partner, Gaming, Gym&quot;).
            </Text>
            <TextInput
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="Study partner, Gaming, Gym"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.input, 
                { height: 70,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.textPrimary,
                 },
                ]}
              />
            {tags.length > 0 && (
              <View style={styles.chipRow}>
                {tags.map((tag, idx) => (
                  <View key={`${tag}-${idx}`} style={[
                    styles.chip,
                    {
                      backgroundColor: theme.chipBg,
                    }
                    ]}>
                    <Text 
                      style={[
                        styles.chipText,
                        {
                          color: theme.chipText,
                        }
                      ]}
                      >
                        {tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Looking For */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Looking for</Text>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              What do you want from Whirl? (ex. &quot;Friends to go to games with&quot;).
            </Text>
            <TextInput
              value={lookingForInput}
              onChangeText={setLookingForInput}
              placeholder="Study buddies, people to go to Tigerland with..."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[
                styles.input, 
                { 
                  height: 90 ,
                  borderColor: theme.border,
                  backgroundColor: theme.card,
                  color: theme.textPrimary,
                },
              ]}
            />
            {lookingForItems.length > 0 && (
              <View style={styles.chipRow}>

                {lookingForItems.map((item, idx) => (
                  <View 
                  key={`${item}-${idx}`} style={[
                    styles.chip, 
                    { backgroundColor: theme.chipActiveBg },
                    ]}
                      >
                    <Text style={[
                      styles.chipText,
                      {
                        color: theme.chipTextActive
                      },
                    ]}
                    >{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              style={[
                styles.button,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderWidth: 1,
                }
              ]}
              onPress={handleSkip}
              disabled={saving}
            >
              <Text style={{
                color: theme.textPrimary,
                fontWeight: '600'
                }}>
                Skip for now
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.button, 
                {
                  backgroundColor: theme.accent },
              ]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={theme.accentText} />
              ) : (
                <Text style={{ color: theme.accentText, fontWeight: '700'}}>
                  Save and continue
                  </Text>
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
  },
  logoText: {
    fontFamily: 'CherryBomb',
    fontSize: 42,
    marginBottom: 20,
  },
  card: {
    width: '88%',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontFamily: 'CherryBomb',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  chip: {
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
});