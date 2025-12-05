// src/screens/DMNewChatScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

type ProfileRow = {
  id: string;
  email: string | null;
};

const BG = '#F7EEDB';
const PURPLE = '#7E57C2';

export default function DMNewChatScreen() {
  const navigation = useNavigation<any>();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

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

      // Load other app users from your profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('id', user.id)          // don't show myself
        .order('email', { ascending: true });

      if (error) {
        console.error('Error loading profiles', error);
        setProfiles([]);
        return;
      }

      const rows: ProfileRow[] = (data ?? []).map((p: any) => ({
        id: p.id as string,
        email: (p.email as string) ?? null,
      }));

      setProfiles(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const handleStartChat = async (otherUserId: string) => {
    if (creating) return;
    setCreating(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user', userError);
        return;
      }

      const myId = user.id;

      // 1) All conversations I'm in
      const { data: myParts, error: myPartsErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', myId);

      if (myPartsErr) {
        console.error('Error loading my convos', myPartsErr);
        return;
      }

      const myConvoIds = (myParts ?? []).map(
        p => p.conversation_id as number
      );

      let existingConvoId: number | undefined;

      if (myConvoIds.length > 0) {
        // 2) Among those, which convos also contain the other user?
        const { data: overlap, error: overlapErr } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
          .in('conversation_id', myConvoIds);

        if (overlapErr) {
          console.error('Error checking existing convo', overlapErr);
          return;
        }

        existingConvoId = overlap?.[0]?.conversation_id as
          | number
          | undefined;
      }

      // 3) If one exists -> reuse it
      if (existingConvoId) {
        navigation.navigate('DMThread', { conversationId: existingConvoId });
        return;
      }

      // 4) Otherwise create a new conversation
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

      // Add me
      const { error: partErr1 } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: convoId,
          user_id: myId,
        });

      if (partErr1) {
        console.error('Error adding self as participant', partErr1);
        return;
      }

      // Add the other user
      const { error: partErr2 } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: convoId,
          user_id: otherUserId,
        });

      if (partErr2) {
        console.error('Error adding other user as participant', partErr2);
        return;
      }

      navigation.navigate('DMThread', { conversationId: convoId });
    } finally {
      setCreating(false);
    }
  };

  const renderItem = ({ item }: { item: ProfileRow }) => {
    const label = item.email ?? '(no email)';
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleStartChat(item.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {label.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New message</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={PURPLE} />
          <Text style={styles.loadingText}>Loading people…</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={item => item.id}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3f2b64',
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 10,
    color: '#555',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0d2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: '700',
    color: '#4a2a8a',
  },
  email: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
});
