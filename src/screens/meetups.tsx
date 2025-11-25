import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Image, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import FadeInView from '../components/FadeInView';


const { width } = Dimensions.get('window');

const COLORS = {
  bg: '#F7EEDB',
  purpleDark: '#4C2197',
  purple: '#7E57C2',
  yellow: '#ffc12fff',
  yellowShadow: '#D8B45E',
  cloud: '#F2A51A',
  cloudShadowPlate: '#D9C6FF',
};

type Meetup = {
  id: string;
  title: string;
  capacity: number;
  currentCount: number;
  location: string;
  description: string;
};

const INITIAL_MEETUPS: Meetup[] = [
  {
    id: '1',
    title: 'Boba Run @ UREC',
    capacity: 8,
    currentCount: 2,
    location: 'LSU UREC Entrance',
    description: 'Quick boba run after workouts, all majors welcome!',
  },
  {
    id: '2',
    title: '4330 Study Group',
    capacity: 10,
    currentCount: 4,
    location: 'Patrick F. Taylor, 3rd floor',
    description: 'Review project specs and past exams for 4330.',
  },
  {
    id: '3',
    title: 'Late Night Tennis',
    capacity: 6,
    currentCount: 1,
    location: 'LSU Tennis Courts',
    description: 'Chill late-night rally, all skill levels.',
  },
];



function TopDecor() {
  return (
    <View style={stylesHeader.wrap}>
      <Text style={stylesHeader.title}>MEETUPS</Text>

      <LinearGradient
        colors={[COLORS.purpleDark, COLORS.purple, 'rgba(255, 255, 255, 0.85)']}
        locations={[0, 0.6, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={stylesHeader.moon}
      />

      <PuffyHeaderCloud style={{ right: 80, top: 64 }} />
    </View>
  );
}

function PuffyHeaderCloud({ style }: { style?: object }) {
  return (
    <View style={[stylesHeaderCloud.wrap, style]}>
      <View style={stylesHeaderCloud.shadow} />
      <View style={[stylesHeaderCloud.bubble, { width: 44, height: 44, left: 0, top: -6 }]} />
      <View style={[stylesHeaderCloud.bubble, { width: 64, height: 64, left: 24, top: -18 }]} />
      <View style={[stylesHeaderCloud.bubble, { width: 48, height: 48, left: 78, top: -8 }]} />
      <View style={[stylesHeaderCloud.bubble, { width: 38, height: 38, left: 114, top: 0 }]} />
      <View style={stylesHeaderCloud.base} />
    </View>
  );
}

function CreateCloudButton({ onPress }: { onPress: () => void }) {
  const cardWidth = Math.min(width * 0.7, 260);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        stylesCloud.wrap,
        { width: cardWidth, alignSelf: 'center', marginBottom: 26 },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          bottom: -6,
          left: 12,
          width: '90%',
          height: 22,
          backgroundColor: COLORS.cloudShadowPlate,
          borderRadius: 25,
          opacity: 1,
          zIndex: 0,
        }}
      />

      <View
        style={{
          width: '100%',
          height: 67,
          backgroundColor: COLORS.cloud,
          borderRadius: 36,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 30,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3,
        }}
      >
        <Text style={stylesCloud.createText}> Create Meetup</Text>
      </View>

      <View
        style={{
          position: 'absolute',
          top: -30,
          width: '45%',
          height: 55,
          alignSelf: 'center',
          backgroundColor: COLORS.cloud,
          borderRadius: 60,
          zIndex: 2,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: -18,
          left: 20,
          width: '28%',
          height: 45,
          backgroundColor: COLORS.cloud,
          borderRadius: 50,
          zIndex: 2,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: -18,
          right: 20,
          width: '28%',
          height: 45,
          backgroundColor: COLORS.cloud,
          borderRadius: 50,
          zIndex: 2,
        }}
      />
    </TouchableOpacity>
  );
}



