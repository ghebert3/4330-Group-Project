// src/screens/DMListScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

type ConversationRow = {
  id: number;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
};

const BG = '#F7EEDB';
const PURPLE = '#7E57C2';

export default function DMListScreen() {
  const navigation = useNavigation<any>();

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user', userError);
        setConversations([]);
        return;
      }

      // 1) Get all conversation_ids where I'm a participant
      const { data: parts, error: partsErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (partsErr) {
        console.error('Error loading conversation participants', partsErr);
        setConversations([]);
        return;
      }

      const convoIds = (parts ?? []).map(p => p.conversation_id as number);

      if (convoIds.length === 0) {
        setConversations([]);
        return;
      }

      // 2) Get all messages in those conversations, newest first
      const { data: msgs, error: msgsErr } = await supabase
        .from('messages')
        .select('id, conversation_id, body, created_at')
        .in('conversation_id', convoIds)
        .order('created_at', { ascending: false });

      if (msgsErr) {
        console.error('Error loading messages for list', msgsErr);
        setConversations([]);
        return;
      }

      const latestByConvo = new Map<
        number,
        { body: string; created_at: string }
      >();

      (msgs ?? []).forEach((m: any) => {
        const cid = m.conversation_id as number;
        if (!latestByConvo.has(cid)) {
          latestByConvo.set(cid, {
            body: m.body as string,
            created_at: m.created_at as string,
          });
        }
      });

      const rows: ConversationRow[] = convoIds.map(cid => {
        const latest = latestByConvo.get(cid);
        return {
          id: cid,
          lastMessageBody: latest?.body ?? null,
          lastMessageAt: latest?.created_at ?? null,
        };
      });

      // Sort by last message time (newest first)
      rows.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return (
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
        );
      });

      setConversations(rows);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const renderItem = ({ item }: { item: ConversationRow }) => {
    const preview = item.lastMessageBody ?? 'No messages yet';
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() =>
          navigation.navigate('DMThread', { conversationId: item.id })
        }
      >
        <View style={styles.rowAvatar}>
          <Text style={styles.avatarText}>
            {String(item.id).slice(-2)} {/* temp avatar */}
          </Text>
        </View>

        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>Conversation #{item.id}</Text>
          <Text style={styles.rowPreview} numberOfLines={1}>
            {preview}
          </Text>
        </View>

        <Text style={styles.rowTime}>{formatTime(item.lastMessageAt)}</Text>
      </TouchableOpacity>
    );
  };

  // 👉 New chat now just navigates to the "pick user" screen
  const handleNewChat = () => {
    navigation.navigate('DMNewChat');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity
          style={styles.newButton}
          onPress={handleNewChat}
        >
          <Text style={styles.newButtonText}>+ New chat</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={PURPLE} />
          <Text style={styles.loadingText}>Loading conversations…</Text>
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap “+ New chat” to start one.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
    fontSize: 28,
    fontWeight: '700',
    color: '#3f2b64',
  },
  newButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: PURPLE,
  },
  newButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
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
  rowAvatar: {
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
  rowPreview: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  rowTime: {
    fontSize: 11,
    color: '#999',
    marginLeft: 8,
  },
});
