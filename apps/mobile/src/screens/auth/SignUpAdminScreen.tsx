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
import BackButton from '../../components/ui/BackButton';
import PickerField from '../../components/ui/PickerField';

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
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Facility Registration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Input label="Full Name" value={form.fullName} onChangeText={set('fullName')} placeholder="Admin Name" />
        <Input label="Email Address" value={form.email} onChangeText={set('email')} placeholder="admin@hospital.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Phone Number" value={form.phone} onChangeText={set('phone')} placeholder="+91 9876543210" keyboardType="phone-pad" />
        <Input label="Password" value={form.password} onChangeText={set('password')} placeholder="Create password" isPassword />
        <Input label="Confirm Password" value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="Repeat password" isPassword />
        <Input label="Hospital / Clinic Name" value={form.facilityName} onChangeText={set('facilityName')} placeholder="Apollo Hospital" />

        <PickerField
          label="FACILITY TYPE"
          value={form.facilityType}
          placeholder="Select facility type"
          options={['Hospital', 'Clinic', 'Staffing Agency', 'Diagnostic Centre']}
          onSelect={set('facilityType')}
        />

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
    gap: 10,
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 6,
    backgroundColor: '#F5F8FA',
  },
  headerTitle: { fontSize: 16.5, fontWeight: '800', color: '#14202E' },
  body: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 13 },
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
