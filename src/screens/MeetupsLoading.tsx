// src/screens/MeetupsLoading.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const IMG_TOP =
  'https://www.figma.com/api/mcp/asset/b423224a-73b2-44b6-85f7-06dc37aea3a1';
const IMG_BACKGROUND =
  'https://www.figma.com/api/mcp/asset/d0b31084-1d39-4440-a66f-5c1be288ce59';

type Meetup = {
  id: string;
  title: string;
  capacity: number;
  currentCount: number;
  location: string;
  description: string;
  joined: boolean;
  startsAt: string;
  host: string;
  participantEmails: string[];
};

export default function MeetupsLoading() {
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    let cancelled = false;
    const MIN_TIME = 600; 
    const start = Date.now();

    const load = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('Error getting user in MeetupsLoading:', userError);
          Alert.alert(
            'Not signed in',
            'You must be logged in to view meetups.'
          );
          
          return;
        }

        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
          .from('meetups')
          .select(`
            id,
            host,
            name,
            description,
            location,
            max_capacity,
            starts_at,
            meetup_participants (
              user_id,
              profiles ( email )
            )
          `)
          .gte('starts_at', nowIso)
          .order('starts_at', { ascending: true });

        if (error) {
          console.error('Error loading meetups in MeetupsLoading:', error);
          Alert.alert(
            'Error',
            'Could not load meetups. Please try again later.'
          );
          return;
        }

        const mapped: Meetup[] =
          (data ?? []).map((row: any) => {
            const participants = row.meetup_participants ?? [];
            return {
              id: String(row.id),
              title: row.name,
              description: row.description,
              location: row.location,
              capacity: row.max_capacity,
              currentCount: participants.length,
              joined: participants.some((p: any) => p.user_id === user.id),
              startsAt: row.starts_at,
              host: row.host,
              participantEmails: participants.map(
                (p: any) => p.profiles?.email ?? ''
              ),
            };
          }) ?? [];

        const elapsed = Date.now() - start;
        const wait = Math.max(0, MIN_TIME - elapsed);

        if (cancelled) return;

        setTimeout(() => {
          if (cancelled) return;
          navigation.navigate('MeetupsMain', {
            preloadedMeetups: mapped,
            currentUserId: user.id,
          });
        }, wait);
      } catch (e) {
        console.error('Unexpected error in MeetupsLoading:', e);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.bgWrapper}>
        <Image
          source={{ uri: IMG_BACKGROUND }}
          style={styles.bgImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.mainWrapper}>
        <Image
          source={{ uri: IMG_TOP }}
          style={styles.mainImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  bgWrapper: {
    position: 'absolute',
    left: -83,
    top: 319,
    width: 541,
    height: 541,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  mainWrapper: {
    position: 'absolute',
    left: 12,
    top: 147,
    width: 351,
    height: 343,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
});
