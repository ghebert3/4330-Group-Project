import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type ProfileRow = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
};

const BG = '#F7EEDB';
const PURPLE = '#7E57C2';

export default function DMNewChatScreen() {
  const navigation = useNavigation<any>();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('Error getting user for new chat', userError);
          setProfiles([]);
          return;
        }

        // Load all profiles except me
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, email')
          .neq('id', user.id)
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error loading profiles', error);
          setProfiles([]);
          return;
        }

        setProfiles((data ?? []) as ProfileRow[]);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const displayName = (p: ProfileRow) =>
    p.full_name || p.username || p.email || 'Unknown user';

  const startChatWith = async (otherUserId: string) => {
    if (creatingFor) return;
    setCreatingFor(otherUserId);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user in startChatWith', userError);
        return;
      }

      // 1) Create a new conversation
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

      // 2) Add ME as participant first
      const { error: partErrMe } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: convoId,
          user_id: user.id,
        });

      if (partErrMe) {
        console.error('Error adding self to conversation', partErrMe);
        return;
      }

      // 3) Then add OTHER user as participant
      const { error: partErrOther } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: convoId,
          user_id: otherUserId,
        });

      if (partErrOther) {
        console.error('Error adding other user to conversation', partErrOther);
        return;
      }

      // 4) Jump into the DM thread
      navigation.replace('DMThread', { conversationId: convoId });
    } finally {
      setCreatingFor(null);
    }
  };

  const renderItem = ({ item }: { item: ProfileRow }) => {
    const isBusy = creatingFor === item.id;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => startChatWith(item.id)}
        disabled={isBusy}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(displayName(item)[0] || '?').toUpperCase()}
          </Text>
        </View>
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>{displayName(item)}</Text>
          {item.email ? (
            <Text style={styles.rowSubtitle}>{item.email}</Text>
          ) : null}
        </View>
        {isBusy && <ActivityIndicator size="small" color={PURPLE} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New chat</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerCancel}>Cancel</Text>
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
            Once more people join Whirl, you&rsquo;ll see them here.
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3f2b64',
  },
  headerCancel: {
    fontSize: 14,
    color: PURPLE,
    fontWeight: '600',
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
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e0d2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontWeight: '700',
    color: '#4a2a8a',
  },
  rowTextWrap: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  rowSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
});
