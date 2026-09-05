import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import userService from '../../services/userService';
import Screen from '../../components/ui/Screen';
import Toast from '../../components/ui/Toast';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';
import PickerField from '../../components/ui/PickerField';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const SPECIALTIES = ['Emergency Medicine', 'General Medicine', 'Pediatrics'];
const EXPERIENCE  = ['1–2 years', '3–5 years', '6–10 years', '10+ years'];

function formatDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function InputField({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        placeholderTextColor="#A9B8C4"
        autoCapitalize="none"
      />
    </View>
  );
}

function DateField({ label, value, onChange }: {
  label: string;
  value: Date | null;
  onChange: (d: Date) => void;
}) {
  const [show, setShow] = useState(false);
  const pickerValue = value ?? new Date(1990, 0, 1);

  const onPickerChange = (_e: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.field}>
      <FieldLabel label={label} />
      <TouchableOpacity style={styles.dateInput} onPress={() => setShow(true)} activeOpacity={0.8}>
        <Text style={[styles.dateText, !value && { color: '#A9B8C4' }]}>
          {value ? formatDate(value) : 'Select date of birth'}
        </Text>
        <Text style={styles.dateIcon}>📅</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={onPickerChange}
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

export default function EditProfileScreen({ navigation }: Props) {
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [phone,      setPhone]      = useState('');
  const [dob,        setDob]        = useState<Date | null>(null);
  const [initials,   setInitials]   = useState('?');
  const [specialty,  setSpecialty]  = useState(SPECIALTIES[0]);
  const [experience, setExperience] = useState(EXPERIENCE[2]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    (async () => {
      try {
        const data = await userService.getMe();
        setName(data.user.fullName);
        setEmail(data.user.email ?? '');
        setPhone(data.user.phone ?? '');
        setInitials(data.user.fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase());
        if (data.dateOfBirth) setDob(new Date(data.dateOfBirth));
        if (data.profile?.specialty) setSpecialty(data.profile.specialty);
        if (data.profile?.experience) setExperience(data.profile.experience);
      } catch {} finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateMe({
        fullName: name,
        phone,
        dateOfBirth: dob ? dob.toISOString().split('T')[0] : undefined,
        specialty,
        experience,
      });
      navigation.goBack();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save profile.';
      setToast({ visible: true, message: msg, type: 'error' });
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <Screen style={styles.container}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0F3D5C" />
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* App Bar */}
      <View style={styles.appbar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.appbarTitle}>Edit Profile</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Avatar + Change Photo */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarLgText}>{initials}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <InputField label="Full Name"    value={name}  onChangeText={setName} />
        {/* Email is read-only — shown for reference */}
        <View style={styles.field}>
          <FieldLabel label="Email Address" />
          <View style={[styles.input, { justifyContent: 'center', backgroundColor: '#F5F8FA' }]}>
            <Text style={{ fontSize: 13, color: '#8697A6' }}>{email}</Text>
          </View>
        </View>
        <InputField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <DateField  label="Date of Birth" value={dob}  onChange={setDob} />
        <PickerField label="Specialty"            options={SPECIALTIES} value={specialty}  onSelect={setSpecialty} />
        <PickerField label="Years of Experience"  options={EXPERIENCE}  value={experience} onSelect={setExperience} />

        {/* Cancel / Save buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.outlineBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} activeOpacity={0.85} disabled={saving}>
            <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </Screen>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },

  // App bar
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

  // Avatar section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EAF2F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarLgText: { fontSize: 20, fontWeight: '800', color: '#0F3D5C' },
  changePhotoText: { fontSize: 11.5, fontWeight: '700', color: '#175E86' },

  // Field
  field: { marginBottom: 13 },
  fieldLabel: { fontSize: 11.5, fontWeight: '700', color: '#5C6B7A', marginBottom: 6 },

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

  // Button row
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  outlineBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  outlineBtnText: { fontSize: 13, fontWeight: '700', color: '#0F3D5C' },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#0F3D5C',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
