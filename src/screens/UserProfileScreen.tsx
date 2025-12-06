import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Pressable, Modal, Alert } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme";

export default function UserProfileScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const userId: string | undefined = route?.params?.userId;
  const { theme } = useTheme();

  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [posts, setPosts] = useState<Array<{ id: number; image_url: string | null; caption: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postModalUri, setPostModalUri] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const me = auth?.user?.id ?? null;
      setCurrentUserId(me);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio, tags, looking_for")
        .eq("id", userId)
        .single();
      setDisplayName(profile?.display_name ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setBio(profile?.bio ?? "");
      setTags(profile?.tags ?? []);
      setLookingFor(profile?.looking_for ?? []);

      const { data: userPosts } = await supabase
        .from("posts")
        .select("id, image_url, caption")
        .eq("author", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setPosts((userPosts ?? []).map(p => ({ id: p.id, image_url: p.image_url ?? null, caption: p.caption ?? null })));

      // Determine follow connection state
      if (me && userId && me !== userId) {
        const { data: followRows } = await supabase
          .from('follows')
          .select('id')
          .eq('follower', me)
          .eq('followee', userId)
          .limit(1);
        setIsConnected(!!(followRows && followRows.length > 0));
      } else {
        setIsConnected(false);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (!userId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}><Text style={{ color: theme.danger, padding: 16 }}>No user specified.</Text></View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={[styles.container, { backgroundColor: theme.background }] }>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: theme.border }] }>
            <Text style={{ color: theme.textPrimary, fontSize: 16 }}>←</Text>
          </Pressable>
        </View>
        <Pressable onPress={() => setAvatarModalVisible(true)}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Image source={require("../../assets/avatars/Default_pfp.jpg")} style={styles.avatar} />
          )}
        </Pressable>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{displayName || "User"}</Text>
          {isConnected ? (
            <View style={[styles.badge, { backgroundColor: theme.chipBg, borderColor: theme.border }] }>
              <Text style={[styles.badgeText, { color: theme.accent }]}>Campus Connected</Text>
            </View>
          ) : null}
        </View>
        {bio ? <Text style={[styles.bio, { color: theme.textSecondary }]}>{bio}</Text> : null}
        {isConnected ? (
          <Pressable
            disabled={connecting}
            onPress={async () => {
              try {
                setConnecting(true);
                const { data: auth } = await supabase.auth.getUser();
                const me = auth.user?.id;
                if (!me) { Alert.alert("Not signed in", "Please sign in first."); return; }
                const { error } = await supabase
                  .from('follows')
                  .delete()
                  .eq('follower', me)
                  .eq('followee', userId);
                if (error) { Alert.alert('Error', 'Could not remove connection.'); }
                else { setIsConnected(false); Alert.alert('Disconnected', 'Campus connection removed.'); }
              } finally {
                setConnecting(false);
              }
            }}
            style={[styles.connectBtn, { borderColor: theme.border, opacity: connecting ? 0.6 : 1 }]}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>
              {connecting ? 'Removing…' : 'Unconnect'}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={connecting || (currentUserId !== null && currentUserId === userId)}
            onPress={async () => {
              try {
                setConnecting(true);
                const { data: auth } = await supabase.auth.getUser();
                const me = auth.user?.id;
                if (!me) { Alert.alert("Not signed in", "Please sign in first."); return; }
                if (me === userId) { Alert.alert('Not allowed', 'You cannot connect with yourself.'); return; }

                // Re-check to guard against race conditions
                const { data: existing } = await supabase
                  .from('follows')
                  .select('id')
                  .eq('follower', me)
                  .eq('followee', userId)
                  .limit(1);
                if (existing && existing.length > 0) { setIsConnected(true); return; }

                const { error } = await supabase
                  .from('follows')
                  .insert({ follower: me, followee: userId });
                if (error) { Alert.alert('Error', 'Could not create connection.'); }
                else { setIsConnected(true); Alert.alert('Connected', 'Campus connection established.'); }
              } finally {
                setConnecting(false);
              }
            }}
            style={[styles.connectBtn, { borderColor: theme.accent, opacity: connecting ? 0.6 : 1 }]}
          >
            <Text style={{ color: theme.accent, fontWeight: '700' }}>
              {connecting ? 'Connecting…' : 'Make Campus Connection'}
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Looking For</Text>
        {lookingFor.length === 0 ? (
          <Text style={[styles.muted, { color: theme.textSecondary }]}>No preferences listed.</Text>
        ) : (
          <View style={styles.chipRow}>
            {lookingFor.map((l, i) => (
              <View key={`${l}-${i}`} style={[styles.chip, { backgroundColor: theme.chipBg, borderColor: theme.border }] }>
                <Text style={[styles.chipText, { color: theme.chipText }]}>{l}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tags</Text>
        {tags.length === 0 ? (
          <Text style={[styles.muted, { color: theme.textSecondary }]}>No tags listed.</Text>
        ) : (
          <View style={styles.chipRow}>
            {tags.map((t, i) => (
              <View key={`${t}-${i}`} style={[styles.chip, { backgroundColor: theme.chipBg, borderColor: theme.border }] }>
                <Text style={[styles.chipText, { color: theme.chipText }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Posts</Text>
        {loading && (
          <View style={{ paddingVertical: 8 }}>
            <ActivityIndicator />
          </View>
        )}
        {!loading && posts.length === 0 && (
          <Text style={[styles.muted, { color: theme.textSecondary }]}>No posts yet.</Text>
        )}
        {!loading && posts.map(p => (
          <View key={p.id} style={styles.postCard}>
            {p.image_url ? (
              <Pressable onPress={() => { setPostModalUri(p.image_url!); setPostModalVisible(true); }}>
                <Image source={{ uri: p.image_url }} style={styles.postImage} resizeMode="cover" />
              </Pressable>
            ) : null}
            {p.caption ? <Text style={[styles.postCaption, { color: theme.textPrimary }]}>{p.caption}</Text> : null}
          </View>
        ))}
      </View>

      {/* Avatar enlarge modal */}
      <Modal visible={avatarModalVisible} transparent animationType="fade" onRequestClose={() => setAvatarModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAvatarModalVisible(false)} />
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.modalImage} resizeMode="contain" />
          ) : (
            <Image source={require("../../assets/avatars/Default_pfp.jpg")} style={styles.modalImage} resizeMode="contain" />
          )}
        </View>
      </Modal>

      {/* Post enlarge modal */}
      <Modal visible={postModalVisible} transparent animationType="fade" onRequestClose={() => setPostModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPostModalVisible(false)} />
          {postModalUri ? (
            <Image source={{ uri: postModalUri }} style={styles.modalImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 20 },
  headerRow: { position: 'absolute', top: 12, left: 12 },
  backBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#ddd" },
  name: { marginTop: 8, fontSize: 20, fontWeight: "700" },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderRadius: 999 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  bio: { marginTop: 6, fontSize: 14, textAlign: "center", paddingHorizontal: 24 },
  connectBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderRadius: 999 },
  section: { paddingHorizontal: 16, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  muted: { },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderRadius: 999, marginRight: 6, marginBottom: 6 },
  chipText: { fontSize: 12 },
  postCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden" },
  postImage: { width: "100%", height: 160 },
  postCaption: { padding: 10, fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '95%', height: '80%' },
});
