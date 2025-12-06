import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import FadeInView from '../components/FadeInView';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useTheme, Theme } from '../theme';
import AppText from '../components/AppText';

const { width } = Dimensions.get('window');

type Colors = {
  bg: string;
  purpleDark: string;
  purple: string;
  yellow: string;
  yellowShadow: string;
  cloud: string;
  cloudShadowPlate: string;
};

function makeColors(theme: Theme): Colors {
  return {
    bg: theme.background,
    purpleDark: theme.accent,
    purple: theme.accent,
    yellow: theme.accent,
    yellowShadow: theme.border,
    cloud: theme.cardLite,
    cloudShadowPlate: theme.border,
  };
}

type Meetup = {
  id: string;
  title: string;
  capacity: number;
  currentCount: number;
  location: string;
  description: string;
  joined: boolean;
  startsAt: string;
  host: string;
  participantEmails: string[];
  endsAt?: string | null;
};

const INITIAL_MEETUPS: Meetup[] = [
  {
    id: 'demo-1',
    title: 'Boba Run @ UREC',
    capacity: 8,
    currentCount: 2,
    location: 'LSU UREC Entrance',
    description: 'Quick boba run after workouts, all majors welcome!',
    joined: false,
    startsAt: new Date().toISOString(),
    host: '',
    participantEmails: [],
    endsAt: null,
  },
  {
    id: 'demo-2',
    title: '4330 Study Group',
    capacity: 10,
    currentCount: 4,
    location: 'Patrick F. Taylor, 3rd floor',
    description: 'Review project specs and past exams for 4330.',
    joined: false,
    startsAt: new Date().toISOString(),
    host: '',
    participantEmails: [],
    endsAt: null,
  },
  {
    id: 'demo-3',
    title: 'Late Night Tennis',
    capacity: 6,
    currentCount: 1,
    location: 'LSU Tennis Courts',
    description: 'Chill late-night rally, all skill levels.',
    joined: false,
    startsAt: new Date().toISOString(),
    host: '',
    participantEmails: [],
    endsAt: null,
  },
];

function convertTo24h(timeStr: string): string | null {
  const t = timeStr.trim().toUpperCase();

  const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  let [, hh, mm, period] = match;
  let hour = parseInt(hh, 10);

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  const hh24 = hour.toString().padStart(2, '0');
  return `${hh24}:${mm}`;
}

function isValidDateYMD(dateStr: string): boolean {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;

  const [, y, mo, d] = m;
  const year = Number(y);
  const month = Number(mo);
  const day = Number(d);

  const dt = new Date(dateStr + 'T00:00:00');
  return (
    !isNaN(dt.getTime()) &&
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() + 1 === month &&
    dt.getUTCDate() === day
  );
}

