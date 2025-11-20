//Handles Short Fade In Animation For Screens
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

type FadeInViewProps = {
  children: React.ReactNode;
  duration?: number;      
  style?: StyleProp<ViewStyle>;
};

export default function FadeInView({
  children,
  duration = 250,
  style,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.97)).current; 

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, duration]);

  return (
    <Animated.View
      style={[
        { flex: 1, opacity, transform: [{ scale }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
