import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";

const IMG_TOP =
  "https://www.figma.com/api/mcp/asset/b423224a-73b2-44b6-85f7-06dc37aea3a1";
const IMG_BACKGROUND =
  "https://www.figma.com/api/mcp/asset/d0b31084-1d39-4440-a66f-5c1be288ce59";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  /* ----- STATE ----- */
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [photos, setPhotos] = useState<{ id: number; uri: string; caption: string }[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {

      setPhotosLoading(true);
      
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("loadPhotos user error:", userError);
          return;
        }

        const { data, error } = await supabase
          .from("posts")
          .select("id, image_url, caption")
          .eq("author", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("loadPhotos posts error:", error);
          return;
        }

        if (isMounted && data) {
          setPhotos(
            data.map(p => ({
              id: p.id,
              uri: p.image_url || "",
              caption: p.caption || "",
            }))
          );
        }
      } catch (e) {
        console.error("loadPhotos error:", e);
      } finally {
        if (isMounted) {
          setPhotosLoading(false);
        }
      }
    }

    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photoModal, setPhotoModal] = useState(false);
  const [largeImageHeight, setLargeImageHeight] = useState<number>(400);
  const [editPhotoModal, setEditPhotoModal] = useState(false);
  const [editCaption, setEditCaption] = useState("");

  const [tags, setTags] = useState<string[]>([]);

  const [newTag, setNewTag] = useState("");
  const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
  const [editTagValue, setEditTagValue] = useState("");

  const [lookingForItems, setLookingForItems] = useState<string[]>([]);
  const [newLookingFor, setNewLookingFor] = useState("");

  const [tagModal, setTagModal] = useState(false);
  const [editTagModal, setEditTagModal] = useState(false);
  const [lookingForModal, setLookingForModal] = useState(false);
  const [connectionsModal, setConnectionsModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [nameEditModal, setNameEditModal] = useState(false);
  const [bioEditModal, setBioEditModal] = useState(false);
  const [pfpOptionsModal, setPfpOptionsModal] = useState(false);

  // Account details
  const [email, setEmail] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [editName, setEditName] = useState("");
  const [bio, setBio] = useState("");
  const [editBio, setEditBio] = useState("");

  const [connections] = useState<{ id: string; name: string; avatar: string; major: string }[]>([]);

    useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {

    setProfileLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No user logged in or error:", userError);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, bio, tags, looking_for, avatar_url")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      setName(data.display_name ?? "");
      setBio(data.bio ?? "");
      setTags(data.tags ?? []);
      setLookingForItems(data.looking_for ?? []);
      setProfilePic(data.avatar_url ?? null);
    } catch (err) {
      console.error("Unexpected error loading profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }

  async function saveProfile() {
    try {
      const { error } = await supabase.rpc("update_profile", {
        p_display_name: name,
        p_bio: bio,
        p_tags: tags,
        p_looking_for: lookingForItems,
      });

      if (error) {
        console.error("Error saving profile:", error);
        alert("Error saving profile.");
        return;
      }

      alert("Profile saved.");
    } catch (err) {
      console.error("Unexpected error saving profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }


  /* ----- SIGN OUT ----- */
  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      setSettingsModal(false);

      // Navigate back to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Error signing out. Please try again.");
    }
  }

  /* ----- PICK PROFILE PICTURE ----- */
  async function pickProfilePicture() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert("Permission to access photos is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];
      const uri = file.uri;

      // 1) Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        alert("Could not get current user.");
        return;
      }

      // 2) Convert URI → ArrayBuffer
      const response = await fetch(uri);
      const bytes = await response.arrayBuffer();

      // 3) Choose a unique path: "userId/avatar-<timestamp>.jpg"
      const ext = file.fileName?.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar-${Date.now()}.${ext}`;

      // 4) Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, bytes, {
          contentType: file.mimeType ?? "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Error uploading profile picture.");
        return;
      }

      // 5) Get public URL
      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      // 6) Save to DB
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("Error saving avatar_url:", updateError);
        alert("Error saving profile picture.");
        return;
      }

      // 7) Update local state so UI shows it right away
      setProfilePic(publicUrl);
    } catch (e) {
      console.log("Error picking profile image:", e);
      alert("Could not pick image. Please try again.");
    }
  }



  /* ----- ADD NEW PHOTO ----- */
  const [addPhotoModal, setAddPhotoModal] = useState(false);
  const [newPhotoUri, setNewPhotoUri] = useState<string | null>(null);
  const [newPhotoCaption, setNewPhotoCaption] = useState("");

  async function pickNewPhoto() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1,1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setNewPhotoUri(asset.uri);
        setNewPhotoCaption("");
        setAddPhotoModal(true);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      alert("Error picking image. Please try again.");
    }
  }

  async function saveNewPhoto() {
    if (!newPhotoUri) return;

    try {
      // 1) Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("No user", userError);
        alert("You must be logged in to upload a photo.");
        return;
      }

      // 2) Fetch the file from the local URI
      const response = await fetch(newPhotoUri);
      const bytes = await response.arrayBuffer();

      const ext = newPhotoUri.split(".").pop() || "jpg";
      const filePath = `${user.id}/posts/${Date.now()}.${ext}`;

      // 3) Upload to Supabase Storage (reusing 'avatars' bucket + path rule)
      const { data: storageData, error: storageError } = await supabase.storage
        .from("post-images") // or create a 'post-images' bucket later
        .upload(filePath, bytes, {
          upsert: false,
          contentType: "image/jpeg",
        });

      if (storageError) {
        console.error("Post image upload error:", storageError);
        alert("Error uploading image. Please try again.");
        return;
      }

      // 4) Get a public URL for the uploaded image
      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(storageData.path);

      const imageUrl = publicUrlData.publicUrl;

      // 5) Insert into posts table
      const { data: inserted, error: insertError } = await supabase
        .from("posts")
        .insert({
          author: user.id,
          caption: newPhotoCaption || null,
          image_url: imageUrl,
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Insert post error:", insertError);
        alert("Error saving caption. Please try again.");
        return;
      }

      // 6) Update local state for immediate UI update
      setPhotos((prev) => [
        { 
          id: inserted.id,
          uri: imageUrl, 
          caption: newPhotoCaption, 
        },
        ...prev,
      ]);

      setNewPhotoUri(null);
      setNewPhotoCaption("");
      setAddPhotoModal(false);
    } catch (e) {
      console.error("saveNewPhoto error:", e);
      alert("Unexpected error saving photo. Please try again.");
    }
  }


  /* ----- VIEW/EDIT PHOTO ----- */
  function openPhoto(index: number) {
    const uri = photos[index]?.uri;
    const screenW = Dimensions.get("window").width;
    const maxH = Dimensions.get("window").height * 0.85;
    if (uri) {
      Image.getSize(
        uri,
        (w, h) => {
          const displayW = Math.min(screenW * 0.95, w);
          const scale = displayW / w;
          const displayH = Math.min(h * scale, maxH);
          setLargeImageHeight(displayH);
          setSelectedPhotoIndex(index);
          setPhotoModal(true);
        },
        (err) => {
          setLargeImageHeight(Math.min(400, maxH));
          setSelectedPhotoIndex(index);
          setPhotoModal(true);
        }
      );
    } else {
      setLargeImageHeight(Math.min(400, maxH));
      setSelectedPhotoIndex(index);
      setPhotoModal(true);
    }
  }

  function openEditPhoto() {
    if (selectedPhotoIndex !== null) {
      setEditCaption(photos[selectedPhotoIndex].caption);
      setPhotoModal(false);
      setEditPhotoModal(true);
    }
  }

  function savePhotoEdit() {
    if (selectedPhotoIndex !== null) {
      const updated = [...photos];
      updated[selectedPhotoIndex].caption = editCaption;
      setPhotos(updated);
      setEditPhotoModal(false);
      setPhotoModal(true);
    }
  }

  async function deletePhoto() {
    if (selectedPhotoIndex === null) return;

    const photoToDelete = photos[selectedPhotoIndex];

    // Optimistically update UI
    setPhotos(prev => prev.filter((_, i) => i !== selectedPhotoIndex));
    setEditPhotoModal(false);
    setSelectedPhotoIndex(null);

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("deletePhoto – no user:", userError);
        return;
      }

      // Delete the corresponding post row
      const { error: deleteError } = await supabase
        .from("posts")
        .delete()
        .eq("id", photoToDelete.id);

      if (deleteError) {
        console.log("deletePhoto – Supabase error:", deleteError);
      }
    } catch (e) {
      console.log("deletePhoto – unexpected error:", e);
    }
  }


  /* ----- ADD NEW TAG ----- */
  function addTag() {
    if (newTag.trim().length > 0) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
    setTagModal(false);
  }

  /* ----- EDIT TAG ----- */
  function openEditTag(index: number) {
    setEditingTagIndex(index);
    setEditTagValue(tags[index]);
    setEditTagModal(true);
  }

  function saveEditTag() {
    if (editingTagIndex !== null && editTagValue.trim().length > 0) {
      const updated = [...tags];
      updated[editingTagIndex] = editTagValue.trim();
      setTags(updated);
    }
    setEditTagModal(false);
    setEditingTagIndex(null);
    setEditTagValue("");
  }

  /* ----- REMOVE TAG ----- */
  function removeTag(index: number) {
    setTags(tags.filter((_, i) => i !== index));
    setEditTagModal(false);
    setEditingTagIndex(null);
  }

  /* ----- ADD LOOKING FOR ----- */
  function addLookingFor() {
    if (newLookingFor.trim().length > 0) {
      setLookingForItems([...lookingForItems, newLookingFor.trim()]);
      setNewLookingFor("");
    }
    setLookingForModal(false);
  }

  /* ----- REMOVE LOOKING FOR ----- */
  function removeLookingFor(index: number) {
    setLookingForItems(lookingForItems.filter((_, i) => i !== index));
  }

  /* ----- SETTINGS ----- */
  async function openSettings() {
    setEditName(name);
    setEditBio(bio);
    setSettingsModal(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error) {
        setEmail(data.user?.email ?? null);
      }
    } catch (e) {
      console.log("Error fetching user:", e);
    }
  }

  function saveName() {
    if (editName.trim().length > 0) {
      setName(editName.trim());
    }
    setBio(editBio.trim());
    setSettingsModal(false);
  }

  /* ----- SINGLE-FIELD EDIT BUBBLES ----- */
  function openNameEdit() {
    setEditName(name);
    setSettingsModal(false);
    setNameEditModal(true);
  }

  async function saveNameEdit() {
  if (editName.trim().length > 0) {
    setName(editName.trim());
  }
  setNameEditModal(false);
  await saveProfile();
}

  function openBioEdit() {
    setEditBio(bio);
    setSettingsModal(false);
    setBioEditModal(true);
  }

  async function saveBioEdit() {
  setBio(editBio.trim());
  setBioEditModal(false);
  await saveProfile();
}


  /* ----- RESET PASSWORD ----- */
  async function handleResetPassword() {
    if (!email) {
      alert("No email associated with this account.");
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert("Password reset email sent. Check your inbox.");
    } catch (e) {
      console.error("Reset password error:", e);
      alert("Could not send password reset email.");
    }
  }

  /* ----- REMOVE PROFILE PICTURE ----- */
  function removeProfilePicture() {
    setProfilePic(null);
  }

    // ---- FULL SCREEN LOADING ----
  // ---- FULL SCREEN LOADING (same visuals as MeetupsLoading) ----
  const isLoading = profileLoading || photosLoading;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBgWrapper}>
          <Image
            source={{ uri: IMG_BACKGROUND }}
            style={styles.loadingBgImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.loadingMainWrapper}>
          <Image
            source={{ uri: IMG_TOP }}
            style={styles.loadingMainImage}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* SETTINGS ICON */}
      <Pressable style={styles.settingsIcon} onPress={openSettings}>
        <Ionicons name="settings-outline" size={26} color="#555" />
      </Pressable>

      <Pressable
        style={{ position: 'absolute', top: 50, left: 20, padding: 6 }}
        onPress={() => navigation.navigate('Onboarding')}
      >
        <Text style={{ color: '#888', fontSize: 11 }}>Dev Onboarding</Text>
      </Pressable>


      {/* PROFILE IMAGE */}
      <Pressable onPress={pickProfilePicture} style={styles.imageWrapper}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require("../../assets/avatars/Default_pfp.jpg")
          }
          style={styles.profileImage}
        />
      </Pressable>

      {/* NAME */}
      <Text style={styles.name}>{name}</Text>
      {/* BIO */}
      {bio && bio.trim().length > 0 ? (
        <Text style={styles.bioText}>{bio}</Text>
      ) : (
        <Pressable onPress={openSettings} style={styles.bioPlaceholderWrapper}>
          <Text style={styles.bioPlaceholder}>Add a short bio</Text>
        </Pressable>
      )}

      {/* TAGS */}
      <View style={styles.tagContainer}>
        {tags.map((t, i) => (
          <Pressable key={i} style={styles.tag} onPress={() => openEditTag(i)}>
            <Text style={styles.tagText}>{t}</Text>
          </Pressable>
        ))}

        {/* Add Tag Button */}
        <Pressable style={styles.addTagButton} onPress={() => setTagModal(true)}>
          <Text style={{ color: "#555", fontFamily: "CherryBomb" }}>+ Tag</Text>
        </Pressable>
      </View>

      {/* LOOKING FOR */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Looking for</Text>

        <View style={styles.lookingForContainer}>
          {lookingForItems.map((item, i) => (
            <View key={i} style={styles.lookingForItem}>
              <Text style={styles.lookingForText}>{item}</Text>
              <Pressable onPress={() => removeLookingFor(i)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>×</Text>
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addLookingForBtn} onPress={() => setLookingForModal(true)}>
            <Text style={{ color: "#555", fontFamily: "CherryBomb" }}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.sectionBox}>
        <View style={styles.statsRow}>
          <Stat number="0" label="Whirls" />
          <Pressable onPress={() => setConnectionsModal(true)}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{connections.length}</Text>
              <Text style={[styles.statLabel, { color: "#5903C3" }]}>Campus Connections</Text>
            </View>
          </Pressable>
          <Stat number="0" label="People met" />
        </View>
      </View>

      {/* PHOTO ROW (click to enlarge) */}
      <View style={styles.photoRow}>
        {photos.map((p, i) => (
          <Pressable key={i} onPress={() => openPhoto(i)}>
            <Image source={{ uri: p.uri }} style={styles.smallImage} />
          </Pressable>
        ))}
      </View>

      {/* Add Photo */}
      <Pressable onPress={pickNewPhoto} style={styles.addPhotoButton}>
        <Text style={styles.addPhotoText}>+ Add Photo</Text>
      </Pressable>

      {/* NAVIGATION BAR */}
      
      

      {/* VIEW PHOTO MODAL */}
      <Modal visible={photoModal} transparent animationType="fade">
        <View style={styles.photoModalContainer}>
          <Pressable 
            style={styles.photoModalClose} 
            onPress={() => { setPhotoModal(false); setSelectedPhotoIndex(null); }}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </Pressable>
          {selectedPhotoIndex !== null && (
            <View style={styles.photoModalContent}>
              <View style={styles.imageWithCaption}>
                <Image 
                  source={{ uri: photos[selectedPhotoIndex]?.uri }} 
                  style={[styles.largeImage, { height: largeImageHeight }]} 
                />
                  {photos[selectedPhotoIndex]?.caption ? (
                    <View style={styles.captionBubble}>
                      <Text style={styles.captionText}>{photos[selectedPhotoIndex].caption}</Text>
                    </View>
                  ) : null}
              </View>
              <Pressable style={styles.editPhotoBtn} onPress={openEditPhoto}>
                <Ionicons name="pencil" size={18} color="#fff" />
                <Text style={styles.editPhotoBtnText}>Edit</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      {/* EDIT PHOTO MODAL */}
      <Modal visible={editPhotoModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Photo</Text>
            <Text style={styles.inputLabel}>Caption</Text>
            <TextInput
              value={editCaption}
              onChangeText={setEditCaption}
              placeholder="Add a caption..."
              style={styles.inputField}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnDelete} onPress={deletePhoto}>
                <Text style={styles.modalBtnText}>Delete</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={savePhotoEdit}>
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => { setEditPhotoModal(false); setPhotoModal(true); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* PROFILE PICTURE OPTIONS MODAL */}
      <Modal visible={pfpOptionsModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Profile Picture</Text>
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => { setPfpOptionsModal(false); }}>
                <Text style={styles.modalBtnCancelText}>Close</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={() => { setPfpOptionsModal(false); pickProfilePicture(); }}>
                <Text style={styles.modalBtnText}>Change</Text>
              </Pressable>
            </View>
            <View style={{ height: 8 }} />
            <Pressable style={styles.modalBtnDelete} onPress={() => { removeProfilePicture(); setPfpOptionsModal(false); }}>
              <Text style={styles.modalBtnText}>Remove</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
  
      {/* NAME EDIT BUBBLE */}
      <Modal visible={nameEditModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.smallBubble}>
            <Text style={styles.modalTitle}>Change Display Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              style={styles.bubbleInput}
            />
            <View style={styles.bubbleBtnRow}>
              <Pressable style={styles.modalIconDelete} onPress={() => { setNameEditModal(false); setSettingsModal(true); }}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.modalIconSave} onPress={() => { saveNameEdit(); setSettingsModal(true); }}>
                <Ionicons name="checkmark" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* BIO EDIT BUBBLE */}
      <Modal visible={bioEditModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.smallBubble}>
            <Text style={styles.modalTitle}>Change Bio</Text>
            <TextInput
              value={editBio}
              onChangeText={setEditBio}
              placeholder="A sentence or two about you"
              style={[styles.bubbleInput, { height: 90 }]}
              multiline
              maxLength={160}
            />
            <Text style={styles.bioCount}>{editBio.length}/160</Text>
            <View style={styles.bubbleBtnRow}>
              <Pressable style={styles.modalIconDelete} onPress={() => { setBioEditModal(false); setSettingsModal(true); }}>
                <Ionicons name="close" size={20} color="#fff" />
              </Pressable>
              <Pressable style={styles.modalIconSave} onPress={() => { saveBioEdit(); setSettingsModal(true); }}>
                <Ionicons name="checkmark" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      

      {/* ADD PHOTO MODAL */}
      <Modal visible={addPhotoModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Photo</Text>
            {newPhotoUri && (
              <Image source={{ uri: newPhotoUri }} style={styles.previewImage} />
            )}
            <Text style={styles.inputLabel}>Caption (optional)</Text>
            <TextInput
              value={newPhotoCaption}
              onChangeText={setNewPhotoCaption}
              placeholder="Add a caption..."
              style={styles.inputField}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => { setAddPhotoModal(false); setNewPhotoUri(null); }}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={saveNewPhoto}>
                <Text style={styles.modalBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* TAG MODAL (Add new) */}
      <Modal visible={tagModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add a new tag</Text>
            <TextInput
              value={newTag}
              onChangeText={setNewTag}
              placeholder="ex. Chess, Basketball"
              style={styles.inputField}
            />
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setTagModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={addTag}>
                <Text style={styles.modalBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT TAG MODAL */}
      <Modal visible={editTagModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit tag</Text>
            <TextInput
              value={editTagValue}
              onChangeText={setEditTagValue}
              placeholder="Tag name"
              style={styles.inputField}
            />
            <View style={styles.modalBtnRow}>
              <Pressable 
                style={styles.modalBtnDelete} 
                onPress={() => editingTagIndex !== null && removeTag(editingTagIndex)}
              >
                <Text style={styles.modalBtnText}>Delete</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={saveEditTag}>
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
            </View>
            <Pressable onPress={() => setEditTagModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* LOOKING FOR MODAL */}
      <Modal visible={lookingForModal} transparent animationType="fade">
        <View style={styles.modalCenter}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>What are you looking for?</Text>
            <TextInput
              value={newLookingFor}
              onChangeText={setNewLookingFor}
              placeholder="ex. Study partners"
              style={styles.inputField}
            />
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setLookingForModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={addLookingFor}>
                <Text style={styles.modalBtnText}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* CAMPUS CONNECTIONS MODAL */}
      <Modal visible={connectionsModal} transparent animationType="slide">
        <View style={styles.connectionsModalContainer}>
          <View style={styles.connectionsModalContent}>
            <View style={styles.connectionsHeader}>
              <Text style={styles.connectionsTitle}>Campus Connections</Text>
              <Pressable onPress={() => setConnectionsModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
            </View>
            <FlatList
              data={connections}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.connectionItem}>
                  <Image source={{ uri: item.avatar }} style={styles.connectionAvatar} />
                  <View style={styles.connectionInfo}>
                    <Text style={styles.connectionName}>{item.name}</Text>
                    <Text style={styles.connectionMajor}>{item.major}</Text>
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.connectionSeparator} />}
            />
          </View>
        </View>
      </Modal>

  {/* SETTINGS MODAL */}
<Modal visible={settingsModal} transparent animationType="fade">
  <View style={styles.modalCenter}>
    <View style={styles.modalBox}>
      <View style={styles.connectionsHeader}>
        <Text style={styles.modalTitle}>Settings</Text>
        <Pressable onPress={() => setSettingsModal(false)} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      <View style={{ width: "100%" }}>
        <Pressable style={styles.settingsRow} onPress={openNameEdit}>
          <View>
            <Text style={styles.settingsRowLabel}>Change display name</Text>
            <Text style={styles.settingsRowValue}>{name ? name : "Not set"}</Text>
          </View>
        </Pressable>

        <Pressable style={styles.settingsRow} onPress={openBioEdit}>
          <View>
            <Text style={styles.settingsRowLabel}>Change bio</Text>
            <Text style={styles.settingsRowValue}>{bio ? (bio.length > 60 ? bio.slice(0, 57) + "..." : bio) : "Add a short bio"}</Text>
          </View>
        </Pressable>

        {/* View Email (non-pressable) */}
        <View style={styles.settingsRow}>
          <View>
            <Text style={styles.settingsRowLabel}>Email</Text>
            <Text style={styles.settingsRowValue}>{email ?? "Not available"}</Text>
          </View>
        </View>

        

        {/* Reset Password */}
        <Pressable style={styles.settingsRow} onPress={handleResetPassword}>
          <View>
            <Text style={[styles.settingsRowLabel, { color: "#e74c3c" }]}>Reset password</Text>
          </View>
        </Pressable>

        {/* In Settings modal content, near Reset Password or at the bottom */}
        <Pressable style={styles.modalBtn} onPress={saveProfile}>
          <Text style={styles.modalBtnText}>Save changes</Text>
        </Pressable>

        <View style={{ height: 12 }} />
      </View>

      {/* SIGN OUT */}
            <View style={styles.signOutSection}>
              <Pressable
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Text style={styles.signOutText}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
    )
}


/* ----- COMPONENTS ----- */


const Stat = ({ number, label }: { number: string; label: string }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statNumber}>{number}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const NavItem = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.navItem}>
    <Text style={styles.navIcon}>{icon}</Text>
    <Text style={styles.navLabel}>{label}</Text>
  </View>
);

/* ----- STYLES ----- */
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 150,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingBgWrapper: {
    position: "absolute",
    left: -83,
    top: 319,
    width: 541,
    height: 541,
  },
  loadingBgImage: {
    width: "100%",
    height: "100%",
  },
  loadingMainWrapper: {
    position: "absolute",
    left: 12,
    top: 147,
    width: 351,
    height: 343,
  },
  loadingMainImage: {
    width: "100%",
    height: "100%",
  },

  settingsIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },

  imageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "#a87bd6",
    overflow: "hidden",
    marginTop: 50,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },

  name: {
    fontSize: 26,
    fontWeight: "600",
    marginTop: 20,
    fontFamily: "CherryBomb",
  },
  bioText: {
    fontSize: 14,
    color: "#444",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 20,
    fontFamily: "CherryBomb",
  },
  bioPlaceholderWrapper: {
    marginTop: 8,
  },
  bioPlaceholder: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    fontFamily: "CherryBomb",
  },
  bioInputBubble: {
    backgroundColor: "#f7f7f8",
    borderRadius: 12,
    padding: 10,
    width: "100%",
    minHeight: 80,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  bioInput: {
    color: "#222",
    fontSize: 14,
    padding: 6,
    textAlignVertical: "top",
    minHeight: 56,
    fontFamily: "CherryBomb",
  },
  bioCount: {
    alignSelf: "flex-end",
    color: "#999",
    fontSize: 12,
    marginTop: 6,
    fontFamily: "CherryBomb",
  },
  /* Settings option rows */
  settingsRow: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingsRowLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    fontFamily: "CherryBomb",
  },
  settingsRowValue: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    fontFamily: "CherryBomb",
  },
  /* Small bubble edit modal */
  smallBubble: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 10,
  },
  bubbleInput: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#f7f7f8",
    padding: 10,
    fontSize: 15,
    fontFamily: "CherryBomb",
  },
  bubbleBtnRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },

  /* TAGS */
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginVertical: 20,
  },
  tag: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "CherryBomb",
  },
  addTagButton: {
    backgroundColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  /* LOOKING FOR */
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginBottom: 10,
    fontFamily: "CherryBomb",
  },
  sectionBox: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 15,
    marginBottom: 20,
  },
  lookingForContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
  },
  lookingForItem: {
    backgroundColor: "#dcdcdc",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lookingForText: {
    color: "#444",
    fontFamily: "CherryBomb",
  },
  removeBtn: {
    backgroundColor: "#bbb",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    lineHeight: 18,
    fontFamily: "CherryBomb",
  },
  addLookingForBtn: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  inputFake: {
    backgroundColor: "#dcdcdc",
    width: "100%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 25,
  },
  inputText: {
    color: "#444",
    fontFamily: "CherryBomb",
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "CherryBomb",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 3,
    textAlign: "center",
    fontFamily: "CherryBomb",
  },

  /* PHOTOS */
  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "flex-start",
    alignSelf: "center",
    maxWidth: 336,
    gap: 8,
  },
  smallImage: {
    width: 105,
    height: 105,
    borderRadius: 14,
    resizeMode: "cover",
  },
  addPhotoButton: {
    marginTop: 15,
    backgroundColor: "#eee",
    padding: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  addPhotoText: {
    fontSize: 14,
    color: "#444",
    fontFamily: "CherryBomb",
  },

  /* NAV BAR */
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 40,
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
  },
  navItem: { alignItems: "center" },
  navIcon: { fontSize: 24 },
  navLabel: { fontSize: 10, textAlign: "center" },
  

  /* MODALS */
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  largeImage: {
    width: "100%",
    height: 400,
    resizeMode: "contain",
  },

  modalCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "CherryBomb",
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    fontFamily: "CherryBomb",
  },
  inputField: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    fontFamily: "CherryBomb",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },
  modalBtn: {
    flex: 1,
    backgroundColor: "#a87bd6",
    padding: 10,
    borderRadius: 8,
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 8,
  },
  modalBtnCancelText: {
    textAlign: "center",
    color: "#555",
    fontWeight: "600",
    fontFamily: "CherryBomb",
  },
  modalBtnDelete: {
    flex: 1,
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 8,
  },
  modalIconDelete: {
    backgroundColor: "#e74c3c",
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  modalIconSave: {
    backgroundColor: "#a87bd6",
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  modalBtnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontFamily: "CherryBomb",
  },
  cancelText: {
    textAlign: "center",
    color: "#777",
    marginTop: 5,
    fontFamily: "CherryBomb",
  },

  /* CONNECTIONS MODAL */
  connectionsModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  connectionsModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: "75%",
  },
  connectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  connectionsTitle: {
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "CherryBomb",
  },
  closeBtn: {
    padding: 5,
  },
  closeBtnText: {
    fontSize: 20,
    color: "#666",
    fontFamily: "CherryBomb",
  },
  connectionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    paddingHorizontal: 20,
    gap: 12,
  },
  connectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  connectionInfo: {
    flex: 1,
  },
  connectionName: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "CherryBomb",
  },
  connectionMajor: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
    fontFamily: "CherryBomb",
  },
  connectionSeparator: {
    height: 1,
    backgroundColor: "#eee",
    marginHorizontal: 20,
  },

  /* PHOTO MODALS */
  photoModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  photoModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  photoModalContent: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWithCaption: {
    width: "100%",
    alignItems: "center",
  },
  captionBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    maxWidth: "88%",
    alignItems: "center",
    marginTop: 12,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  captionText: {
    color: "#222",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 20,
    fontFamily: "CherryBomb",
  },
  editPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editPhotoBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "CherryBomb",
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
     signOutSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  signOutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    borderRadius: 8,
  },
  signOutText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
    fontFamily: "CherryBomb",
  },
});
