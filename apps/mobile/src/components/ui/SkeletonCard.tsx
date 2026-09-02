import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonBox from './SkeletonBox';

type Props = {
  /** Number of repeated skeleton cards to render */
  count?: number;
};

/**
 * 4.2 – Skeleton card
 * Mimics a shift/content card with animated placeholder lines.
 * Matches the HTML design: title line (14px h, 60%), subtitle (10px, 40%),
 * two body lines (10px, 90% / 70%).
 *
 * Usage:
 *   // Single card
 *   <SkeletonCard />
 *
 *   // Multiple (e.g. while list is loading)
 *   <SkeletonCard count={3} />
 */
export default function SkeletonCard({ count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBox height={14} width="60%" style={{ marginBottom: 10 }} />
          <SkeletonBox height={10} width="40%" style={{ marginBottom: 14 }} />
          <SkeletonBox height={10} width="90%" style={{ marginBottom: 6 }} />
          <SkeletonBox height={10} width="70%" />
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
});
