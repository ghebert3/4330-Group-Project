import React, { useState } from 'react';
import FadeInView from '../components/FadeInView';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Modal,
  ImageSourcePropType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

//Patrick Posts heh
const STORIES = [
  { id: 'me', avatar: require('../../assets/avatars/me.png'), canAdd: true },
  { id: 'u1', avatar: require('../../assets/avatars/user1.png') },
  { id: 'u2', avatar: require('../../assets/avatars/user2.png') },
  { id: 'u3', avatar: require('../../assets/avatars/user1.png') },
  { id: 'u4', avatar: require('../../assets/avatars/user2.png') },
];

const POSTS = [
  {
    id: 'p1',
    username: 'user1',
    avatar: require('../../assets/avatars/user1.png'),
    image: require('../../assets/posts/post1.png'),
    caption: 'Im OUT!!!',
  },
  {
    id: 'p2',
    username: 'user2',
    avatar: require('../../assets/avatars/user2.png'),
    image: require('../../assets/posts/post2.png'),
    caption: 'These Thighs Save Lives',
  },
];

const AVATAR_SIZE = 56;

export default function HomeScreen() {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState<ImageSourcePropType | null>(null);

  function openViewer(src: ImageSourcePropType) {
    setViewerSrc(src);
    setViewerOpen(true);
  }
  function closeViewer() {
    setViewerOpen(false);
    setViewerSrc(null);
  }

  return (
    <FadeInView>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Whirl</Text>
          <Ionicons name="paper-plane-outline" size={24} />
        </View>

        <View style={styles.storiesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesRow}
          >
            {STORIES.map((s) => (
              <View key={s.id} style={styles.storyWrap}>
                <Image source={s.avatar} style={styles.storyAvatar} />
                {s.canAdd && (
                  <View style={styles.addDot}>
                    <Ionicons name="add" size={14} color="white" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

       
        <ScrollView
          style={styles.feed}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {POSTS.map((p) => (
            <View key={p.id} style={styles.post}>
              <View style={styles.postHeader}>
                <Image source={p.avatar} style={styles.userAvatar} />
                <Text style={styles.username}>{p.username}</Text>
                <Ionicons name="ellipsis-horizontal" size={20} style={{ marginLeft: 'auto' }} />
              </View>

              {/* Tap to expand */}
              <Pressable onPress={() => openViewer(p.image)}>
                <Image source={p.image} style={styles.postImage} />
              </Pressable>

              <View style={styles.postActions}>
                <Ionicons name="heart-outline" size={24} />
                <Ionicons name="chatbubble-outline" size={24} style={{ marginLeft: 16 }} />
                <Ionicons name="send-outline" size={24} style={{ marginLeft: 16 }} />
              </View>

              <Text style={styles.caption}>{p.caption}</Text>
            </View>
          ))}
        </ScrollView>

        <Modal visible={viewerOpen} animationType="fade" onRequestClose={closeViewer}>
          <View style={styles.viewerRoot}>
            <Pressable style={styles.closeBtn} onPress={closeViewer}>
              <Ionicons name="close" size={32} color="#fff" />
            </Pressable>
            {viewerSrc && (
              <Image
                source={viewerSrc}
                style={styles.viewerImage}
              />
            )}
          </View>
         </Modal>
       </SafeAreaView>
         </FadeInView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },

  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
    logo: { fontSize: 28, fontWeight: '700' },

    storiesContainer: {
    height: AVATAR_SIZE + 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    backgroundColor: 'transparent',
  },
  storiesRow: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  storyWrap: {
    marginRight: 14,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#f2f2f2',
  },
  addDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5903C3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  feed: { flex: 1 },
  post: { marginBottom: 20 },
    postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  username: { fontWeight: '600' },
  postImage: {
    width: '100%',
    height: 220,
    marginTop: 8,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  caption: { paddingHorizontal: 12, paddingBottom: 8, fontSize: 15 },

  viewerRoot: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
});
