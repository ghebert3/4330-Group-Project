// src/components/FadeInView.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

type FadeInViewProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  /** extra delay before animation starts (ms) */
  delay?: number;
  /** override duration if you want (default 320ms) */
  duration?: number;
  /** how far down it starts (px) – subtle slide-up */
  from?: number;
};

export default function FadeInView({
  children,
  style,
  delay = 0,
  duration = 320,
  from = 12,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic), // smooth, like big social apps
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, duration, from, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}