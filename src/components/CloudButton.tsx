import React, { useRef } from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import { Animated } from 'react-native';

type CloudButtonProps = PressableProps & {
  children: React.ReactNode;
  containerStyle?: ViewStyle;
};

export default function CloudButton({
  children,
  containerStyle,
  ...rest
}: CloudButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
        speed: 25,
        bounciness: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 25,
        bounciness: 8,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, containerStyle]}>
      <Pressable
        {...rest}
        onPress={(e) => {
          bounce();
          rest.onPress?.(e);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}