export default function MeetupsScreen() {
  // 1) Get current theme (light / dark) from ThemeProvider
  const { theme } = useTheme();

    // ---------- Themed header + cloud components (now INSIDE the screen) ----------

  function TopDecor() {
    return (
      <View style={stylesHeader.wrap}>
        <AppText style={stylesHeader.title}>MEETUPS</AppText>

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
        {
          width: cardWidth,
          alignSelf: 'center',
          marginTop: 18,   // ⬅ pushes the whole cloud down so it’s not cut off
          marginBottom: 54,
        },
      ]}
    >
      {/* Soft centered shadow "plate" */}
      <View
        style={{
          position: 'absolute',
          bottom: -2,
          left: "50%",
          transform: [{ translateX: -((cardWidth * 0.85) / 2) }],
          width: cardWidth * 0.87,
          height: 16,
          backgroundColor: "#000",
          borderRadius: 100,
          shadowColor: "#000",
          shadowOpacity: 10,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 4 },
          opacity: 0.24,
          zIndex: 0,
        }}
      />

      {/* Main pill body */}
      <View
        style={{
          width: '100%',
          height: 70,
          backgroundColor: COLORS.cloud,
          borderRadius: 36,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 30,
          shadowColor: '#000',
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 3 },
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 3,
        }}
      >
        <AppText style={stylesCloud.createText}>Create Meetup</AppText>
      </View>

      {/* Top bubbles – pulled down slightly so they stay fully on-screen */}
      <View
        style={{
          position: 'absolute',
          top: -30,
          width: '48%',
          height: 52,
          alignSelf: 'center',
          backgroundColor: COLORS.cloud,
          borderRadius: 60,
          zIndex: 2,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: -16,
          left: 20,
          width: '30%',
          height: 44,
          backgroundColor: COLORS.cloud,
          borderRadius: 50,
          zIndex: 2,
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: -16,
          right: 20,
          width: '30%',
          height: 44,
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

  // 4 subtle shape variants so clouds don't all look the same
  const v = idx % 4;

  let baseH = 58;
  let center = { top: -24, wPct: 0.5, h: 60, radius: 90 };
  let left = { top: -10, wPct: 0.32, h: 44, radius: 50, offsetX: 10 };
  let right = { top: -10, wPct: 0.32, h: 44, radius: 50, offsetX: 10 };

  if (v === 1) {
    baseH = 54;
    center = { top: -20, wPct: 0.6, h: 56, radius: 82 };
    left = { top: -8, wPct: 0.30, h: 40, radius: 46, offsetX: 8 };
    right = { top: -6, wPct: 0.34, h: 42, radius: 48, offsetX: 12 };
  } else if (v === 2) {
    baseH = 50;
    center = { top: -22, wPct: 0.46, h: 52, radius: 78 };
    left = { top: -6, wPct: 0.28, h: 38, radius: 42, offsetX: 12 };
    right = { top: -10, wPct: 0.30, h: 40, radius: 44, offsetX: 8 };
  } else if (v === 3) {
    baseH = 62;
    center = { top: -26, wPct: 0.55, h: 64, radius: 94 };
    left = { top: -12, wPct: 0.34, h: 46, radius: 52, offsetX: 9 };
    right = { top: -8, wPct: 0.30, h: 42, radius: 48, offsetX: 13 };
  }

  // tiny jitter so they don't feel copy-pasted
  const jitterY = idx % 2 === 0 ? 1 : -1;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        stylesCloud.wrap,
        {
          width: cardWidth,
          alignSelf: alignRight ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      {/* Centered oval shadow */}
      <View
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: [{ translateX: -((cardWidth * 0.8) / 2) }],
          width: cardWidth * 0.85,
          height: 16,
          backgroundColor: "#000",
          opacity: 0.12,
          borderRadius: 100,
          zIndex: 0,
        }}
      />


      {/* Base cloud body */}
      <View
        style={{
          width: '100%',
          height: baseH,
          backgroundColor: COLORS.cloud,
          borderRadius: 35,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 4 },
          zIndex: 2,
        }}
      />

      {/* Center bubble */}
      <View
        style={{
          position: 'absolute',
          top: center.top + jitterY,
          width: `${center.wPct * 100}%`,
          height: center.h,
          backgroundColor: COLORS.cloud,
          borderRadius: center.radius,
          alignSelf: 'center',
          zIndex: 3,
        }}
      />

      {/* Left bubble */}
      <View
        style={{
          position: 'absolute',
          top: left.top - jitterY,
          left: left.offsetX,
          width: `${left.wPct * 100}%`,
          height: left.h,
          backgroundColor: COLORS.cloud,
          borderRadius: left.radius,
          zIndex: 3,
        }}
      />

      {/* Right bubble */}
      <View
        style={{
          position: 'absolute',
          top: right.top + jitterY,
          right: right.offsetX,
          width: `${right.wPct * 100}%`,
          height: right.h,
          backgroundColor: COLORS.cloud,
          borderRadius: right.radius,
          zIndex: 3,
        }}
      />

      {/* Label content */}
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

  // 2) Derive your color palette for this screen from the theme
  const COLORS = useMemo(() => makeColors(theme), [theme]);

  // 3) Build theme-aware styles using the factories you pasted earlier
  const styles = useMemo(() => createStyles(COLORS, theme), [COLORS, theme]);
    const stylesHeader = useMemo(
      () => createHeaderStyles(COLORS, theme),
      [COLORS, theme]
    );
    const stylesHeaderCloud = useMemo(
      () => createHeaderCloudStyles(COLORS, theme),
      [COLORS, theme]
    );
    const stylesCloud = useMemo(
      () => createCloudStyles(COLORS, theme),
      [COLORS, theme]
    );

    // 4) Your existing code continues from here ↓
    const route = useRoute<any>();
    const routeParams = (route.params ?? {}) as {
      preloadedMeetups?: Meetup[];
      currentUserId?: string;
    };

    const [meetups, setMeetups] = useState<Meetup[]>(
      routeParams.preloadedMeetups ?? INITIAL_MEETUPS
    );

    const [createOpen, setCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newCapacity, setNewCapacity] = useState('10');
    const [newLocation, setNewLocation] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [refreshing, setRefreshing] = useState(false);


    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newEndTime, setNewEndTime] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const isIOS = Platform.OS === 'ios';


    const [currentUserId, setCurrentUserId] = useState<string | null>(
      routeParams.currentUserId ?? null
    );

    const [participants, setParticipants] = useState<{ id: string; email: string }[]>([]);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedMeetup, setSelectedMeetup] = useState<Meetup | null>(null);
    const [hostEmail, setHostEmail] = useState<string | null>(null);


    //  REPORTING STATE 
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reportMeetupId, setReportMeetupId] = useState<string | null>(null);
    const [reportMeetupTitle, setReportMeetupTitle] = useState<string>('');
    const [reportReason, setReportReason] = useState<
      'safety' | 'harassment' | 'spam' | 'inappropriate' | 'other'
    >('safety');
    const [reportDetails, setReportDetails] = useState<string>('');

    function openReportModalForMeetup(meetup: Meetup) {
      setReportMeetupId(meetup.id);
      setReportMeetupTitle(meetup.title);
      setReportReason('safety');
      setReportDetails('');
      setReportModalVisible(true);
  }

  async function handleSubmitReport() {
    if (!reportMeetupId) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Alert.alert('Not signed in', 'You must be logged in to report a meetup.');
      return;
    }

    const numericMeetupId = Number(reportMeetupId);
    if (Number.isNaN(numericMeetupId)) {
      Alert.alert('Error', 'Something went wrong with this meetup ID.');
      return;
    }

    const { error } = await supabase.from('reports').insert({
      reporter: user.id,
      meetup_id: numericMeetupId,
      reason: reportReason,
      category: reportReason,
      description: reportDetails.trim() || null,
    });

    if (error) {
      console.error('Report error:', error);
      Alert.alert('Error', 'Could not submit your report. Please try again.');
      return;
    }

    setReportModalVisible(false);
    setReportMeetupId(null);
    setReportMeetupTitle('');
    setReportReason('safety');
    setReportDetails('');
    Alert.alert('Thank you', 'Your report has been submitted.');
  }

  const ItemSep = useMemo(() => <View style={{ height: 18 }} />, []);

  const reloadMeetups = async () => {
  try {
    setRefreshing(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user in reloadMeetups:', userError);
      Alert.alert('Not signed in', 'You must be logged in to refresh meetups.');
      return;
    }

    setCurrentUserId(user.id);

    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('meetups')
      .select(`
        id,
        host,
        name,
        description,
        location,
        max_capacity,
        starts_at,
        meetup_participants (
          user_id,
          profiles ( email )
        )
      `)
      .gte('starts_at', nowIso)
      .order('starts_at', { ascending: true });

    if (error) {
      console.error('Error reloading meetups:', error);
      Alert.alert('Error', 'Could not refresh meetups. Please try again.');
      return;
    }

    const mapped: Meetup[] =
      (data ?? []).map((row: any) => {
        const participants = row.meetup_participants ?? [];
        return {
          id: String(row.id),
          title: row.name,
          description: row.description,
          location: row.location,
          capacity: row.max_capacity,
          currentCount: participants.length,
          joined: participants.some((p: any) => p.user_id === user.id),
          startsAt: row.starts_at,
          host: row.host,
          participantEmails: participants.map(
            (p: any) => p.profiles?.email ?? ''
          ),
        };
      }) ?? [];

    setMeetups(mapped);
  } catch (e) {
    console.error('Unexpected error in reloadMeetups:', e);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  } finally {
    setRefreshing(false);
  }
};


  const handleCreatePress = () => {
    setNewTitle('');
    setNewCapacity('10');
    setNewLocation('');
    setNewDescription('');
    setNewDate('');
    setNewTime('');
    setNewEndTime('');
    setCreateOpen(true);
  };

  const openDetails = async (meetup: Meetup) => {
  setSelectedMeetup(meetup);
  setDetailsOpen(true);
  setParticipants([]);
  setLoadingParticipants(false);
  setHostEmail(null);

  // 1) Load host info so anyone can see who made it
  if (meetup.host) {
    try {
      const { data: hostProfile, error: hostErr } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', meetup.host)
        .single();

      if (!hostErr && hostProfile) {
        setHostEmail(hostProfile.email as string);
      } else {
        setHostEmail(null);
      }
    } catch (e) {
      console.error('Error loading host profile', e);
      setHostEmail(null);
    }
  } else {
    setHostEmail('Whirl demo meetup');
  }

  if (!currentUserId || currentUserId !== meetup.host) return;

  try {
    setLoadingParticipants(true);

    const { data: rows, error: partErr } = await supabase
      .from('meetup_participants')
      .select('user_id')
      .eq('meetup_id', Number(meetup.id));

    if (partErr) {
      console.error('Error loading participants', partErr);
      return;
    }

    if (!rows || rows.length === 0) {
      setParticipants([]);
      return;
    }

    const userIds = rows.map(r => r.user_id);

    const { data: profs, error: profErr } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', userIds);

    if (profErr) {
      console.error('Error loading participant emails', profErr);
      return;
    }

    const mapped = (profs ?? []).map(p => ({
      id: p.id as string,
      email: p.email as string,
    }));

    setParticipants(mapped);
  } finally {
    setLoadingParticipants(false);
  }
};


  const handleSubmitCreate = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedLocation = newLocation.trim();
    const trimmedDescription = newDescription.trim();
    const dateTrimmed = newDate.trim();
    const timeTrimmed = newTime.trim();
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

    if (!dateTrimmed || !timeTrimmed) {
      Alert.alert('Add a date & time', 'Please fill in both date and time.');
      return;
    }

    if (!isValidDateYMD(dateTrimmed)) {
      Alert.alert(
        'Invalid date',
        'Please use date format YYYY-MM-DD (for example: 2025-11-30).'
      );
      return;
    }

    const time24 = convertTo24h(timeTrimmed);
    if (!time24) {
      Alert.alert(
        'Invalid time',
        'Please use time format like "6:30 PM" or "11:05 AM".'
      );
      return;
    }

    let endsAtIso: string | null = null;
    if (newEndTime.trim()) {
      const end24 = convertTo24h(newEndTime.trim());
      if (!end24) {
        Alert.alert(
          'Invalid end time',
          'Please use time format like "8:00 PM" or leave it blank.'
        );
        return;
      }

      const isoStartCandidate = `${dateTrimmed}T${time24}:00`;
      const isoEndCandidate = `${dateTrimmed}T${end24}:00`;
      const parsedStart = new Date(isoStartCandidate);
      const parsedEnd = new Date(isoEndCandidate);

      if (isNaN(parsedEnd.getTime())) {
        Alert.alert('Invalid end time', 'Please double-check your end time.');
        return;
      }

      if (parsedEnd <= parsedStart) {
        Alert.alert(
          'End time must be later',
          'Please choose an end time after the start time, or leave it blank.'
        );
        return;
      }

      endsAtIso = parsedEnd.toISOString();
    }

    if (isNaN(cap) || cap <= 0) {
      Alert.alert('Invalid capacity', 'Capacity must be a positive number.');
      return;
    }

    const isoCandidate = `${dateTrimmed}T${time24}:00`;
    const parsed = new Date(isoCandidate);

    if (isNaN(parsed.getTime())) {
      console.log('Bad isoCandidate:', isoCandidate);
      Alert.alert('Invalid date/time', 'Please double-check your date and time.');
      return;
    }

    const startsAtIso = parsed.toISOString();

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(userError);
        Alert.alert('Not signed in', 'You must be logged in to create a meetup.');
        return;
      }

      const { data, error } = await supabase
        .from('meetups')
        .insert({
          host: user.id,
          name: trimmedTitle,
          description: trimmedDescription,
          location: trimmedLocation,
          max_capacity: cap,
          starts_at: startsAtIso,
          ends_at: endsAtIso,  
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating meetup', error);
        Alert.alert('Error', 'Could not create meetup. Please try again.');
        return;
      }

      const created: Meetup = {
        id: String(data.id),
        title: data.name,
        description: data.description,
        location: data.location,
        capacity: data.max_capacity,
        currentCount: 0,
        joined: false,
        startsAt: data.starts_at,
        host: data.host,
        participantEmails: [],
        endsAt: data.ends_at ?? null,
      };

      setMeetups(prev => [created, ...prev]);
      setCreateOpen(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleJoinFromDetails = () => {
    if (!selectedMeetup) return;
    handleJoin(selectedMeetup.id);
    setDetailsOpen(false);
  };

  const handleJoin = async (id: string) => {
    if (!currentUserId) {
      Alert.alert('Not signed in', 'You must be logged in to join.');
      return;
    }

    const target = meetups.find(m => m.id === id);
    if (!target) return;

    const numericId = Number(id);

    try {
      if (target.joined) {
        const { error } = await supabase
          .from('meetup_participants')
          .delete()
          .eq('meetup_id', numericId)
          .eq('user_id', currentUserId);

        if (error) {
          console.error('Error leaving meetup', error);
          Alert.alert('Error', 'Could not leave meetup.');
          return;
        }

        setMeetups(prev =>
          prev.map(m =>
            m.id === id
              ? {
                  ...m,
                  joined: false,
                  currentCount: Math.max(0, m.currentCount - 1),
                }
              : m
          )
        );
      } else {
        if (target.currentCount >= target.capacity) {
          Alert.alert('Lobby full', 'This meetup is already at capacity.');
          return;
        }

        const { error } = await supabase
          .from('meetup_participants')
          .insert({ meetup_id: numericId, user_id: currentUserId });

        if (error) {
          console.error('Error joining meetup', error);
          Alert.alert('Error', 'Could not join meetup.');
          return;
        }

        setMeetups(prev =>
          prev.map(m =>
            m.id === id
              ? { ...m, joined: true, currentCount: m.currentCount + 1 }
              : m
          )
        );
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (!date) return;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    setNewDate(`${year}-${month}-${day}`);
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (!date) return;

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    const mm = String(minutes).padStart(2, '0');

    setNewTime(`${hour12}:${mm} ${isPM ? 'PM' : 'AM'}`);
  };

  const handleEndTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowEndTimePicker(false);
    if (!date) return;

    let hours = date.getHours();
    const minutes = date.getMinutes();

    const isPM = hours >= 12;
    const hour12 = hours % 12 || 12;
    const mm = String(minutes).padStart(2, '0');

    setNewEndTime(`${hour12}:${mm} ${isPM ? 'PM' : 'AM'}`);
  };

  return (
    <FadeInView style={{ flex: 1 }}>
      <SafeAreaView style={styles.root}>
        <TopDecor />

        <FlatList
          contentContainerStyle={styles.listContent}
          data={meetups}
          keyExtractor={m => m.id}
          ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
          ListHeaderComponent={<CreateCloudButton onPress={handleCreatePress} />}
          renderItem={({ item, index }) => (
            <FadeInView delay={150 + index * 80}>
              <CloudItem
                meetup={item}
                alignRight={index % 2 === 1}
                idx={index}
                onPress={() => openDetails(item)}
              />
            </FadeInView>
          )}
          refreshing={refreshing}
          onRefresh={reloadMeetups}
          showsVerticalScrollIndicator={false}
        />

        <Image
          source={require('../../assets/footer.png')}
          style={styles.footer}
          resizeMode="stretch"
        />
        {/* Create Meetup Modal */}
        <Modal
          visible={createOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setCreateOpen(false)}
        >
          <View style={styles.modalBackdrop}>
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

              <Text style={styles.modalLabel}>Date</Text>
              <TouchableOpacity
                style={styles.modalInput}
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Choose meetup date"
                accessibilityHint="Opens a calendar so you can pick the meetup date"
              >
                <Text style={{ color: newDate ? '#000' : '#888' }}>
                  {newDate || 'Tap to pick a date'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={newDate ? new Date(newDate + 'T12:00:00') : new Date()}
                   mode="date"
                   display={isIOS ? 'inline' : 'calendar'}
                   minimumDate={new Date()}
                     onChange={handleDateChange}
                       />
)}

              <Text style={styles.modalLabel}>Time</Text>
              <TouchableOpacity
                style={styles.modalInput}
                onPress={() => setShowTimePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Choose meetup time"
                accessibilityHint="Opens a clock so you can pick the meetup time"
              >
                <Text style={{ color: newTime ? '#000' : '#888' }}>
                  {newTime || 'Tap to pick a time'}
                </Text>
              </TouchableOpacity>

             {showTimePicker && (
            <DateTimePicker
                 value={new Date()}
                 mode="time"
                 display={isIOS ? 'spinner' : 'clock'}
                 onChange={handleTimeChange}
               />
              )}



              <Text style={styles.modalLabel}>End time </Text>
              <TouchableOpacity
                style={styles.modalInput}
                onPress={() => setShowEndTimePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Choose meetup end time"
                accessibilityHint="Opens a clock so you can pick when the meetup ends"
              >
                <Text style={{ color: newEndTime ? '#000' : '#888' }}>
                  {newEndTime || 'Tap to pick an end time'}
                </Text>
              </TouchableOpacity>

              {showEndTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display={isIOS ? 'spinner' : 'clock'}
                  onChange={handleEndTimeChange}
                />
              )}

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
                  <Text style={[styles.modalButtonText, styles.modalCancelText]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCreate]}
                  onPress={handleSubmitCreate}
                >
                  <Text style={[styles.modalButtonText, styles.modalPrimaryText]}>Create</Text>
                </TouchableOpacity>
            </View>
          </View>
          </View>
        </Modal>

        {/* Meetup Details Modal */}
        <Modal
          visible={detailsOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDetailsOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedMeetup && (
  <>
                  <Text style={styles.modalTitle}>{selectedMeetup.title}</Text>

                   <Text style={styles.modalLabel}>Hosted by</Text>
                     <Text style={styles.detailText}>
                      {hostEmail
                      ? hostEmail
                      : selectedMeetup.host
                      ? 'Loading host…'
                      : 'Whirl demo meetup'}
                        </Text>

                  <Text style={styles.modalLabel}>Location</Text>
                  <Text style={styles.detailText}>{selectedMeetup.location}</Text>


                  <Text style={styles.modalLabel}>Description</Text>
                  <Text style={styles.detailText}>{selectedMeetup.description}</Text>

                  <Text style={styles.modalLabel}>When</Text>
                  <Text style={styles.detailText}>
                    {(() => {
                      const start = new Date(selectedMeetup.startsAt);
                      const dateStr = start.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      });
                      const startTimeStr = start.toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      });

                      if (selectedMeetup.endsAt) {
                        const end = new Date(selectedMeetup.endsAt);
                        const endTimeStr = end.toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        });
                        return `${dateStr} • ${startTimeStr} – ${endTimeStr}`;
                      }

                      return `${dateStr} • ${startTimeStr}`;
                    })()}
                  </Text>

                  <Text style={styles.modalLabel}>Spots</Text>
                  <Text style={styles.detailText}>
                    {selectedMeetup.currentCount}/{selectedMeetup.capacity} people
                    {selectedMeetup.joined ? ' (You joined)' : ''}
                  </Text>

                  {currentUserId === selectedMeetup.host && (
                    <>
                      <Text style={styles.modalLabel}>Participants (emails)</Text>
                      {loadingParticipants && (
                        <Text style={styles.detailText}>Loading…</Text>
                      )}
                      {!loadingParticipants && participants.length === 0 && (
                        <Text style={styles.detailText}>Nobody has joined yet.</Text>
                      )}
                      {!loadingParticipants &&
                        participants.map(p => (
                          <Text key={p.id} style={styles.detailText}>
                            • {p.email}
                          </Text>
                        ))}
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.reportLink}
                    onPress={() => openReportModalForMeetup(selectedMeetup)}
                  >
                    <Text style={styles.reportLinkText}>Report this meetup</Text>
                  </TouchableOpacity>

                  <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancel]}
                    onPress={() => setDetailsOpen(false)}
                  >
                    <Text style={[styles.modalButtonText, styles.modalCancelText]}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCreate]}
                    onPress={handleJoinFromDetails}
                  >
                    <Text style={[styles.modalButtonText, styles.modalPrimaryText]}>
                      {selectedMeetup.joined ? 'Leave' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Report Modal */}
        <Modal
          visible={reportModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setReportModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Report meetup</Text>

              {reportMeetupTitle ? (
                <Text style={[styles.detailText, { marginBottom: 4 }]}>
                  Meetup: {reportMeetupTitle}
                </Text>
              ) : null}

              <Text style={styles.modalLabel}>Reason</Text>
              <View style={styles.reportReasonRow}>
                {(['safety', 'harassment', 'spam', 'inappropriate', 'other'] as const).map(
                  reason => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reportReasonChip,
                        reportReason === reason && styles.reportReasonChipActive,
                      ]}
                      onPress={() => setReportReason(reason)}
                    >
                      <Text
                        style={[
                          styles.reportReasonText,
                          reportReason === reason && styles.reportReasonTextActive,
                        ]}
                      >
                        {reason}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>

              <Text style={styles.modalLabel}>Details (optional)</Text>
              <TextInput
                style={styles.reportInput}
                multiline
                placeholder="Describe what happened. Include behavior, time, and other context."
                placeholderTextColor="#888"
                value={reportDetails}
                onChangeText={setReportDetails}
              />

              <View style={styles.reportButtonsRow}>
                <TouchableOpacity
                  style={styles.reportCancelButton}
                  onPress={() => setReportModalVisible(false)}
                >
                  <Text style={styles.reportCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportSubmitButton}
                  onPress={handleSubmitReport}
                >
                  <Text style={styles.reportSubmitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </FadeInView>
  );
}

