import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  icon: string;
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onPress?: () => void;
};

/**
 * 4.1 – Empty State
 * Centered layout with emoji icon, title, subtitle, and optional CTA button.
 *
 * Usage:
 *   <EmptyState
 *     icon="🩺"
 *     title="No shifts match your criteria"
 *     subtitle="Try widening your location or date range"
 *     buttonLabel="Adjust Filters"
 *     onPress={openFilters}
 *   />
 */
export default function EmptyState({ icon, title, subtitle, buttonLabel, onPress }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {buttonLabel && onPress ? (
        <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.btnText}>{buttonLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 70,
  },
  icon:     { fontSize: 34, marginBottom: 14, textAlign: 'center' },
  title:    { fontSize: 13.5, fontWeight: '700', color: '#14202E', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 11.5, color: '#5C6B7A', marginBottom: 18, textAlign: 'center', lineHeight: 17 },
  btn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  btnText: { fontSize: 11.5, fontWeight: '700', color: '#fff' },
});
