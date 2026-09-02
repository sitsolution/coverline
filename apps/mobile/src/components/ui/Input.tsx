import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../constants/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export default function Input({ label, error, isPassword = false, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error ? styles.inputError : null]}>
        <TextInput
          {...props}
          secureTextEntry={isPassword && !visible}
          style={styles.input}
          placeholderTextColor={Colors.textSecondary}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.eye}>
            <Text style={styles.eyeText}>{visible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: Colors.border,
    borderRadius: 9,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
  },
  inputError: { borderColor: Colors.error },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: Colors.text,
  },
  eye: { paddingLeft: 8 },
  eyeText: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 4 },
});
