import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  icon?: string;
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

/**
 * 4.3 – Error State
 * Full-screen centered error display.  Renders an emoji icon, bold title,
 * description, and a "Retry" button.  All props have sensible defaults for
 * the most common network-error scenario.
 *
 * Usage:
 *   <ErrorState onRetry={fetchData} />
 *
 *   // Custom message
 *   <ErrorState
 *     icon="🔒"
 *     title="Access denied"
 *     description="You don't have permission to view this page."
 *     retryLabel="Go back"
 *     onRetry={() => navigation.goBack()}
 *   />
 */
export default function ErrorState({
  icon        = '📡',
  title       = 'Unable to connect',
  description = 'Please check your internet connection and try again.',
  retryLabel  = 'Retry',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.btn} onPress={onRetry} activeOpacity={0.85}>
          <Text style={styles.btnText}>{retryLabel}</Text>
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
    paddingHorizontal: 30,
  },
  icon:        { fontSize: 36, marginBottom: 14, textAlign: 'center' },
  title:       { fontSize: 14.5, fontWeight: '800', color: '#14202E', marginBottom: 6, textAlign: 'center' },
  description: { fontSize: 12, color: '#5C6B7A', marginBottom: 20, textAlign: 'center', lineHeight: 18 },
  btn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  btnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
