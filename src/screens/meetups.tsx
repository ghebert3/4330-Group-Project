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

//  CLOUD

function CloudItem({ alignRight = false }: { alignRight?: boolean }) {
  const cardWidth = Math.min(width * 0.55, 200); // smaller cloud width

  return (
    <View
      style={[
        stylesCloud.wrap,
        { width: cardWidth, alignSelf: alignRight ? 'flex-end' : 'flex-start' },
      ]}
    >
      {/* Lavender shadow under the cloud */}
      <View style={stylesCloud.shadowPlate} />

      {/* Base cloud shape */}
      <View style={stylesCloud.cloudBase} />

      {/* Puffy top (center + small sides) */}
      <View style={stylesCloud.topPuffLarge} />
      <View style={stylesCloud.topPuffSmallLeft} />
      <View style={stylesCloud.topPuffSmallRight} />
    </View>
  );
}





// SCREEN 

export default function MeetupsScreen() {
  // generate endless dummy items
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
        renderItem={({ index }) => 
        <CloudItem alignRight={index % 2 === 1} />}
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
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 6 },
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

  // Lavender shadow (soft drop under the cloud)
  shadowPlate: {
    position: 'absolute',
    bottom: -6,
    width: '72%',
    height: 18,
    backgroundColor: '#D9C6FF', 
    borderRadius: 20,
    alignSelf: 'center',
    opacity: 0.9,
    zIndex: 0,
  },

  // base cloud shape
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

  // center puff
  topPuffLarge: {
    position: 'absolute',
    top: -26,
    width: '48%',
    height: 64,
    backgroundColor: '#F2A51A',
    borderRadius: 50,
    zIndex: 3,
  },

  // left puff
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

  // right puff
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
