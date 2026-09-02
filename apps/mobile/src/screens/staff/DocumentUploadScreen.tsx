import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { DocsStackParamList } from '../../navigation/DocsStackNavigator';
import PickerField from '../../components/ui/PickerField';

type Props = {
  navigation: NativeStackNavigationProp<DocsStackParamList, 'DocumentUpload'>;
};

const DOC_TYPES = [
  'Medical License',
  'BLS Certification',
  'ACLS Certification',
  'ID Proof',
  'Educational Certificate',
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Date Field ───────────────────────────────────────────────────────────────

function DateField({ label, value, onChange }: {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}) {
  const [show, setShow] = useState(false);

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShow(true)} activeOpacity={0.8}>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
        <Text style={styles.dateIcon}>📅</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
          onTouchCancel={() => setShow(false)}
        />
      )}
      {show && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.doneBtn} onPress={() => setShow(false)}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DocumentUploadScreen({ navigation }: Props) {
  const [selectedType, setSelectedType] = useState(DOC_TYPES[0]);
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date(2022, 2, 4));   // 04 Mar 2022
  const [expiryDate, setExpiryDate] = useState(new Date(2027, 2, 4)); // 04 Mar 2027
  const [checked, setChecked] = useState(false);
  const [pickedFileName, setPickedFileName] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const handleBrowseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        setPickedFileName(result.assets[0].name);
      }
    } catch {
      Alert.alert('Error', 'Could not open file picker.');
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const name = uri.split('/').pop() ?? 'photo.jpg';
      setPickedFileName(name);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Upload Document</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>

        {/* Document Type selector */}
        <PickerField
          label="Document Type"
          options={DOC_TYPES}
          value={selectedType}
          onSelect={setSelectedType}
        />

        {/* Upload area */}
        <TouchableOpacity style={styles.uploadArea} onPress={handleBrowseFile} activeOpacity={0.8}>
          <Text style={styles.uploadIcon}>📄</Text>
          <Text style={styles.uploadTitle}>
            {pickedFileName ? pickedFileName : 'Tap to browse file'}
          </Text>
          <Text style={styles.uploadSub}>PDF, JPG, PNG up to 10MB</Text>
        </TouchableOpacity>

        {/* Take Photo button */}
        <TouchableOpacity style={styles.outlineBtn} onPress={handleTakePhoto} activeOpacity={0.8}>
          <Text style={styles.outlineBtnText}>📷  Take Photo</Text>
        </TouchableOpacity>

        {/* Document Number */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Document Number</Text>
          <TextInput
            style={styles.input}
            placeholder="MCI-2019-88213"
            placeholderTextColor="#A9B8C4"
            value={docNumber}
            onChangeText={setDocNumber}
          />
        </View>

        {/* Issue Date */}
        <DateField label="Issue Date" value={issueDate} onChange={setIssueDate} />

        {/* Expiry Date */}
        <DateField label="Expiry Date" value={expiryDate} onChange={setExpiryDate} />

        {/* Confirmation checkbox */}
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setChecked(c => !c)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I confirm this document is valid and belongs to me
          </Text>
        </TouchableOpacity>

        {/* Upload button */}
        <TouchableOpacity
          style={[styles.primaryBtn, uploaded && styles.primaryBtnDone]}
          onPress={() => setUploaded(true)}
          activeOpacity={0.85}
          disabled={uploaded}
        >
          <Text style={styles.primaryBtnText}>{uploaded ? 'Uploaded ✓' : 'Upload'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 14,
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 18, color: '#0F3D5C', lineHeight: 22 },
  appbarTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  spacer: { flex: 1 },

  body: { paddingHorizontal: 18, paddingBottom: 28 },

  field: { marginBottom: 13 },
  fieldLabel: { fontSize: 11.5, fontWeight: '700', color: '#5C6B7A', marginBottom: 6 },

  // Upload area
  uploadArea: {
    borderWidth: 1.6,
    borderColor: '#DCE4EA',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 26,
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIcon: { fontSize: 24, marginBottom: 8 },
  uploadTitle: { fontSize: 12, fontWeight: '700', color: '#14202E', marginBottom: 2, textAlign: 'center' },
  uploadSub: { fontSize: 10.5, color: '#5C6B7A' },

  // Outline button
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 14,
  },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },

  // Text input
  input: {
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 13,
    color: '#14202E',
    backgroundColor: '#fff',
  },

  // Date input
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
  },
  dateText: { fontSize: 13, color: '#14202E' },
  dateIcon: { fontSize: 14 },
  doneBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#0F3D5C',
    borderRadius: 8,
  },
  doneBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // Checkbox row
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#DCE4EA',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#0F3D5C', borderColor: '#0F3D5C' },
  checkmark: { fontSize: 11, color: '#fff', fontWeight: '800' },
  checkLabel: { fontSize: 11.5, color: '#5C6B7A', flex: 1, lineHeight: 17 },

  // Primary button
  primaryBtn: {
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnDone: { backgroundColor: '#1F8A5F' },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
