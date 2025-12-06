import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import board from "../../assets/discover/Maskgroup.png";
import gradientfail from "../../assets/discover/Ellipse5.png";
import gradientmatch from "../../assets/discover/Ellipse5(1).png";
import frame12Img from "../../assets/discover/Frame12.png";
import frame13Img from "../../assets/discover/Frame13.png";  
import frame14Img from "../../assets/discover/Frame14.png";  
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';


const POLAROID_FRAMES = [
  {
    id: "Frame12",
    image: frame12Img,
    frameSize: { width: 100, height: 100 },
    photoArea: { width: 78, height: 43, offsetX: 1, offsetY: 29 },
  },
  {
    id: "Frame13",
    image: frame13Img,
    frameSize: { width: 100, height: 100 },       
    photoArea: { width: 95, height: 50, offsetX: 1, offsetY: 25 }, 
  },
  {
    id: "Frame14",
    image: frame14Img,
    frameSize: { width: 120, height: 120 },      
    photoArea: { width: 77.9, height: 109.98, offsetX: 20, offsetY: 1 }, 
  },
];

interface DraggablePolaroid {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  scale: Animated.Value;
  rotate: Animated.Value;
  panResponder?: any;
  currentX: number;
  currentY: number;
  currentScale: number;
  currentRotate: number;
  rotateDragging?: boolean;
  importedPhotoUri?: string;
  frameKey: string; 
  frameImage: any;
  frameSize: { width: number; height: number };
  photoArea: { width: number; height: number; offsetX: number; offsetY: number };
}

