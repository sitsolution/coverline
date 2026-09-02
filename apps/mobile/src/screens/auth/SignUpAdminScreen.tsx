import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUpAdmin'> };

export default function SignUpAdminScreen({ navigation }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    facilityName: '',
    facilityType: '',
    city: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('OTPVerification', { email: form.email });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Facility Registration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Input label="Full Name" value={form.fullName} onChangeText={set('fullName')} placeholder="Admin Name" />
        <Input label="Email Address" value={form.email} onChangeText={set('email')} placeholder="admin@hospital.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone Number" value={form.phone} onChangeText={set('phone')} placeholder="+91 9876543210" keyboardType="phone-pad" />
        <Input label="Password" value={form.password} onChangeText={set('password')} placeholder="Create password" isPassword />
        <Input label="Confirm Password" value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="Repeat password" isPassword />
        <Input label="Hospital / Clinic Name" value={form.facilityName} onChangeText={set('facilityName')} placeholder="Apollo Hospital" />

        <View style={styles.pickerWrapper}>
          <Text style={styles.pickerLabel}>FACILITY TYPE</Text>
          <TouchableOpacity style={styles.picker}>
            <Text style={form.facilityType ? styles.pickerValue : styles.pickerPlaceholder}>
              {form.facilityType || 'Select facility type'}
            </Text>
            <Text style={styles.chevron}>▾</Text>
          </TouchableOpacity>
        </View>

        <Input label="City / Location" value={form.city} onChangeText={set('city')} placeholder="Pune, Maharashtra" />

        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)} activeOpacity={0.7}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkTick}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I agree to the{' '}
            <Text style={styles.link}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <Button title="Create Account" onPress={handleSubmit} loading={loading} disabled={!agreed} style={styles.btn} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: '#F5F8FA',
  },
  backBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE4EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: { fontSize: 16, color: '#0F3D5C', lineHeight: 18 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  body: { padding: 24, paddingBottom: 13 },
  pickerWrapper: { marginBottom: 13 },
  pickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#5C6B7A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.4,
    borderColor: '#DCE4EA',
    borderRadius: 9,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    height: 48,
  },
  pickerPlaceholder: { flex: 1, fontSize: 14, color: '#5C6B7A' },
  pickerValue: { flex: 1, fontSize: 14, color: '#1A1A2E' },
  chevron: { fontSize: 14, color: '#5C6B7A' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#DCE4EA',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: '#0F3D5C', borderColor: '#0F3D5C' },
  checkTick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkLabel: { flex: 1, fontSize: 13, color: '#5C6B7A', lineHeight: 20 },
  link: { color: '#0F3D5C', fontWeight: '600' },
  btn: { marginBottom: 16 },
  loginLink: { alignItems: 'center', paddingBottom: 8 },
  loginLinkText: { fontSize: 11.5, color: '#5C6B7A' },
  loginLinkHighlight: { color: '#175E86', fontWeight: '600' },
});
