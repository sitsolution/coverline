import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Screen from '../../components/ui/Screen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import BackButton from '../../components/ui/BackButton';
import PickerField from '../../components/ui/PickerField';
import { adminSchema, validateForm } from '../../utils/validation';
import LegalModal from '../../components/ui/LegalModal';
import authService from '../../services/authService';
import Toast, { ToastType } from '../../components/ui/Toast';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' as ToastType });
  const showToast = (message: string, type: ToastType = 'error') =>
    setToast({ visible: true, message, type });

  const set = (key: keyof typeof form) => (val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const handleSubmit = async () => {
    const errs = await validateForm(adminSchema, form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    if (!agreed) { setErrors((e) => ({ ...e, agreed: 'Please accept the terms to continue' })); return; }

    setLoading(true);
    try {
      await authService.registerAdmin({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        facilityName: form.facilityName,
        facilityType: form.facilityType,
        city: form.city,
      });
      navigation.navigate('OTPVerification', { email: form.email });
    } catch (err: unknown) {
      const detail = (err as any)?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((e: any) => e.msg ?? JSON.stringify(e)).join('\n')
        : (typeof detail === 'string' ? detail : 'Registration failed. Please try again.');
      showToast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Facility Registration</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Input label="Full Name" value={form.fullName} onChangeText={set('fullName')} placeholder="Admin Name" error={errors.fullName} />
        <Input label="Email Address" value={form.email} onChangeText={set('email')} placeholder="admin@hospital.com" keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="Phone Number" value={form.phone} onChangeText={set('phone')} placeholder="+91 9876543210" keyboardType="phone-pad" error={errors.phone} />
        <Input label="Password" value={form.password} onChangeText={set('password')} placeholder="Create password" isPassword error={errors.password} />
        <Input label="Confirm Password" value={form.confirmPassword} onChangeText={set('confirmPassword')} placeholder="Repeat password" isPassword error={errors.confirmPassword} />
        <Input label="Hospital / Clinic Name" value={form.facilityName} onChangeText={set('facilityName')} placeholder="Apollo Hospital" error={errors.facilityName} />

        <PickerField
          label="FACILITY TYPE"
          value={form.facilityType}
          placeholder="Select facility type"
          options={['hospital', 'clinic', 'staffing_agency', 'diagnostic_centre']}
          onSelect={set('facilityType')}
          error={errors.facilityType}
        />

        <Input label="City / Location" value={form.city} onChangeText={set('city')} placeholder="Pune, Maharashtra" error={errors.city} />

        <TouchableOpacity style={styles.checkRow} onPress={() => { setAgreed(!agreed); setErrors((e) => ({ ...e, agreed: '' })); }} activeOpacity={0.7}>
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkTick}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>
            I agree to the{' '}
            <Text style={styles.link} onPress={() => setLegalModal('terms')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.link} onPress={() => setLegalModal('privacy')}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        {errors.agreed ? <Text style={styles.errorText}>{errors.agreed}</Text> : null}

        <LegalModal
          visible={legalModal !== null}
          type={legalModal ?? 'terms'}
          onClose={() => setLegalModal(null)}
          onAccept={() => { setAgreed(true); setErrors((e) => ({ ...e, agreed: '' })); setLegalModal(null); }}
        />

        <Button title="Create Account" onPress={handleSubmit} loading={loading} style={styles.btn} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkHighlight}>Login</Text>
          </Text>
        </TouchableOpacity>
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
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
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
  errorText: { fontSize: 11, color: '#D94F4F', marginBottom: 12, marginLeft: 30 },
  btn: { marginBottom: 16, marginTop: 18 },
  loginLink: { alignItems: 'center', paddingBottom: 8 },
  loginLinkText: { fontSize: 11.5, color: '#5C6B7A' },
  loginLinkHighlight: { color: '#175E86', fontWeight: '600' },
});