export default function DiscoverEditor() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showToolbar, setShowToolbar] = useState(false);
  const [activeTab, setActiveTab] = useState<"polaroid" | "sticker" | "text">("polaroid");
  const [polaroids, setPolaroids] = useState<DraggablePolaroid[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [warning, setWarning] = useState(false);

  const invalidArea = { x: -10, y: 87, width: 550, height: 610 };
  const spawnX = invalidArea.x + invalidArea.width / 2 - 50;
  const spawnY = invalidArea.y + invalidArea.height / 2 - 50;

  const idCounter = useRef(0);

  const Exit = () => {
    if (showToolbar) setShowToolbar(false);
    else {
    setSelectedId(null);
    navigation.goBack(); 
    }
  };

  const toggleToolbar = () => setShowToolbar(!showToolbar);

  const showTempWarning = () => {
    setWarning(true);
    setTimeout(() => setWarning(false), 1500);
  };

  const spawnPolaroid = (frameDef: typeof POLAROID_FRAMES[number]) => {
    const x = new Animated.Value(spawnX);
    const y = new Animated.Value(spawnY);
    const scale = new Animated.Value(1);
    const rotate = new Animated.Value(0);

    const id = idCounter.current++;

    const item: DraggablePolaroid = {
      id,
      x,
      y,
      scale,
      rotate,
      currentX: spawnX,
      currentY: spawnY,
      currentScale: 1,
      currentRotate: 0,
      rotateDragging: false,
      frameKey: frameDef.id,
      frameImage: frameDef.image,
      frameSize: frameDef.frameSize,
      photoArea: frameDef.photoArea,
    };

    let offset = { x: 0, y: 0 };

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        offset.x = item.currentX - gestureState.x0;
        offset.y = item.currentY - gestureState.y0;
        setSelectedId(item.id);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = gestureState.moveX + offset.x;
        const newY = gestureState.moveY + offset.y;
        item.x.setValue(newX);
        item.y.setValue(newY);
        item.currentX = newX;
        item.currentY = newY;
      },
      onPanResponderRelease: () => {
        const baseW = item.frameSize.width * item.currentScale;
        const baseH = item.frameSize.height * item.currentScale;
        const left = item.currentX;
        const top = item.currentY;
        const right = left + baseW;
        const bottom = top + baseH;

        if (
          left < invalidArea.x ||
          top < invalidArea.y ||
          right > invalidArea.x + invalidArea.width ||
          bottom > invalidArea.y + invalidArea.height
        ) {
          setPolaroids((prev) => prev.filter((p) => p.id !== item.id));
          setSelectedId(null);
          showTempWarning();
        }
      },
    });

    item.panResponder = panResponder;
    setPolaroids((prev) => [...prev, item]);
    setSelectedId(item.id);
  };

  const handleRotateHold = (p: DraggablePolaroid, direction: "left" | "right") => {
    p.rotateDragging = true;
    const interval = setInterval(() => {
      if (!p.rotateDragging) clearInterval(interval);
      const delta = direction === "right" ? 2 : -2;
      const newRotate = p.currentRotate + delta;
      p.rotate.setValue(newRotate);
      p.currentRotate = newRotate;
    }, 16);
  };

  const stopRotate = (p: DraggablePolaroid) => {
    p.rotateDragging = false;
  };

  const handleScaleUp = (p: DraggablePolaroid) => {
    const newScale = Math.min(p.currentScale + 0.1, 3);
    p.scale.setValue(newScale);
    p.currentScale = newScale;
  };

  const handleScaleDown = (p: DraggablePolaroid) => {
    const newScale = Math.max(p.currentScale - 0.1, 0.35);
    p.scale.setValue(newScale);
    p.currentScale = newScale;
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar} />
      <ImageBackground source={board} resizeMode="contain" style={styles.board} />
      <ImageBackground source={gradientfail} style={styles.gradientfail} resizeMode="stretch" />
      <ImageBackground source={gradientmatch} style={styles.gradientmatch} resizeMode="stretch" />

      <TouchableOpacity style={styles.backButton} onPress={Exit}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {!showToolbar && (
        <TouchableOpacity style={styles.editButton} onPress={toggleToolbar}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      )}

      {showToolbar && (
        <View style={styles.toolbar}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "polaroid" && styles.activeTab]}
              onPress={() => setActiveTab("polaroid")}
            >
              <Text style={styles.tabText}>Polaroid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "sticker" && styles.activeTab]}
              onPress={() => setActiveTab("sticker")}
            >
              <Text style={styles.tabText}>Sticker</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "text" && styles.activeTab]}
              onPress={() => setActiveTab("text")}
            >
              <Text style={styles.tabText}>Text</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {activeTab === "polaroid" && (
              <ScrollView horizontal contentContainerStyle={{ alignItems: "center" }}>
                {POLAROID_FRAMES.map((f) => (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => spawnPolaroid(f)}
                    style={{ marginHorizontal: 8 }}
                  >
                    <Image source={f.image} style={{ width: 60, height: 60 }} resizeMode="contain" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {activeTab === "sticker" && <Text style={styles.panelText}>Sticker items go here</Text>}
            {activeTab === "text" && <Text style={styles.panelText}>Text input goes here</Text>}
          </View>
        </View>
      )}

      {/* Deselect overlay */}
      {selectedId !== null && (
        <TouchableOpacity
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={() => setSelectedId(null)}
        />
      )}

      {/* Red invalid area */}
      {showToolbar && (
        <View
          style={{
            position: "absolute",
            left: invalidArea.x,
            top: invalidArea.y,
            width: invalidArea.width,
            height: invalidArea.height,
            borderWidth: 2,
            borderColor: "red",
            backgroundColor: "rgba(255,0,0,0.12)",
            zIndex: 5,
          }}
          pointerEvents="none"
        />
      )}

      {warning && (
        <View style={styles.warning}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Polaroid outside valid area!</Text>
        </View>
      )}

      {polaroids.map((p) => {
        const rotateInterpolate = p.rotate.interpolate({
          inputRange: [-360, 360],
          outputRange: ["-360deg", "360deg"],
        });

        const isSelected = selectedId === p.id;

        const importPhotoToPolaroid = async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
          });
          if (!result.canceled && result.assets[0].uri) {
            setPolaroids((prev) =>
              prev.map((pol) =>
                pol.id === p.id ? { ...pol, importedPhotoUri: result.assets[0].uri } : pol
              )
            );
          }
        };

        return (
          <Animated.View
            key={p.id}
            {...(p as any).panResponder?.panHandlers}
            style={[
              styles.draggable,
              {
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { scale: p.scale },
                  { rotate: rotateInterpolate },
                ],
              },
            ]}
          >
            {isSelected && (
              <View
                style={{
                  position: "absolute",
                  top: -6,
                  left: -6,
                  width: p.frameSize.width + 12,
                  height: p.frameSize.height + 12,
                  borderWidth: 2,
                  borderColor: "#00ff00",
                  borderRadius: 6,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <TouchableOpacity
                  style={[styles.rotateButton, { left: -15, right: undefined }]}
                  onPressIn={() => handleRotateHold(p, "left")}
                  onPressOut={() => stopRotate(p)}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color="white"
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rotateButton}
                  onPressIn={() => handleRotateHold(p, "right")}
                  onPressOut={() => stopRotate(p)}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color="white"
                    style={{ transform: [{ rotate: "90deg" }] }}
                  />
                </TouchableOpacity>

                <View style={styles.scaleButtons}>
                  <TouchableOpacity onPress={() => handleScaleUp(p)}>
                    <Text style={styles.scaleText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleScaleDown(p)}>
                    <Text style={styles.scaleText}>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={importPhotoToPolaroid}>
                    <Ionicons name="image" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={{ width: p.frameSize.width, height: p.frameSize.height, justifyContent: "center", alignItems: "center" }}>
              {p.importedPhotoUri && (
                <Image
                  source={{ uri: p.importedPhotoUri }}
                  style={{
                    width: p.photoArea.width,
                    height: p.photoArea.height,
                    position: "absolute",
                    top: p.photoArea.offsetY,
                    left: p.photoArea.offsetX,
                  }}
                  resizeMode="cover"
                />
              )}
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => setSelectedId(isSelected ? null : p.id)}
              >
                <Image
                  source={p.frameImage}
                  style={{
                    width: p.frameSize.width,
                    height: p.frameSize.height,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#462F6B" },
  bar: { height: "5%", backgroundColor: "black" },
  board: { alignSelf: "center", width: 430, height: 626, marginTop: 25 },
  gradientfail: { position: "absolute", left: 0, width: "100%", height: 1000, top: 45 },
  gradientmatch: { position: "absolute", left: 0, width: "100%", height: 1000, top: 45 },
  backButton: {
    position: "absolute",
    top: 50,
    left: 6,
    width: 40,
    padding: 3,
    backgroundColor: "#f41010c3",
    borderRadius: 10,
  },
  editButton: {
    position: "absolute",
    bottom: 35,
    right: 25,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: "#7811c1ff",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  editText: { color: "white", fontWeight: "bold" },
  toolbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#262626",
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 220,
  },
  tabRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: -5 },
  tabButton: { flex: 1, paddingVertical: 10, borderRadius: 5, alignItems: "center" },
  activeTab: { backgroundColor: "#763ac0ff", borderTopLeftRadius: 10, borderTopRightRadius: 10 },
  tabText: { color: "white", fontWeight: "bold" },
  tabContent: {
    flex: 1,
    width: "100%",
    backgroundColor: "#222",
    borderWidth: 3,
    borderColor: "#763ac0ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  panelText: { color: "white" },
  draggable: { position: "absolute", justifyContent: "center", alignItems: "center" },
  rotateButton: {
    position: "absolute",
    top: -15,
    right: -15,
    width: 30,
    height: 30,
    backgroundColor: "#0008",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 11,
  },
  scaleButtons: {
    position: "absolute",
    bottom: -25,
    left: 0,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    zIndex: 11,
  },
  scaleText: { color: "white", fontWeight: "bold", fontSize: 16 },
  warning: {
    position: "absolute",
    top: 90,
    left: 25,
    right: 25,
    padding: 12,
    backgroundColor: "#ff0000cc",
    borderRadius: 10,
    alignItems: "center",
    zIndex: 9999,
  },
});
