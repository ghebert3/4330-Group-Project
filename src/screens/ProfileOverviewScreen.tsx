import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context"
import BackHeader from "../components/BackHeader";

const BG = '#F7EEDB';

export default function ProfileOverviewScreen() {
  const navigation = useNavigation<any>();

  const [darkMode, setDarkMode] = useState(false);
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
      // 1) Ask for permission
      const { granted } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }

      // 2) Let user pick image
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

      // 3) Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error getting user for avatar upload", userError);
        Alert.alert("Error", "Could not find current user.");
        return;
      }

      // 4) Convert file to bytes
      const response = await fetch(file.uri);
      const bytes = await response.arrayBuffer();

      const extension = file.fileName?.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${extension}`;

      // 5) Upload to avatars bucket
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

      // 6) Get public URL
      const { data: publicData } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = publicData.publicUrl;

      // 7) Save URL into profiles.avatar_url
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving avatar_url:", updateError);
        Alert.alert("Error", "Error saving profile picture.");
        return;
      }

      // 8) Update local state so UI refreshes
      setAvatarUrl(publicUrl);
    } catch (e) {
      console.error("handlePickAvatar error", e);
      Alert.alert("Error", "Could not update profile picture. Try again.");
    }
  }


  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <BackHeader title="Menu" />
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
          <Text style={styles.name}>{name || "Your Name"}</Text>

          <Pressable
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        {/* APPEARANCE */}
        <View style={styles.optionBox}>
          <Text style={styles.optionTitle}>Appearance</Text>
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ true: "#5903C3" }}
            />
          </View>
        </View>

        {/* ACCOUNT OPTIONS */}
        <View style={styles.optionBox}>
          <Pressable
            style={styles.optionRow}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Text style={styles.optionLabel}>Change Password</Text>
          </Pressable>

          <Pressable style={styles.optionRow} onPress={handleSignOut}>
            <Text style={[styles.optionLabel, { color: "#C62828" }]}>
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
    backgroundColor: "#461D7C",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editBtnText: { color: "white", fontWeight: "600" },

  optionBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: "#444",
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
});