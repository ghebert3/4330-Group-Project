import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import BackHeader from "../components/BackHeader";
import { useTheme, ThemeMode } from "../theme";

export default function ProfileOverviewScreen() {
  const navigation = useNavigation<any>();
  const { theme, themeMode, setThemeMode } = useTheme();

  const [name, setName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load basic profile info for the overview
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("ProfileOverview loadProfile user error", userError);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile", error);
        return;
      }
      setName(data.display_name || "");
      setAvatarUrl(data.avatar_url ?? null);
    }

    loadProfile();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  async function handlePickAvatar() {
    try {
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user for avatar upload", userError);
        Alert.alert("Error", "Could not find current user.");
        return;
      }

      const response = await fetch(file.uri);
      const bytes = await response.arrayBuffer();

      const extension = file.fileName?.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, bytes, {
          contentType: file.mimeType ?? "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        Alert.alert("Error", "Error uploading profile picture.");
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = publicData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving avatar_url:", updateError);
        Alert.alert("Error", "Error saving profile picture.");
        return;
      }

      setAvatarUrl(publicUrl);
    } catch (e) {
      console.error("handlePickAvatar error", e);
      Alert.alert("Error", "Could not update profile picture. Try again.");
    }
  }

  const handleThemeModeChange = async (mode: ThemeMode) => {
    await setThemeMode(mode); // instant + saved globally
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <BackHeader
        title="Menu"
        backgroundColor={theme.background}
        textColor={theme.headerText}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          {/* PROFILE SUMMARY */}
          <View style={styles.profileSection}>
            <Pressable onPress={handlePickAvatar}>
              <Image
                source={
                  avatarUrl
                    ? { uri: avatarUrl }
                    : require("../../assets/avatars/Default_pfp.jpg")
                }
                style={styles.pfp}
              />
            </Pressable>

            <Text style={[styles.name, { color: theme.textPrimary }]}>
              {name || "Your Name"}
            </Text>

            <Pressable
              style={[
                styles.editBtn,
                {
                  backgroundColor: theme.accent,
                  borderColor: theme.accent,
                },
              ]}
              onPress={() => navigation.navigate("EditProfile")}
            >
              <Text style={[styles.editBtnText, { color: theme.accentText }]}>
                Edit Profile
              </Text>
            </Pressable>
          </View>

          {/* APPEARANCE */}
          <View
            style={[
              styles.optionBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text
              style={[styles.optionTitle, { color: theme.textPrimary }]}
            >
              Appearance
            </Text>

            <View style={styles.themeToggleRow}>
              {(["light", "dark", "system"] as ThemeMode[]).map((mode) => {
                const active = themeMode === mode;
                const label =
                  mode === "light"
                    ? "Light"
                    : mode === "dark"
                    ? "Purple"
                    : "System";

                return (
                  <Pressable
                    key={mode}
                    onPress={() => handleThemeModeChange(mode)}
                    style={[
                      styles.themeChip,
                      {
                        backgroundColor: theme.chipBg,
                        borderColor: theme.border,
                      },
                      active && {
                        backgroundColor: theme.chipActiveBg,
                        borderColor: theme.accent,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.themeChipText,
                        { color: theme.chipText },
                        active && { color: theme.chipTextActive },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {themeMode === "system" && (
              <Text
                style={[
                  styles.optionDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Following your phone&apos;s{" "}
                {/* system scheme is handled in ThemeProvider */}
                default mode.
              </Text>
            )}
          </View>

          {/* ACCOUNT OPTIONS */}
          <View
            style={[
              styles.optionBox,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Pressable
              style={[
                styles.optionRow,
                { borderBottomColor: theme.border },
              ]}
              onPress={() => navigation.navigate("ChangePassword")}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: theme.textPrimary },
                ]}
              >
                Change Password
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.optionRow,
                { borderBottomWidth: 0 },
              ]}
              onPress={handleSignOut}
            >
              <Text
                style={[
                  styles.optionLabel,
                  { color: theme.danger },
                ]}
              >
                Sign Out
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: "transparent",
  },

  profileSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  pfp: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  editBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  editBtnText: {
    fontWeight: "600",
  },

  optionBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },

  themeToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  themeChip: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  optionDescription: {
    marginTop: 6,
    fontSize: 12,
  },
});