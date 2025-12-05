import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { SafeAreaView } from "react-native-safe-area-context"

export default function ProfileOverviewScreen() {
  const navigation = useNavigation<any>();

  const [darkMode, setDarkMode] = useState(false);
  const [name, setName] = useState("");

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
        .select("display_name")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setName(data.display_name ?? "");
      } else if (error) {
        console.log("ProfileOverview loadProfile profiles error", error);
      }
    }

    loadProfile();
  }, []);

  <SafeAreaView edges={["top"]} style={{ backgroundColor: "#fff" }}>
  <View style={styles.header}>
    <Pressable
      onPress={() => navigation.goBack()}
      hitSlop={20}
      style={styles.backButton}
    >
      <Ionicons name="arrow-back" size={26} color="#555" />
    </Pressable>

    <Text style={styles.headerTitle}>Menu</Text>

    <View style={{ width: 26 }} />
  </View>
</SafeAreaView>

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  }

  return (

    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#555" />
        </Pressable>
        <Text style={styles.headerTitle}>Menu</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* PROFILE SUMMARY */}
      <View style={styles.profileSection}>
        <Image
          source={require("../../assets/avatars/Default_pfp.jpg")}
          style={styles.pfp}
        />
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
          <Ionicons name="chevron-forward" size={20} color="#777" />
        </Pressable>

        <Pressable style={styles.optionRow} onPress={handleSignOut}>
          <Text style={[styles.optionLabel, { color: "#C62828" }]}>
            Sign Out
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "700" },

  backButton: {
    padding:6,
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