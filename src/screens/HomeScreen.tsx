import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

type FeedPost = {
  id: number;
  image_url: string | null;
  caption: string | null;
  created_at: string;
  author: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function HomeScreen() {
  const { theme } = useTheme();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigation = useNavigation();
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [photoModalUri, setPhotoModalUri] = useState<string | null>(null);
  const [moments, setMoments] = useState<Array<{ id: number; image_url: string }>>([]);
  const [momentsLoading, setMomentsLoading] = useState(false);

  useEffect(() => {
    const loadMe = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (uid) {
        setCurrentUserId(uid);
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", uid)
          .single();
        setMyAvatar((data as any)?.avatar_url ?? null);
      }
    };
    const loadMoments = async () => {
      setMomentsLoading(true);
      const { data, error } = await supabase
        .from("stories")
        .select("id, image_url, expires_at")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) {
        setMoments(
          data
            .filter((s: any) => !!s.image_url)
            .map((s: any) => ({ id: s.id, image_url: s.image_url }))
        );
      }
      setMomentsLoading(false);
    };
    loadMe();
    loadMoments();
  }, []);

  // Load posts after we know currentUserId so we can exclude self
  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setErrorMsg(null);
      let query = supabase
        .from("posts")
        .select("id, author, image_url, caption, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (currentUserId) {
        query = query.neq("author", currentUserId);
      }
      const { data: postData, error: postErr } = (await query) as any;
      if (postErr) {
        setErrorMsg(postErr.message);
        setLoading(false);
        return;
      }
      const postsRaw = (postData as any[]) || [];
      const authorIds = Array.from(new Set(postsRaw.map((p) => p.author).filter(Boolean)));
      let profilesById: Record<
        string,
        { id: string; display_name: string | null; avatar_url: string | null }
      > = {};
      if (authorIds.length > 0) {
        const { data: profData, error: profErr } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url")
          .in("id", authorIds);
        if (!profErr && profData) {
          for (const prof of profData as any[]) {
            profilesById[prof.id] = {
              id: prof.id,
              display_name: prof.display_name ?? null,
              avatar_url: prof.avatar_url ?? null,
            };
          }
        }
      }
      const merged = postsRaw.map((p) => ({
        id: p.id,
        image_url: p.image_url ?? null,
        caption: p.caption ?? null,
        created_at: p.created_at,
        author: profilesById[p.author] ?? null,
      }));
      setPosts(merged as any);
      setLoading(false);
    };
    loadPosts();
  }, [currentUserId]);

  async function handleAddMoment() {
    try {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      const file = result.assets[0];

      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        Alert.alert("Not signed in", "Please sign in to add a moment.");
        return;
      }

      const response = await fetch(file.uri);
      const bytes = await response.arrayBuffer();
      const extension = file.fileName?.split(".").pop() || "jpg";
      const path = `${uid}/moment-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("stories")
        .upload(path, bytes, { contentType: file.mimeType ?? "image/jpeg", upsert: true });
      if (uploadError) {
        Alert.alert("Upload failed", "Could not upload moment.");
        return;
      }

      const { data: publicData } = supabase.storage.from("stories").getPublicUrl(path);
      const publicUrl = publicData.publicUrl;

      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const { error: insertError } = await supabase
        .from("stories")
        .insert({ author: uid, image_url: publicUrl, caption: null, expires_at: expires });
      if (insertError) {
        Alert.alert("Save failed", "Could not save moment.");
        return;
      }

      const { data } = await supabase
        .from("stories")
        .select("id, image_url, expires_at")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        setMoments(
          (data as any[])
            .filter((s) => !!s.image_url)
            .map((s) => ({ id: s.id, image_url: s.image_url! }))
        );
      }
    } catch (e) {
      Alert.alert("Error", "Could not add moment.");
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.logo, { color: theme.accent }]}>Whirl</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Current user avatar shortcut */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.navigate("Profile" as never)}>
            {myAvatar ? (
              <Image source={{ uri: myAvatar }} style={styles.topAvatar} />
            ) : (
              <View style={[styles.topAvatar, { backgroundColor: "#ddd" }]} />
            )}
          </Pressable>
        </View>

        {/* CAMPUS MOMENTS */}
        <View style={[styles.sectionBoxBlue, { borderColor: theme.accent }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
  style={[
    styles.sectionTitle,
    { color: theme.textPrimary, fontFamily: 'CherryBomb' },
  ]}
>
  Campus Moments
</Text>
            <Pressable
              onPress={handleAddMoment}
              style={[styles.addBtn, { borderColor: theme.accent }]}
            >
              <Text
                style={{
                  color: theme.accent,
                  fontFamily: "CherryBomb",
                }}
              >
                Add
              </Text>
            </Pressable>
          </View>
          {momentsLoading ? (
            <View style={styles.blankSlate}>
              <ActivityIndicator />
            </View>
          ) : moments.length === 0 ? (
            <View style={styles.blankSlate}>
              <Text
                style={[
                  styles.blankSlateText,
                  { color: theme.textSecondary },
                ]}
              >
                No moments yet
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 10 }}
            >
              {moments.map((m) => (
                <Pressable
                  key={m.id}
                  style={{ marginRight: 10 }}
                  onPress={() => {
                    setPhotoModalUri(m.image_url);
                    setPhotoModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: m.image_url }}
                    style={styles.momentImage}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* WHAT'S GOING ON (user posts) */}
        <View style={[styles.sectionBoxGray, { backgroundColor: theme.card }]}>
          <Text
  style={[
    styles.sectionTitle,
    { color: theme.textPrimary, fontFamily: 'CherryBomb' },
  ]}
>
  What's going on
</Text>
          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" />
            </View>
          )}
          {errorMsg && (
            <View style={styles.errorBox}>
              <Text style={[styles.errorText, { color: theme.danger }]}>
                {errorMsg}
              </Text>
            </View>
          )}
          {!loading &&
            !errorMsg &&
            posts.map((p) => (
              <View key={p.id} style={{ marginBottom: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Left: user + username + date + caption */}
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          p.author?.id &&
                          (navigation as any).navigate("UserProfile", {
                            userId: p.author.id,
                          })
                        }
                      >
                        {p.author?.avatar_url ? (
                          <Image
                            source={{ uri: p.author.avatar_url }}
                            style={styles.postAvatar}
                          />
                        ) : (
                          <Image
                            source={require("../../assets/avatars/Default_pfp.jpg")}
                            style={styles.postAvatar}
                          />
                        )}
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          p.author?.id &&
                          (navigation as any).navigate("UserProfile", {
                            userId: p.author.id,
                          })
                        }
                      >
                        <Text
                          style={{
                            
                            fontSize: 13,
                            marginLeft: 6,
                            fontFamily: "CherryBomb",
                            color: theme.textPrimary,
                          }}
                          numberOfLines={1}
                        >
                          {p.author?.display_name || "Unknown"}
                        </Text>
                      </Pressable>
                    </View>
                    <Text
                      style={{
                        fontSize: 10,
                        color: theme.textSecondary,
                        fontFamily: "CherryBomb",
                      }}
                    >
                      {new Date(p.created_at).toLocaleString()}
                    </Text>
                    {p.caption && (
                      <Text
                        style={{
                          marginTop: 4,
                          fontSize: 13,
                          color: theme.textPrimary,
                          fontFamily: "CherryBomb",
                        }}
                      >
                        {p.caption}
                      </Text>
                    )}
                  </View>

                  {/* Right: photo (enlarge on tap) */}
                  <Pressable
                    onPress={() => {
                      setPhotoModalUri(p.image_url ?? null);
                      setPhotoModalVisible(true);
                    }}
                    hitSlop={6}
                    style={{ width: 120 }}
                  >
                    {p.image_url ? (
                      <Image
                        source={{ uri: p.image_url }}
                        style={{
                          width: "100%",
                          height: 100,
                          borderRadius: 8,
                          backgroundColor: "#fff",
                        }}
                        resizeMode="contain"
                      />
                    ) : null}
                  </Pressable>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Photo modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPhotoModalVisible(false)}
          />
          {photoModalUri ? (
            <Image
              source={{ uri: photoModalUri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          ) : (
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "#fff",
                  fontFamily: "CherryBomb",
                }}
              >
                No image to show
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  logo: {
    fontSize: 36,
    fontFamily: "CherryBomb",
  },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  topBar: { paddingHorizontal: 16, paddingTop: 8, alignItems: "flex-end" },
  topAvatar: { width: 48, height: 48, borderRadius: 24 },

  sectionBoxBlue: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: "#4f8bff",
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "CherryBomb",
  },
  momentsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  momentItem: { alignItems: "center" },
  momentImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 999,
  },
  momentLabel: { marginTop: 4, fontWeight: "600", fontFamily: "CherryBomb" },
  blankSlate: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  blankSlateText: { color: "#777", fontFamily: "CherryBomb" },

  sectionBoxGray: {
    backgroundColor: "#efefef",
    marginTop: 20,
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 20,
  },
  loadingWrap: { paddingVertical: 8 },
  errorBox: { paddingVertical: 8 },
  errorText: { color: "#b00020", fontSize: 12, fontFamily: "CherryBomb" },
  postRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  postAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  postText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "CherryBomb",
  },
  bigImage: {
    width: 100,
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: { width: "95%", height: "80%" },
});
