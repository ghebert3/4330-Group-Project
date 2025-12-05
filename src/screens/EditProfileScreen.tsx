import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FadeInView from "../components/FadeInView";
import AnimatedTag from "../components/AnimatedTag";
import { supabase } from "../lib/supabase";

type ActiveField = "name" | "hometown" | "bio" | "interests" | null;

const INTEREST_OPTIONS = [
  "Intramural sports",
  "Gym",
  "Greek life",
  "Gaming",
  "Music",
  "Concerts",
  "Cooking",
  "Photography",
  "Travel",
  "Study groups",
  "Entrepreneurship",
  "Volunteering",
  "Parties",
  "Coffee",
  "Reading",
  "Movies",
];

const BG = "#F7EEDB";

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [hometown, setHometown] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [activeField, setActiveField] = useState<ActiveField>(null);

  // hometown draft for the search view
  const [hometownSearch, setHometownSearch] = useState("");
  // custom interest input
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("EditProfile load user error:", userError);
          Alert.alert("Not signed in", "You must be logged in to edit profile.");
          navigation.goBack();
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("display_name, bio, hometown, tags")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("EditProfile load profile error:", error);
          Alert.alert("Error", "Could not load your profile.");
          navigation.goBack();
          return;
        }

        if (data) {
          setName(data.display_name ?? "");
          setBio(data.bio ?? "");
          setHometown(data.hometown ?? "");
          setTags(data.tags ?? []);
          setHometownSearch(data.hometown ?? "");
        }
      } catch (e) {
        console.error("EditProfile unexpected load error:", e);
        Alert.alert("Error", "Something went wrong loading your profile.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigation]);

  function handleHeaderBack() {
    // if inside a sub-view, go back to overview; otherwise go back to overview screen
    if (activeField) {
      setActiveField(null);
    } else {
      navigation.goBack();
    }
  }

  async function handleSaveAll() {
    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Not signed in", "You must be logged in to save changes.");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: name.trim(),
          hometown: hometown.trim(),
          bio: bio.trim(),
          tags,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("EditProfile save error:", updateError);
        Alert.alert("Error", "Could not save your profile. Try again.");
        return;
      }

      Alert.alert("Saved", "Your profile has been updated.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e) {
      console.error("EditProfile unexpected save error:", e);
      Alert.alert("Error", "Something went wrong saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  function toggleInterest(label: string) {
    setTags((prev) =>
      prev.includes(label)
        ? prev.filter((t) => t !== label)
        : [...prev, label]
    );
  }

  function addCustomTag() {
    const trimmed = customTag.trim();
    if (!trimmed) return;
    setTags((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    setCustomTag("");
  }

  // -------- RENDER HELPERS --------

  function renderOverview() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionCaption}>Profile details</Text>

        {/* Name row */}
        <Pressable
          style={styles.row}
          onPress={() => setActiveField("name")}
        >
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>
              {name.trim() || "Add your name"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>

        {/* Hometown row */}
        <Pressable
          style={styles.row}
          onPress={() => setActiveField("hometown")}
        >
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>Hometown</Text>
            <Text style={styles.rowValue}>
              {hometown.trim() || "Add a hometown"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>

        {/* Bio row */}
        <Pressable
          style={styles.row}
          onPress={() => setActiveField("bio")}
        >
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>Bio</Text>
            <Text style={styles.rowValue} numberOfLines={2}>
              {bio
                ? bio.length > 80
                  ? bio.slice(0, 77) + "..."
                  : bio
                : "Add a short bio (max 400 characters)"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>

        {/* Interests row */}
        <Pressable
          style={styles.row}
          onPress={() => setActiveField("interests")}
        >
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>Tags / Interests</Text>
            <Text style={styles.rowValue} numberOfLines={2}>
              {tags.length > 0
                ? tags.join(" • ")
                : "Tap to pick interests & hobbies"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </Pressable>

        {/* Save Button */}
        <View style={{ marginTop: 32 }}>
          <Pressable
            onPress={handleSaveAll}
            disabled={saving}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && { opacity: 0.9 },
              saving && { opacity: 0.7 },
            ]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  function renderNameField() {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitle}>Name</Text>
        <Text style={styles.fieldSubtitle}>
          This is what other students will see on your profile.
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#999"
          style={styles.input}
        />

        <Pressable
          style={styles.fieldDoneButton}
          onPress={() => setActiveField(null)}
        >
          <Text style={styles.fieldDoneText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  function renderHometownField() {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitle}>Hometown</Text>
        <Text style={styles.fieldSubtitle}>
          Type a city, state, or country. Later you can plug in a real search API.
        </Text>

        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#777" />
          <TextInput
            value={hometownSearch}
            onChangeText={setHometownSearch}
            placeholder="Baton Rouge, LA"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>

        <Pressable
          style={styles.fieldDoneButton}
          onPress={() => {
            setHometown(hometownSearch.trim());
            setActiveField(null);
          }}
        >
          <Text style={styles.fieldDoneText}>Use this place</Text>
        </Pressable>
      </View>
    );
  }

  function renderBioField() {
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldTitle}>Bio</Text>
        <Text style={styles.fieldSubtitle}>
          Say a sentence or two about yourself. Keep it under 400 characters.
        </Text>

        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="ex. LSU CS, loves late-night study sessions and UREC hoops."
          placeholderTextColor="#999"
          style={[styles.input, { height: 140, textAlignVertical: "top" }]}
          multiline
          maxLength={400}
        />
        <Text style={styles.charCount}>{bio.length}/400</Text>

        <Pressable
          style={styles.fieldDoneButton}
          onPress={() => setActiveField(null)}
        >
          <Text style={styles.fieldDoneText}>Done</Text>
        </Pressable>
      </View>
    );
  }

  function renderInterestsField() {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.fieldContainer, { paddingBottom: 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.fieldTitle}>Tags & Interests</Text>
        <Text style={styles.fieldSubtitle}>
          Tap to add or remove. These show up on your profile and help people
          see what you&apos;re into.
        </Text>

        <View style={styles.chipGrid}>
          {INTEREST_OPTIONS.map((label) => {
            const selected = tags.includes(label);
            return (
              <Pressable
                key={label}
                onPress={() => toggleInterest(label)}
                style={[
                  styles.chip,
                  selected && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.fieldSubtitle, { marginTop: 16 }]}>
          Or add your own:
        </Text>
        <View style={styles.customRow}>
          <TextInput
            value={customTag}
            onChangeText={setCustomTag}
            placeholder="ex. Anime, Chess, Intramural soccer"
            placeholderTextColor="#999"
            style={[styles.input, { flex: 1, marginRight: 8, marginBottom: 0 }]}
          />
          <Pressable style={styles.addTagButton} onPress={addCustomTag}>
            <Text style={styles.addTagText}>Add</Text>
          </Pressable>
        </View>

        {tags.length > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={styles.fieldSubtitle}>Selected</Text>
            <View style={styles.selectedTagsRow}>
              {tags.map((t, idx) => (
                <AnimatedTag key={`${t}-${idx}`} label={t} />
              ))}
            </View>
          </View>
        )}

        <Pressable
          style={[styles.fieldDoneButton, { marginTop: 24 }]}
          onPress={() => setActiveField(null)}
        >
          <Text style={styles.fieldDoneText}>Done</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const showContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingWrap}>
          <Text style={{ color: "#777" }}>Loading profile…</Text>
        </View>
      );
    }

    switch (activeField) {
      case "name":
        return renderNameField();
      case "hometown":
        return renderHometownField();
      case "bio":
        return renderBioField();
      case "interests":
        return renderInterestsField();
      default:
        return renderOverview();
    }
  };

  return (
    <FadeInView style={{ flex: 1 }}>
      <SafeAreaView style={styles.root}>
        {/* Header with back arrow that respects activeField */}
        <View style={styles.header}>
          <Pressable onPress={handleHeaderBack} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={24} color="#111" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {activeField ? "Edit profile" : "Edit profile"}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {showContent()}
      </SafeAreaView>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
    backgroundColor: "transparent",
  },
  sectionCaption: {
    fontSize: 13,
    color: "#777",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  rowTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 14,
    color: "#555",
  },
  saveButton: {
    backgroundColor: "#461D7C",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // Field views
  fieldContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "transparent",
  },
  fieldTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  fieldSubtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: "#fafafa",
    marginBottom: 12,
  },
  fieldDoneButton: {
    marginTop: 8,
    backgroundColor: "#461D7C",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  fieldDoneText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  charCount: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#777",
  },

  searchInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    marginLeft: 6,
  },

  // Interests chips
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  chipActive: {
    borderColor: "#5903C3",
    backgroundColor: "#EEE5FF",
  },
  chipText: {
    fontSize: 13,
    color: "#555",
  },
  chipTextActive: {
    color: "#461D7C",
    fontWeight: "600",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addTagButton: {
    backgroundColor: "#461D7C",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addTagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});