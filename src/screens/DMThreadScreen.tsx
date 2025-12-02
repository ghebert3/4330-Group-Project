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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import type { RootStackParamList } from '../navigation/types';

type DMThreadRouteProp = RouteProp<RootStackParamList, 'DMThread'>;

type MessageRow = {
  id: number;
  conversation_id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
};

const BG = '#F7EEDB';
const PURPLE = '#7E57C2';

export default function DMThreadScreen() {
  const route = useRoute<DMThreadRouteProp>();
  const { conversationId } = route.params;

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [otherUser, setOtherUser] = useState<ProfileRow | null>(null);
  const [loadingOther, setLoadingOther] = useState(true);

  // -------- Load current user & messages ----------
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user in DMThread', userError);
        setMessages([]);
        setCurrentUserId(null);
        return;
      }

      setCurrentUserId(user.id);

      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, body, created_at')
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

  // -------- Load other participant info ----------
  const loadOtherUser = useCallback(async () => {
    try {
      setLoadingOther(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error getting user in loadOtherUser', userError);
        setOtherUser(null);
        return;
      }

      // Get participants + join profiles
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('user_id, profiles ( id, full_name, username, email )')
        .eq('conversation_id', conversationId);

      if (error) {
        console.error('Error loading participants for header', error);
        setOtherUser(null);
        return;
      }

      const participants = (data ?? []) as any[];

      // Find the participant that is NOT me
      const other = participants.find(p => p.user_id !== user.id);

      if (other && other.profiles) {
        setOtherUser({
          id: other.profiles.id,
          full_name: other.profiles.full_name,
          username: other.profiles.username,
          email: other.profiles.email,
        });
      } else {
        // Fallback: maybe only you are in this convo for now
        setOtherUser(null);
      }
    } finally {
      setLoadingOther(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    loadOtherUser();
  }, [loadMessages, loadOtherUser]);

  // -------- Sending a message ----------
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !currentUserId) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          body: text,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message', error);
        return;
      }

      setMessages(prev => [...prev, data as MessageRow]);
      setInput('');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: MessageRow }) => {
    const isMine = item.sender_id === currentUserId;
    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.messageMine : styles.messageTheirs,
        ]}
      >
        <Text style={styles.messageText}>{item.body}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  const headerDisplayName = () => {
    if (!otherUser) return 'New conversation';
    return (
      otherUser.full_name ||
      otherUser.username ||
      otherUser.email ||
      'Conversation'
    );
  };

  const headerInitial = () => {
    const name = headerDisplayName();
    return name[0]?.toUpperCase() ?? '?';
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* 🔝 Header with other user */}
      <View style={styles.threadHeader}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>{headerInitial()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{headerDisplayName()}</Text>
          <Text style={styles.headerSubtitle}>
            {loadingOther ? 'Loading…' : 'Direct message'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.flex}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color={PURPLE} />
              <Text style={{ marginTop: 8, color: '#555' }}>
                Loading messages…
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Say hi to start the conversation.
              </Text>
            </View>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={item => item.id.toString()}
              renderItem={renderMessage}
              contentContainerStyle={styles.messagesList}
            />
          )}
        </View>

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || sending) && { opacity: 0.5 },
            ]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '...' : 'Send'}
            </Text>
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
  flex: {
    flex: 1,
  },
  // Header styles
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
    backgroundColor: 'rgba(247,238,219,0.97)',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0d2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerAvatarText: {
    fontWeight: '700',
    color: '#4a2a8a',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#3f2b64',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7a6c88',
    marginTop: 2,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginVertical: 4,
  },
  messageMine: {
    alignSelf: 'flex-end',
    backgroundColor: PURPLE,
  },
  messageTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
  },
  messageText: {
    color: '#111',
  },
  messageTime: {
    marginTop: 2,
    fontSize: 10,
    color: '#666',
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#f2f2f2',
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: PURPLE,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
