// src/screens/DMThreadScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme';

type MessageRow = {
  id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

type RouteParams = {
  conversationId: number;
};

const BG = '#F7EEDB';
const PURPLE = '#7E57C2';

export default function DMThreadScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { conversationId } = route.params as RouteParams;

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  const [otherUserName, setOtherUserName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ---- Load current user once ----
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('Error getting current user in DMThread', error);
        return;
      }
      setCurrentUserId(data.user?.id ?? null);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // ---- Load messages ----
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, body, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages', error);
        setMessages([]);
        return;
      }

      setMessages((data ?? []) as MessageRow[]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // ---- Load "other user" for header ----
  const loadOtherUser = useCallback(async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user for header', userError);
        return;
      }

      const { data: parts, error: partsErr } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);

      if (partsErr) {
        console.error(
          'Error loading participants for header',
          partsErr
        );
        return;
      }

      const participants = parts ?? [];
      const other = participants.find((p: any) => p.user_id !== user.id);

      if (!other) {
        setOtherUserName('New conversation');
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', other.user_id)
        .single();

      if (profErr || !prof) {
        console.error(
          'Error loading other user profile for header',
          profErr
        );
        setOtherUserName('Conversation');
        return;
      }

      const email: string = (prof.email as string) ?? '';
      const localPart = email.split('@')[0] || email;
      setOtherUserName(localPart);
    } catch (e) {
      console.error('Unexpected error loading header user', e);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    loadOtherUser();
  }, [loadMessages, loadOtherUser]);

  // ---- Send a message ----
  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user for send', userError);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          body,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message', error);
        return;
      }

      setMessages(prev => [...prev, data as MessageRow]);
      setText('');
    } finally {
      setSending(false);
    }
  };

  // ---- Render each message ----
  const renderItem = ({ item }: { item: MessageRow }) => {
    const isMine =
      currentUserId != null && item.sender_id === currentUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.messageMine : styles.messageTheirs,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isMine && { color: 'white' },
          ]}
        >
          {item.body}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isMine && { color: '#e0dfff' },
          ]}
        >
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{'< Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {otherUserName ?? 'Conversation'}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Messages */}
        {loading ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptySubtitle}>Loading messages…</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptySubtitle}>
              Say hi to start the conversation.
            </Text>
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
          />
        )}

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!text.trim() || sending) && { opacity: 0.5 },
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    height: 52,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backText: {
    fontSize: 14,
    color: PURPLE,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3f2b64',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    marginVertical: 4,
  },
  messageMine: {
    backgroundColor: PURPLE,
    alignSelf: 'flex-end',
  },
  messageTheirs: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#111',
  },
  messageTime: {
    fontSize: 10,
    color: '#777',
    marginTop: 2,
    textAlign: 'right',
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
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: PURPLE,
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
