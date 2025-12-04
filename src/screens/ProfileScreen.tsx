import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  /* ----- STATE ----- */
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [photos, setPhotos] = useState<{ uri: string; caption: string }[]>([]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photoModal, setPhotoModal] = useState(false);
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

  const [name, setName] = useState("Thomas Lee");
  const [editName, setEditName] = useState("");

  const [connections] = useState([
    { id: "1", name: "Sarah Chen", avatar: "https://i.pravatar.cc/100?img=1", major: "Biology" },
    { id: "2", name: "Mike Johnson", avatar: "https://i.pravatar.cc/100?img=2", major: "Engineering" },
    { id: "3", name: "Emily Davis", avatar: "https://i.pravatar.cc/100?img=3", major: "Psychology" },
    { id: "4", name: "Alex Kim", avatar: "https://i.pravatar.cc/100?img=4", major: "Computer Science" },
    { id: "5", name: "Jordan Smith", avatar: "https://i.pravatar.cc/100?img=5", major: "Business" },
    { id: "6", name: "Taylor Brown", avatar: "https://i.pravatar.cc/100?img=6", major: "Art" },
    { id: "7", name: "Casey Wilson", avatar: "https://i.pravatar.cc/100?img=7", major: "Music" },
    { id: "8", name: "Morgan Lee", avatar: "https://i.pravatar.cc/100?img=8", major: "Chemistry" },
    { id: "9", name: "Jamie Garcia", avatar: "https://i.pravatar.cc/100?img=9", major: "Math" },
    { id: "10", name: "Riley Martinez", avatar: "https://i.pravatar.cc/100?img=10", major: "Physics" },
  ]);

  /* ----- PICK PROFILE PICTURE ----- */
  async function pickProfilePicture() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewPhotoUri(result.assets[0].uri);
        setNewPhotoCaption("");
        setAddPhotoModal(true);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      alert("Error picking image. Please try again.");
    }
  }

  function saveNewPhoto() {
    if (newPhotoUri) {
      const newPhoto = { uri: newPhotoUri, caption: newPhotoCaption };
      setPhotos(prevPhotos => [...prevPhotos, newPhoto]);
      setNewPhotoUri(null);
      setNewPhotoCaption("");
      setAddPhotoModal(false);
    }
  }

  /* ----- VIEW/EDIT PHOTO ----- */
  function openPhoto(index: number) {
    setSelectedPhotoIndex(index);
    setPhotoModal(true);
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

  function deletePhoto() {
    if (selectedPhotoIndex !== null) {
      setPhotos(photos.filter((_, i) => i !== selectedPhotoIndex));
      setEditPhotoModal(false);
      setSelectedPhotoIndex(null);
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
  function openSettings() {
    setEditName(name);
    setSettingsModal(true);
  }

  function saveName() {
    if (editName.trim().length > 0) {
      setName(editName.trim());
    }
    setSettingsModal(false);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* SETTINGS ICON */}
      <Pressable style={styles.settingsIcon} onPress={openSettings}>
        <Ionicons name="settings-outline" size={26} color="#555" />
      </Pressable>

      {/* PROFILE IMAGE */}
      <Pressable onPress={pickProfilePicture} style={styles.imageWrapper}>
        <Image
          source={{
            uri:
              profilePic ||
              "https://via.placeholder.com/150/cccccc/000000?text=Add+Photo",
          }}
          style={styles.profileImage}
        />
      </Pressable>

      {/* NAME */}
      <Text style={styles.name}>{name}</Text>

      {/* TAGS */}
      <View style={styles.tagContainer}>
        {tags.map((t, i) => (
          <Pressable key={i} style={styles.tag} onPress={() => openEditTag(i)}>
            <Text style={styles.tagText}>{t}</Text>
          </Pressable>
        ))}

        {/* Add Tag Button */}
        <Pressable style={styles.addTagButton} onPress={() => setTagModal(true)}>
          <Text style={{ color: "#555" }}>+ Tag</Text>
        </Pressable>
      </View>

      {/* LOOKING FOR */}
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
          <Text style={{ color: "#555" }}>+ Add</Text>
        </Pressable>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Stat number="6" label="Whirls" />
        <Pressable onPress={() => setConnectionsModal(true)}>
          <View style={styles.statBlock}>
            <Text style={styles.statNumber}>{connections.length}</Text>
            <Text style={[styles.statLabel, { color: "#5903C3" }]}>Campus Connections</Text>
          </View>
        </Pressable>
        <Stat number="150" label="People met" />
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
              <Image 
                source={{ uri: photos[selectedPhotoIndex]?.uri }} 
                style={styles.largeImage} 
              />
              {photos[selectedPhotoIndex]?.caption ? (
                <View style={styles.captionContainer}>
                  <Text style={styles.captionText}>{photos[selectedPhotoIndex].caption}</Text>
                </View>
              ) : null}
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
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              style={styles.inputField}
            />
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalBtnCancel} onPress={() => setSettingsModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={saveName}>
                <Text style={styles.modalBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
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
  },
  lookingForContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    width: "100%",
    marginBottom: 25,
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
  },

  /* STATS */
  statsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 3,
    textAlign: "center",
  },

  /* PHOTOS */
  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "center",
    gap: 8,
  },
  smallImage: {
    width: 105,
    height: 105,
    borderRadius: 14,
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
    width: "90%",
    height: "70%",
    borderRadius: 10,
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
  },
  inputLabel: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
  },
  inputField: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    width: "100%",
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
  },
  modalBtnDelete: {
    flex: 1,
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 8,
  },
  modalBtnText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
  cancelText: {
    textAlign: "center",
    color: "#777",
    marginTop: 5,
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
  },
  closeBtn: {
    padding: 5,
  },
  closeBtnText: {
    fontSize: 20,
    color: "#666",
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
  },
  connectionMajor: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
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
    width: "100%",
    alignItems: "center",
  },
  captionContainer: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 15,
    borderRadius: 8,
    maxWidth: "90%",
  },
  captionText: {
    color: "#fff",
    fontSize: 15,
    textAlign: "center",
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
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
});