function CloudItem({
  meetup,
  alignRight = false,
  idx = 0,
  onPress,
}: {
  meetup: Meetup;
  alignRight?: boolean;
  idx?: number;
  onPress: () => void;
}) {

  const cardWidth = Math.min(width * 0.55, 200);
  const v = idx % 3;

  let baseH = 58;
  let shadow = { bottom: -4, left: 14.8, widthPct: 0.92, height: 18, opacity: 1 };
  let center = { top: -26, wPct: 0.48, h: 70, radius: 90 };
  let left = { top: -12, left: 12, wPct: 0.28, h: 48, radius: 50 };
  let right = { top: -10, right: 12, wPct: 0.28, h: 46, radius: 50 };

  if (v === 1) {
    baseH = 50;
    shadow = { bottom: -4.5, left: 8, widthPct: 0.95, height: 19, opacity: 0.9 };
    center = { top: -24, wPct: 0.6, h: 60, radius: 80 };
    left = { top: -10, left: 6, wPct: 0.3, h: 42, radius: 42 };
    right = { top: -9, right: 6, wPct: 0.3, h: 40, radius: 40 };
  } else if (v === 2) {
    baseH = 42;
    shadow = { bottom: -4, left: 15, widthPct: 0.9, height: 14, opacity: 0.8 };
    center = { top: -22, wPct: 0.42, h: 48, radius: 70 };
    left = { top: -10, left: 12, wPct: 0.26, h: 36, radius: 40 };
    right = { top: -10, right: 12, wPct: 0.26, h: 36, radius: 40 };
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        stylesCloud.wrap,
        { width: cardWidth, alignSelf: alignRight ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View
        style={{
          position: 'absolute',
          bottom: shadow.bottom,
          left: shadow.left,
          width: `${shadow.widthPct * 100}%`,
          height: shadow.height,
          backgroundColor: COLORS.cloudShadowPlate,
          borderRadius: 30,
          opacity: shadow.opacity,
          zIndex: 0,
        }}
      />


      <View
        style={{
          width: '100%',
          height: baseH,
          backgroundColor: COLORS.cloud,
          borderRadius: 35,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          zIndex: 2,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: center.top,
          width: `${center.wPct * 100}%`,
          height: center.h,
          backgroundColor: COLORS.cloud,
          borderRadius: center.radius,
          alignSelf: 'center',
          zIndex: 3,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: left.top,
          left: left.left,
          width: `${left.wPct * 100}%`,
          height: left.h,
          backgroundColor: COLORS.cloud,
          borderRadius: left.radius,
          zIndex: 3,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: right.top,
          right: right.right,
          width: `${right.wPct * 100}%`,
          height: right.h,
          backgroundColor: COLORS.cloud,
          borderRadius: right.radius,
          zIndex: 3,
        }}
      />

      <View style={stylesCloud.labelWrap}>
        <Text style={stylesCloud.labelTitle} numberOfLines={1}>
          {meetup.title}
        </Text>
        <Text style={stylesCloud.labelCapacity}>
          {meetup.currentCount}/{meetup.capacity}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MeetupsScreen() {
  const [meetups, setMeetups] = useState<Meetup[]>(INITIAL_MEETUPS);

  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCapacity, setNewCapacity] = useState('10');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const ItemSep = useMemo(() => <View style={{ height: 18 }} />, []);

  // ⬇️⬇️⬇️ ADD THIS RIGHT HERE ⬇️⬇️⬇️
  useEffect(() => {
    const loadMeetups = async () => {
      const { data, error } = await supabase
        .from('meetups')
        .select('id, name, description, location, max_capacity, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading meetups', error);
        return;
      }

      if (!data || data.length === 0) return;

      const mapped: Meetup[] = data.map(row => ({
        id: String(row.id),
        title: row.name,
        description: row.description,
        location: row.location,
        capacity: row.max_capacity,
        currentCount: 0,
      }));

      setMeetups(mapped);
    };

    loadMeetups();
  }, []);
  // ⬆️⬆️⬆️ END OF INSERT ⬆️⬆️⬆️

  const handleCreatePress = () => {
    setNewTitle('');
    setNewCapacity('10');
    setNewLocation('');
    setNewDescription('');
    setCreateOpen(true);
  };


  const handleSubmitCreate = async () => {
  const trimmedTitle = newTitle.trim();
  const trimmedLocation = newLocation.trim();
  const trimmedDescription = newDescription.trim();
  const cap = parseInt(newCapacity, 10);

  if (!trimmedTitle) {
    Alert.alert('Name your meetup', 'Give your meetup a short title.');
    return;
  }

  if (!trimmedLocation) {
    Alert.alert('Add a location', 'Please enter where this meetup will happen.');
    return;
  }

  if (!trimmedDescription) {
    Alert.alert('Add a description', 'Tell people what this meetup is about.');
    return;
  }

  if (isNaN(cap) || cap <= 0) {
    Alert.alert('Invalid capacity', 'Capacity must be a positive number.');
    return;
  }

  try {
    // 1) get current user for host id
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(userError);
      Alert.alert('Not signed in', 'You must be logged in to create a meetup.');
      return;
    }

    // 2) insert into meetups with .select() to get the created row back
    const { data, error } = await supabase
      .from('meetups')
      .insert({
        host: user.id,
        name: trimmedTitle,
        description: trimmedDescription,
        location: trimmedLocation,
        max_capacity: cap,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meetup', error);
      Alert.alert('Error', 'Could not create meetup. Please try again.');
      return;
    }

    // 3) map DB row → our Meetup type and add to state
    const created: Meetup = {
      id: String(data.id),
      title: data.name,
      description: data.description,
      location: data.location,
      capacity: data.max_capacity,
      currentCount: 0,
    };

    setMeetups(prev => [created, ...prev]);
    setCreateOpen(false);
  } catch (e) {
    console.error(e);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};


  const handleJoin = (id: string) => {
    setMeetups(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        if (m.currentCount >= m.capacity) {
          Alert.alert('Lobby full', 'This meetup is already at capacity.');
          return m;
        }
        return { ...m, currentCount: m.currentCount + 1 };
      })
    );
  };

 return (
   <FadeInView>
    <SafeAreaView style={styles.root}>
      <TopDecor />

      <FlatList
  contentContainerStyle={styles.listContent}
  data={meetups}
  keyExtractor={m => m.id}
  ItemSeparatorComponent={() => ItemSep}
  ListHeaderComponent={<CreateCloudButton onPress={handleCreatePress} />}
  renderItem={({ item, index }) => (
    <CloudItem
      meetup={item}
      alignRight={index % 2 === 1}
      idx={index}
      onPress={() => handleJoin(item.id)}
    />
  )}
  showsVerticalScrollIndicator={false}
/>

        {/* footer image */}
        <Image
          source={require('../../assets/footer.png')}
          style={styles.footer}
          resizeMode="stretch"
        />

        {/* Create Meetup Modal */}
        <Modal
          visible={createOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCreateOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Meetup</Text>

              <Text style={styles.modalLabel}>Meetup name</Text>
<TextInput
  style={styles.modalInput}
  placeholder="ex: Boba run, 4330 study group…"
  placeholderTextColor="#888"
  value={newTitle}
  onChangeText={setNewTitle}
/>

<Text style={styles.modalLabel}>Location</Text>
<TextInput
  style={styles.modalInput}
  placeholder="ex: UREC entrance, PFT 3rd floor…"
  placeholderTextColor="#888"
  value={newLocation}
  onChangeText={setNewLocation}
/>

<Text style={styles.modalLabel}>Description</Text>
<TextInput
  style={[styles.modalInput, { height: 80 }]}
  placeholder="What is this meetup about?"
  placeholderTextColor="#888"
  value={newDescription}
  onChangeText={setNewDescription}
  multiline
/>

<Text style={styles.modalLabel}>Max people</Text>
<TextInput
  style={styles.modalInput}
  placeholder="10"
  placeholderTextColor="#888"
  keyboardType="number-pad"
  value={newCapacity}
  onChangeText={setNewCapacity}
/>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={() => setCreateOpen(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCreate]}
                  onPress={handleSubmitCreate}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </FadeInView>
  );
}



const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { paddingHorizontal: 35, paddingBottom: 100, paddingTop: 25 },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: 120,
    zIndex: 5,
    pointerEvents: 'none',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '84%',
    backgroundColor: '#FFF7E8',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 10,
    color: COLORS.purpleDark,
    fontFamily: 'CherryBombOne', 
  },
  modalLabel: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
    color: '#444',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0C9A8',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    fontSize: 14,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginLeft: 8,
  },
  modalCancel: {
    backgroundColor: '#E0D0C0',
  },
  modalCreate: {
    backgroundColor: COLORS.purple,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});


