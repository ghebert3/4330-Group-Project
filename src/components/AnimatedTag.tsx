import React, { useEffect, useRef } from 'react';
import { Animated, Text, ViewStyle } from 'react-native';

type AnimatedTagProps = {
  label: string;
  style?: ViewStyle | ViewStyle[];
};

export default function AnimatedTag({ label, style }: AnimatedTagProps) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: '#EEE5FF',
          marginRight: 8,
          marginBottom: 8,
          transform: [{ scale }],
          opacity,
        },
        style,
      ]}
    >
      <Text style={{ color: '#461D7C', fontWeight: '500', fontSize: 13 }}>
        {label}
      </Text>
    </Animated.View>
  );
}