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
import { useTheme } from '../theme';
import type { Theme } from '../theme';

type ConversationRow = {
  id: number;
  title: string;
  lastMessageBody: string | null;
  lastMessageAt: string | null;
};

export default function DMListScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = makeStyles(theme);

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

      const currentUserId = user.id;

      const { data: parts, error: partsErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', currentUserId);

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

      const { data: allParts, error: allPartsErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id, profiles ( email )')
        .in('conversation_id', convoIds);

      if (allPartsErr) {
        console.error('Error loading participant emails', allPartsErr);
      }

      const titleByConvo = new Map<number, string>();

      (allParts ?? []).forEach((row: any) => {
        const cid = row.conversation_id as number;
        const uid = row.user_id as string;

        if (uid === currentUserId) return;

        if (!titleByConvo.has(cid)) {
          const email: string = row.profiles?.email ?? '';
          const localPart = email.split('@')[0] || email || 'Conversation';
          titleByConvo.set(cid, localPart);
        }
      });

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

      const rows: ConversationRow[] = [];

      convoIds.forEach(cid => {
        const latest = latestByConvo.get(cid);
        if (!latest) {
          return;
        }

        const fallbackTitle = `Conversation ${cid}`;
        rows.push({
          id: cid,
          title: titleByConvo.get(cid) ?? fallbackTitle,
          lastMessageBody: latest.body,
          lastMessageAt: latest.created_at,
        });
      });

      rows.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return (
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime()
        );
      });

      const unique: ConversationRow[] = [];
      const seenTitles = new Set<string>();

      for (const row of rows) {
        if (seenTitles.has(row.title)) continue;
        seenTitles.add(row.title);
        unique.push(row);
      }

      setConversations(unique);
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
            {item.title.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowPreview} numberOfLines={1}>
            {preview}
          </Text>
        </View>

        <Text style={styles.rowTime}>{formatTime(item.lastMessageAt)}</Text>
      </TouchableOpacity>
    );
  };

  const handleNewChat = () => {
    navigation.navigate('DMNewChat');
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>

        <TouchableOpacity style={styles.newButton} onPress={handleNewChat}>
          <Text style={styles.newButtonText}>+ New chat</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={theme.accent} />
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

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.background,
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
      color: theme.textPrimary,
      fontFamily: 'CherryBomb',
    },
    newButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: theme.accent,
    },
    newButtonText: {
      color: theme.accentText,
      fontSize: 13,
      fontFamily: 'CherryBomb',
    },
    loadingWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 16,
    },
    loadingText: {
      marginLeft: 10,
      color: theme.textSecondary,
      fontFamily: 'CherryBomb',
    },
    emptyWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 18,
      color: theme.textPrimary,
      marginBottom: 4,
      fontFamily: 'CherryBomb',
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      fontFamily: 'CherryBomb',
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
      backgroundColor: theme.card,
    },
    rowAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: theme.chipBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    avatarText: {
      color: theme.accent,
      fontFamily: 'CherryBomb',
      fontSize: 18,
    },
    rowTextWrap: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 15,
      color: theme.textPrimary,
      fontFamily: 'CherryBomb',
    },
    rowPreview: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
      fontFamily: 'CherryBomb',
    },
    rowTime: {
      fontSize: 11,
      color: theme.textSecondary,
      marginLeft: 8,
      fontFamily: 'CherryBomb',
    },
  });
}
