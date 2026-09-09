import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';

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
          autoCorrect={false}
          spellCheck={false}
          {...props}
          secureTextEntry={isPassword && !visible}
          style={styles.input}
          placeholderTextColor="#A9B8C4"
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setVisible(v => !v)}
            style={styles.eye}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.6}
          >
            <Text style={styles.eyeText}>{visible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // .field — margin-bottom: 13px
  wrapper: { marginBottom: 13 },
  // label — font-size:11.5px; font-weight:700; color:var(--slate); margin-bottom:6px
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5C6B7A',
    marginBottom: 6,
  },
  // input — padding:11px 12px; border:1.4px solid var(--line); border-radius:9px; font-size:13px; color:var(--ink); background:#fff
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 46,
  },
  inputError: { borderColor: '#C0392B' },
  input: {
    flex: 1,
    fontSize: 13,
    color: '#14202E',
  },
  eye: { paddingLeft: 12, paddingVertical: 10 },
  eyeText: { fontSize: 11.5, color: '#175E86', fontWeight: '600' },
  errorText: { fontSize: 11, color: '#C0392B', marginTop: 4 },
});
