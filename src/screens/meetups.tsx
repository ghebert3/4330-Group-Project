import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

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


function TopDecor() {
  return (
    <View style={stylesHeader.wrap}>
    <Text style={stylesHeader.title}>MEETUPS</Text>

      {/* purple gradient moon */}
      <LinearGradient
        colors={[COLORS.purpleDark, COLORS.purple, 'rgba(255,255,255,0.85)']}
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

//Cloud Varients
const pickVariant = (index: number): 0 | 1 | 2 | 3 => {
  const n = Math.abs(Math.floor(Math.sin((index + 1) * 9301) * 1000));
  return (n % 4) as 0 | 1 | 2 | 3;
};

function CloudItem({
  alignRight = false,
  idx = 0,
}: {
  alignRight?: boolean;
  idx?: number;
}) {
  const cardWidth = Math.min(width * 0.55, 200); // base width

  const v = idx % 3;

  let baseH = 58;
  let shadow = { bottom: -4, left: 14.8, widthPct: 0.92, height: 18, opacity: 1 };
  let center = { top: -26, wPct: 0.48, h: 70, radius: 90 };
  let left = { top: -12, left: 12, wPct: 0.28, h: 48, radius: 50 };
  let right = { top: -10, right: 12, wPct: 0.28, h: 46, radius: 50 };

  if (v === 1) {
    // Variant 1 
    baseH = 50;
    shadow = { bottom: -4.5, left: 8, widthPct: .95, height: 19, opacity: 0.9 };
    center = { top: -24, wPct: 0.60, h: 60, radius: 80 };
    left = { top: -10, left: 6, wPct: 0.30, h: 42, radius: 42 };
    right = { top: -9, right: 6, wPct: 0.30, h: 40, radius: 40 };
  } else if (v === 2) {
    // Variant 2
    baseH = 42;
  shadow = { bottom: -4, left: 15, widthPct: 0.90, height: 14, opacity: 0.8 };
  center = { top: -22, wPct: 0.42, h: 48, radius: 70 };
  left = { top: -10, left: 12, wPct: 0.26, h: 36, radius: 40 };
  right = { top: -10, right: 12, wPct: 0.26, h: 36, radius: 40 };
  }

  return (
    <View
      style={[
        stylesCloud.wrap,
        { width: cardWidth, alignSelf: alignRight ? 'flex-end' : 'flex-start' },
      ]}
    >
      {/* shadow under cloud */}
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
    </View>
  );
}





// SCREEN 

export default function MeetupsScreen() {
  const INITIAL_COUNT = 20;
  const [items, setItems] = useState<number[]>(
    Array.from({ length: INITIAL_COUNT }, (_, i) => i)
  );

  const loadMore = useCallback(() => {
    setItems(prev => {
      const start = prev.length;
      const more = Array.from({ length: 20 }, (_, i) => start + i);
      return prev.concat(more);
    });
  }, []);

  const keyExtractor = useCallback((n: number) => String(n), []);
  const ItemSep = useMemo(() => <View style={{ height: 18 }} />, []);

  return (
    <SafeAreaView style={styles.root}>
      <TopDecor />

      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={() => ItemSep}
        renderItem={({ index }) => (<CloudItem
       alignRight={index % 2 === 1}
       idx={index}
  />
)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// STYLES 

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { paddingHorizontal: 30, paddingBottom: 32, paddingTop: 25 },
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
    fontWeight: '800',
    letterSpacing: 2,
    color: COLORS.purpleDark,
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
    height: 62,
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
});
