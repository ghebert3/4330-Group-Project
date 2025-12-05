import React, { useRef } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { Animated } from 'react-native';

type AnimatedButtonProps = PressableProps & {
  children: React.ReactNode;
};

export default function AnimatedButton(props: AnimatedButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        {...props}
        onPressIn={(e) => {
          handlePressIn();
          props.onPressIn?.(e);
        }}
        onPressOut={(e) => {
          handlePressOut();
          props.onPressOut?.(e);
        }}
      >
        {props.children}
      </Pressable>
    </Animated.View>
  );
}