const stylesHeader = StyleSheet.create({
  wrap: {
    paddingTop: 8,
    paddingHorizontal: 18,
    paddingBottom: 8,
    minHeight: 120,
  },
  title: {
    fontSize: 36,
    letterSpacing: 2,
    color: COLORS.purpleDark,
    fontFamily: 'FodaDisplay',
  },
  moon: {
    position: 'absolute',
    right: 24,
    top: 10,
    width: 98,
    height: 98,
    borderRadius: 49,
    opacity: 1,
  },
});

const stylesHeaderCloud = StyleSheet.create({
  wrap: {
    position: 'absolute',
    width: 150,
    height: 35,
    zIndex: 2,
  },
  shadow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 4,
    height: 10,
    borderRadius: 10,
    backgroundColor: COLORS.yellowShadow,
    opacity: 0.35,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: COLORS.yellow,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  base: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    height: 30,
    backgroundColor: COLORS.yellow,
    borderRadius: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
});

const stylesCloud = StyleSheet.create({
  wrap: {
    marginVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowPlate: {
    position: 'absolute',
    bottom: -4,
    left: 10,
    width: '92%',
    height: 18,
    backgroundColor: '#D9C6FF',
    borderRadius: 20,
    alignSelf: 'center',
    opacity: 1,
    zIndex: 0,
  },
  cloudBase: {
    width: '100%',
    height: 58,
    backgroundColor: '#F2A51A',
    borderRadius: 35,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 2,
  },
  topPuffLarge: {
    position: 'absolute',
    top: -26,
    width: '48%',
    height: 70,
    backgroundColor: '#F2A51A',
    borderRadius: 90,
    zIndex: 3,
  },
  topPuffSmallLeft: {
    position: 'absolute',
    top: -12,
    left: 12,
    width: '28%',
    height: 48,
    backgroundColor: '#F2A51A',
    borderRadius: 50,
    zIndex: 3,
  },
  topPuffSmallRight: {
    position: 'absolute',
    top: -10,
    right: 12,
    width: '28%',
    height: 46,
    backgroundColor: '#F2A51A',
    borderRadius: 50,
    zIndex: 3,
  },
  createText: {
    fontSize: 25,
    fontFamily: 'CherryBombOne',
    color: '#181818ff',
    letterSpacing: 1,
    marginTop: -10,
  },
  textWrap: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  meetupTitle: {
    fontSize: 15,
    fontFamily: 'CherryBombOne',
    color: '#181818',
  },
  meetupCount: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#3A2A0A',
  },
    labelWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 10,         
    alignItems: 'center',
  },
  labelTitle: {
    fontSize: 14,
    color: '#181818',
    textAlign: 'center',
    fontFamily: 'CherryBombOne',
  },
  labelCapacity: {
    marginTop: 2,
    fontSize: 12,
    color: '#4a3b3b',
    fontFamily: 'CherryBombOne',

  },
});