// ------------------------------
// THEME–AWARE STYLE SHEETS
// ------------------------------

// ------------------------------
// THEME–AWARE STYLE SHEETS
// ------------------------------

const createStyles = (COLORS: any, theme: any) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: COLORS.bg,
    },

    // FlatList content
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 40,
    },

    scrollArea: {
      paddingHorizontal: 22,
      paddingTop: 12,
      paddingBottom: 150,
    },

    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 10,
    },

    emptyWrap: {
      alignItems: 'center',
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },

    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: 80,
    },

    // ---------- Modal (shared) -----------
    modalBackdrop: {
      flex: 1,
      backgroundColor: '#0008',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: '#0008',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCard: {
      width: '88%',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.purpleDark,
      marginBottom: 12,
    },
    modalLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.textPrimary,
      marginTop: 12,
    },
    modalInput: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginTop: 6,
      color: theme.textPrimary,
    },

    // row with Cancel / Confirm / Join buttons
    modalButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 22,
    },

    modalButton: {
      flex: 1,
      marginHorizontal: 4,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalCancel: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalConfirm: {
      backgroundColor: theme.accent,
    },
    modalCreate: {
      backgroundColor: theme.accent,
    },
    modalButtonText: {
      color: theme.accentText,
      fontSize: 15,
      fontWeight: '600',
    },
    modalCancelText: {
      color: theme.textPrimary,
    },

    modalPrimaryText: {
      color: theme.accentText,
    },

    detailText: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },

    // Report link under meetup details
    reportLink: {
      marginTop: 16,
      marginBottom: 8,
    },
    reportLinkText: {
      fontSize: 13,
      color: theme.accent,
      textDecorationLine: 'underline',
    },

    // Report modal
    reportReasonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    reportReasonChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.border,
      marginRight: 6,
      marginBottom: 6,
    },
    reportReasonChipActive: {
      backgroundColor: theme.accent,
      borderColor: theme.accent,
    },
    reportReasonText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    reportReasonTextActive: {
      color: theme.accentText,
      fontWeight: '600',
    },
    reportInput: {
      marginTop: 6,
      minHeight: 80,
      maxHeight: 140,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
      color: theme.textPrimary,
      backgroundColor: theme.card,
      textAlignVertical: 'top',
    },
    reportButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 18,
    },
    reportCancelButton: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 10,
    },
    reportCancelText: {
      fontSize: 14,
      color: theme.accent,
    },
    reportSubmitButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.accent,
    },
    reportSubmitText: {
      fontSize: 14,
      color: theme.accentText,
      fontWeight: '600',
    },
  });

