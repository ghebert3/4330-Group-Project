import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Pressable, Modal } from "react-native";
import { useRoute } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

export default function UserProfileScreen() {
  const route = useRoute<any>();
  const userId: string | undefined = route?.params?.userId;

  const [displayName, setDisplayName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [bio, setBio] = useState<string>("");
  const [posts, setPosts] = useState<Array<{ id: number; image_url: string | null; caption: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postModalUri, setPostModalUri] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      setLoading(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, bio")
        .eq("id", userId)
        .single();
      setDisplayName(profile?.display_name ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setBio(profile?.bio ?? "");

      const { data: userPosts } = await supabase
        .from("posts")
        .select("id, image_url, caption")
        .eq("author", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setPosts((userPosts ?? []).map(p => ({ id: p.id, image_url: p.image_url ?? null, caption: p.caption ?? null })));
      setLoading(false);
    }
    load();
  }, [userId]);

  if (!userId) {
    return (
      <View style={styles.container}><Text style={{ color: '#b00020', padding: 16 }}>No user specified.</Text></View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 80 }} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setAvatarModalVisible(true)}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Image source={require("../../assets/avatars/Default_pfp.jpg")} style={styles.avatar} />
          )}
        </Pressable>
        <Text style={styles.name}>{displayName || "User"}</Text>
        {bio ? <Text style={styles.bio}>{bio}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Posts</Text>
        {loading && (
          <View style={{ paddingVertical: 8 }}>
            <ActivityIndicator />
          </View>
        )}
        {!loading && posts.length === 0 && (
          <Text style={styles.muted}>No posts yet.</Text>
        )}
        {!loading && posts.map(p => (
          <View key={p.id} style={styles.postCard}>
            {p.image_url ? (
              <Pressable onPress={() => { setPostModalUri(p.image_url!); setPostModalVisible(true); }}>
                <Image source={{ uri: p.image_url }} style={styles.postImage} resizeMode="cover" />
              </Pressable>
            ) : null}
            {p.caption ? <Text style={styles.postCaption}>{p.caption}</Text> : null}
          </View>
        ))}
      </View>
      {/* Avatar enlarge modal */
      }
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
  container: { flex: 1, backgroundColor: "white" },
  header: { alignItems: "center", paddingVertical: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: "#ddd" },
  name: { marginTop: 8, fontSize: 20, fontWeight: "700" },
  bio: { marginTop: 6, fontSize: 14, color: "#555", textAlign: "center", paddingHorizontal: 24 },
  section: { paddingHorizontal: 16, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  muted: { color: "#777" },
  postCard: { marginBottom: 12, borderRadius: 12, overflow: "hidden", backgroundColor: "#f7f7f7" },
  postImage: { width: "100%", height: 160 },
  postCaption: { padding: 10, fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '95%', height: '80%' },
});
