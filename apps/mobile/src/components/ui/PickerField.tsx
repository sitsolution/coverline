import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PickerFieldProps {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onSelect: (val: string) => void;
  error?: string;
}

export default function PickerField({
  label,
  value,
  options,
  placeholder = 'Select an option',
  onSelect,
  error,
}: PickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleDone = () => {
    onSelect(tempValue || options[0]);
    setOpen(false);
  };

  if (Platform.OS === 'android') {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.trigger, error ? styles.triggerError : null]}>
          <Picker
            selectedValue={value}
            onValueChange={(val) => onSelect(val as string)}
            mode="dropdown"
            style={styles.androidPicker}
            dropdownIconColor="#5C6B7A"
          >
            <Picker.Item label={placeholder} value="" color="#A9B8C4" />
            {options.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} color="#14202E" />
            ))}
          </Picker>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  // iOS
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => { setTempValue(value); setOpen(true); }}
        activeOpacity={0.7}
      >
        <Text style={value ? styles.value : styles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetToolbar}>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.cancelBtn}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sheetTitle}>{label}</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.doneBtn}>Done</Text>
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={tempValue || options[0]}
            onValueChange={(val) => setTempValue(val as string)}
          >
            {options.map((opt) => (
              <Picker.Item key={opt} label={opt} value={opt} />
            ))}
          </Picker>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 13 },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#5C6B7A',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: Platform.OS === 'android' ? 52 : 46,
  },
  triggerError: { borderColor: '#C0392B' },
  placeholder: { flex: 1, fontSize: 13, color: '#A9B8C4' },
  value: { flex: 1, fontSize: 13, color: '#14202E' },
  chevron: { fontSize: 14, color: '#5C6B7A' },
  errorText: { fontSize: 11, color: '#C0392B', marginTop: 4 },

  // Android
  androidPicker: {
    flex: 1,
    height: 52,
    color: '#14202E',
    marginLeft: -8,
  },

  // iOS Modal
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  sheetToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4EA',
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14202E',
  },
  cancelBtn: {
    fontSize: 13,
    color: '#5C6B7A',
  },
  doneBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F3D5C',
  },
});