// ------------------------------
// HEADER (MEETUPS TITLE + DECOR)
// ------------------------------

const createHeaderStyles = (COLORS: any, theme: any) =>
  StyleSheet.create({
    wrap: {
      paddingHorizontal: 22,
      paddingTop: 18,
      paddingBottom: 12,
      backgroundColor: COLORS.bg,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: COLORS.purpleDark,
      letterSpacing: 1,
    },
    subTitle: {
      marginTop: 4,
      fontSize: 15,
      color: theme.textSecondary,
    },
    moon: {
      position: 'absolute',
      right: 22,
      top: 12,
      width: 80,
      height: 80,
      borderRadius: 40,
    },
  });

// ------------------------------
// PUFFY HEADER CLOUD
// ------------------------------

const createHeaderCloudStyles = (COLORS: any, _theme: any) =>
  StyleSheet.create({
    wrap: {
      marginTop: 14,
      alignSelf: 'flex-start',
      position: 'relative',
    },
    shadow: {
      height: 18,
      width: 75,
      backgroundColor: COLORS.yellowShadow,
      borderRadius: 20,
      marginLeft: 8,
      marginBottom: -10,
    },
    bubble: {
      position: 'absolute',
      backgroundColor: COLORS.yellow,
      borderRadius: 999,
    },
    base: {
      height: 26,
      marginTop: 16,
      marginLeft: 16,
      marginRight: 16,
      borderRadius: 999,
      backgroundColor: COLORS.yellow,
    },
  });

// ------------------------------
// MEETUP CLOUD ITEMS
// ------------------------------

const createCloudStyles = (COLORS: any, theme: any) =>
  StyleSheet.create({
    // container for each cloud card
    wrap: {
      marginBottom: 32,
    },

    // legacy cloud styles (still fine to keep if you use them later)
    cloudContainer: {
      marginBottom: 20,
    },
    cloudBase: {
      backgroundColor: COLORS.cloud,
      borderRadius: 22,
      padding: 18,
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    cloudTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    cloudDescription: {
      fontSize: 14,
      marginTop: 6,
      color: theme.textSecondary,
    },
    cloudFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 14,
    },
    capacityText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    joinButton: {
      backgroundColor: COLORS.purple,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    joinButtonText: {
      color: theme.accentText,
      fontWeight: '600',
      fontSize: 14,
    },

    // CreateCloudButton text
    createText: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
    },

    // CloudItem label row (title + capacity)
    labelWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    labelTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
      flexShrink: 1,
      marginRight: 8,
    },
    labelCapacity: {
      fontSize: 13,
      color: theme.textSecondary,
    },
  });