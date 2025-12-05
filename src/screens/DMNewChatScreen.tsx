// src/screens/DMNewChatScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

type ProfileRow = {
  id: string;
  email: string;
};

const BG = '#F7EEDB';
const PURPLE = '#7E57C2';

export default function DMNewChatScreen() {
  const navigation = useNavigation<any>();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user', userError);
        setProfiles([]);
        return;
      }

     
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('id', user.id)        
        .order('email', { ascending: true });

      if (error) {
        console.error('Error loading profiles', error);
        setProfiles([]);
        return;
      }

      setProfiles((data ?? []) as ProfileRow[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const getDisplayName = (p: ProfileRow) => {
    if (p.email) {
      const [local] = p.email.split('@');
      return local || p.email;
    }
    return p.id;
  };

 const handleStartChat = async (target: ProfileRow) => {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user', userError);
      return;
    }

    const { data: convo, error: convoErr } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convoErr || !convo) {
      console.error('Error creating conversation', convoErr);
      return;
    }

    const convoId = convo.id as number;

    const { error: selfErr } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: convoId,
        user_id: user.id,
      });

    if (selfErr) {
      console.error('Error adding self as participant', selfErr);
      return;
    }

    const { error: otherErr } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: convoId,
        user_id: target.id,
      });

    if (otherErr) {
      console.error('Error adding target participant', otherErr);
      return;
    }

    navigation.navigate('DMThread', { conversationId: convoId });
  } catch (e) {
    console.error('Error starting chat', e);
  }
};


  const renderItem = ({ item }: { item: ProfileRow }) => {
    const name = getDisplayName(item);
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleStartChat(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New message</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerClose}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={PURPLE} />
          <Text style={styles.loadingText}>Loading people…</Text>
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No other users yet</Text>
          <Text style={styles.emptySubtitle}>
            When more people sign up, you’ll see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={p => p.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3f2b64',
  },
  headerClose: {
    fontSize: 14,
    color: PURPLE,
    fontWeight: '600',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#555',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0d2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: '700',
    color: '#4a2a8a',
  },
  textWrap: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});
