import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface BackButtonProps {
  onPress: () => void;
}

const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.btn}
      activeOpacity={0.7}
      hitSlop={HIT_SLOP}
    >
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
