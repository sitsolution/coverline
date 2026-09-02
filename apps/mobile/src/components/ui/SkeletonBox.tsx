import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
  borderRadius?: number;
};

/**
 * 4.2 – Skeleton primitive
 * Animated pulsing placeholder for a single line / block.
 * Compose multiple SkeletonBox instances inside a card to build
 * full skeleton screens.
 *
 * Usage:
 *   <SkeletonBox height={14} width="60%" style={{ marginBottom: 10 }} />
 */
export default function SkeletonBox({
  width = '100%',
  height = 12,
  style,
  borderRadius = 8,
}: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1,   duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: '#E9EFF3' },
});
