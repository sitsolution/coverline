import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
}

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.btn} activeOpacity={0.7}>
      <Text style={styles.arrow}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 20 },
});
