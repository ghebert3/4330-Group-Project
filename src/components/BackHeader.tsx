import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

type BackHeaderProps = {
  title?: string;
  backgroundColor?: string;
  textColor?: string;
  onBack?: () => void;
};

const DEFAULT_BG = '#FFFFFF';
const DEFAULT_TEXT = '#555555';

export default function BackHeader({
  title,
  backgroundColor = DEFAULT_BG,
  textColor = DEFAULT_TEXT,
  onBack,
}: BackHeaderProps) {
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor }}>
      <View style={styles.header}>

        {/* CLICKABLE ARROW ONLY */}
        <Pressable
          onPress={handleBack}
          hitSlop={20}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color={textColor} />
        </Pressable>

        {/* Optional centered title */}
        {title ? (
          <Text style={[styles.headerTitle, { color: textColor }]}>
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {/* Spacer to keep title perfectly centered */}
        <View style={{ width: 40 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 4,
  },
  backButton: {
    paddingVertical: 6,
    paddingRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});